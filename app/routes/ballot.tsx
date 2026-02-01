import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { BALLOT_CATEGORIES, formatNominee } from "../lib/ballot-data";
import {
  formatOdds,
  calculateProfit,
  calculateTotalReturn,
} from "../lib/betting-utils";
import { prisma } from "../utils/db.server";
import { requireUser } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const picks = await prisma.pick.findMany({
    where: { userId: user.id },
    select: {
      categoryKey: true,
      nominee: true,
      betAmount: true,
      lockedAt: true,
    },
  });

  const pickMap: Record<string, string> = {};
  const betMap: Record<string, number> = {};
  const lockedMap: Record<string, boolean> = {};

  for (const p of picks) {
    pickMap[p.categoryKey] = p.nominee;
    betMap[p.categoryKey] = parseFloat(p.betAmount.toString());
    lockedMap[p.categoryKey] = p.lockedAt !== null;
  }

  return json({
    user,
    pickMap,
    betMap,
    lockedMap,
    categories: BALLOT_CATEGORIES,
  });
}

type ActionData = { ok: true } | { ok: false; message: string } | undefined;

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  // Lock all picks at once
  if (intent === "lockAll") {
    // Get all unlocked picks with bet amounts
    const picksToLock = await prisma.pick.findMany({
      where: {
        userId: user.id,
        lockedAt: null,
        betAmount: { gt: 0 },
      },
    });

    if (picksToLock.length === 0) {
      return json<ActionData>(
        { ok: false, message: "No picks with bet amounts to lock." },
        { status: 400 }
      );
    }

    // Lock all picks
    await prisma.pick.updateMany({
      where: {
        userId: user.id,
        lockedAt: null,
        betAmount: { gt: 0 },
      },
      data: { lockedAt: new Date() },
    });

    return redirect("/portfolio");
  }

  // Clear all unlocked picks
  if (intent === "clearUnlocked") {
    await prisma.pick.deleteMany({
      where: {
        userId: user.id,
        lockedAt: null,
      },
    });

    return redirect("/ballot");
  }

  // Lock individual pick
  if (intent === "lockPick") {
    const categoryKey = String(form.get("categoryKey"));
    // Check if pick exists
    const pick = await prisma.pick.findUnique({
      where: {
        userId_categoryKey: { userId: user.id, categoryKey },
      },
    });

    if (!pick) {
      return json<ActionData>(
        { ok: false, message: "Pick not found." },
        { status: 400 }
      );
    }

    if (pick.lockedAt) {
      return json<ActionData>(
        { ok: false, message: "Pick is already locked." },
        { status: 400 }
      );
    }

    await prisma.pick.update({
      where: {
        userId_categoryKey: { userId: user.id, categoryKey },
      },
      data: { lockedAt: new Date() },
    });

    return json<ActionData>({ ok: true });
  }

  // Save bet amount
  if (intent === "saveBetAmount") {
    const categoryKey = String(form.get("categoryKey"));
    const betAmount = parseFloat(String(form.get("betAmount") ?? "0"));

    // Check if pick is locked
    const pick = await prisma.pick.findUnique({
      where: {
        userId_categoryKey: { userId: user.id, categoryKey },
      },
      select: { lockedAt: true },
    });

    if (pick?.lockedAt) {
      return json<ActionData>(
        { ok: false, message: "Cannot modify locked pick." },
        { status: 400 }
      );
    }

    // Update or create pick with bet amount
    await prisma.pick.upsert({
      where: {
        userId_categoryKey: { userId: user.id, categoryKey },
      },
      create: {
        userId: user.id,
        categoryKey,
        nominee: String(form.get("nominee") ?? ""),
        betAmount,
      },
      update: { betAmount },
    });

    return json<ActionData>({ ok: true });
  }

  // Handle single category update (auto-save nominee selection)
  const categoryKey = form.get("categoryKey");
  const nominee = form.get("nominee");

  if (categoryKey && nominee) {
    // Check if pick is locked
    const pick = await prisma.pick.findUnique({
      where: {
        userId_categoryKey: {
          userId: user.id,
          categoryKey: String(categoryKey),
        },
      },
      select: { lockedAt: true },
    });

    if (pick?.lockedAt) {
      return json<ActionData>(
        { ok: false, message: "Cannot modify locked pick." },
        { status: 400 }
      );
    }

    await prisma.pick.upsert({
      where: {
        userId_categoryKey: {
          userId: user.id,
          categoryKey: String(categoryKey),
        },
      },
      create: {
        userId: user.id,
        categoryKey: String(categoryKey),
        nominee: String(nominee),
      },
      update: { nominee: String(nominee) },
    });
  }

  return json<ActionData>({ ok: true });
}

export default function Ballot() {
  const { user, pickMap, betMap, lockedMap, categories } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const locked = Boolean(user.lockedAt);
  const submit = useSubmit();

  // Optimistic UI for picks
  const [localPicks, setLocalPicks] = useState(pickMap);
  // Bet amounts for each category
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>(betMap);
  // Locked state for each category
  const [lockedPicks, setLockedPicks] =
    useState<Record<string, boolean>>(lockedMap);
  // Confirmation modal state
  const [showLockAllModal, setShowLockAllModal] = useState(false);

  // Sync with server data
  useEffect(() => {
    setLocalPicks(pickMap);
    setBetAmounts(betMap);
    setLockedPicks(lockedMap);
  }, [pickMap, betMap, lockedMap]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLockAllModal) {
        setShowLockAllModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showLockAllModal]);

  const handleSelect = (categoryKey: string, nominee: string) => {
    // Check if this specific pick is locked
    if (lockedPicks[categoryKey]) return;
    if (locked) return; // Global ballot lock

    setLocalPicks((prev) => ({ ...prev, [categoryKey]: nominee }));

    // Auto-save on selection
    const formData = new FormData();
    formData.append("intent", "save");
    formData.append("categoryKey", categoryKey);
    formData.append("nominee", nominee);
    submit(formData, { method: "post", replace: true });
  };

  const handleBetAmountChange = (categoryKey: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setBetAmounts((prev) => ({ ...prev, [categoryKey]: numAmount }));
  };

  const handleBetAmountBlur = (categoryKey: string, nominee: string) => {
    // Save bet amount to database when input loses focus
    const formData = new FormData();
    formData.append("intent", "saveBetAmount");
    formData.append("categoryKey", categoryKey);
    formData.append("nominee", nominee);
    formData.append("betAmount", String(betAmounts[categoryKey] || 0));
    submit(formData, { method: "post", replace: true });
  };

  const handleLockPick = (categoryKey: string) => {
    const formData = new FormData();
    formData.append("intent", "lockPick");
    formData.append("categoryKey", categoryKey);
    submit(formData, { method: "post", replace: true });

    // Optimistic update
    setLockedPicks((prev) => ({ ...prev, [categoryKey]: true }));
  };

  // Calculate total potential winnings (unlocked picks only)
  const calculateTotalPotentialWinnings = () => {
    let total = 0;
    categories.forEach((category) => {
      const isLocked = lockedPicks[category.key];
      if (isLocked) return; // Skip locked picks

      const selectedNominee = localPicks[category.key];
      const betAmount = betAmounts[category.key] || 0;
      if (selectedNominee && betAmount > 0) {
        const nominee = category.nominees.find(
          (n) => formatNominee(n) === selectedNominee
        );
        if (nominee?.odds) {
          const profit = calculateProfit(betAmount, nominee.odds);
          total += profit;
        }
      }
    });
    return total;
  };

  // Calculate total bet amount across unlocked selections only
  const calculateTotalSelectionAmount = () => {
    let total = 0;
    categories.forEach((category) => {
      const isLocked = lockedPicks[category.key];
      if (isLocked) return; // Skip locked picks

      const betAmount = betAmounts[category.key] || 0;
      total += betAmount;
    });
    return total;
  };

  // Calculate total return across unlocked selections only
  const calculateTotalReturnAmount = () => {
    let total = 0;
    categories.forEach((category) => {
      const isLocked = lockedPicks[category.key];
      if (isLocked) return; // Skip locked picks

      const selectedNominee = localPicks[category.key];
      const betAmount = betAmounts[category.key] || 0;
      if (selectedNominee && betAmount > 0) {
        const nominee = category.nominees.find(
          (n) => formatNominee(n) === selectedNominee
        );
        if (nominee?.odds) {
          const totalReturn = calculateTotalReturn(betAmount, nominee.odds);
          total += totalReturn;
        }
      }
    });
    return total;
  };

  // Get picks that will be locked (unlocked picks with bet amounts)
  const getPicksToLock = () => {
    return categories
      .filter((category) => {
        const selectedNominee = localPicks[category.key];
        const betAmount = betAmounts[category.key] || 0;
        const isLocked = lockedPicks[category.key];
        return selectedNominee && betAmount > 0 && !isLocked;
      })
      .map((category) => {
        const selectedNominee = localPicks[category.key];
        const betAmount = betAmounts[category.key] || 0;
        const nominee = category.nominees.find(
          (n) => formatNominee(n) === selectedNominee
        );
        const odds = nominee?.odds || null;
        const profit =
          odds && betAmount > 0 ? calculateProfit(betAmount, odds) : 0;
        const totalReturn =
          odds && betAmount > 0 ? calculateTotalReturn(betAmount, odds) : 0;

        return {
          categoryKey: category.key,
          categoryTitle: category.title,
          nominee: selectedNominee,
          odds,
          betAmount,
          profit,
          totalReturn,
        };
      });
  };

  const handleLockAll = () => {
    const formData = new FormData();
    formData.append("intent", "lockAll");
    submit(formData, { method: "post" });
    setShowLockAllModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-black">
        {/* Navigation */}
        <nav className="border-b border-white/10 bg-black py-4">
          <div className="container-pad flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <span className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
                FLICK
              </span>
              <img
                src="/images/oscarspoollogo.png"
                alt="Logo"
                className="h-10 w-auto"
              />
              <span className="font-[var(--font-inter)] text-5xl tracking-widest text-gold-400">
                PICKS
              </span>
            </div>
            <div className="flex-1 flex justify-end gap-4 items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-zinc-400">{user.email}</span>
              </div>
              <Link
                to="/logout"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-8 border-t border-white/10 py-3 text-2xl font-medium tracking-wide text-zinc-400">
            <Link to="/" className="hover:text-zinc-200">
              Home
            </Link>
            <Link to="/ballot" className="text-gold-400 hover:text-gold-300">
              Make Selections
            </Link>
            <Link to="/portfolio" className="hover:text-zinc-200">
              Portfolio
            </Link>
            <Link to="/faq" className="hover:text-zinc-200">
              FAQ
            </Link>
          </div>
        </nav>

        {/* Header Stats */}
        <div className="text-center space-y-6 py-6 border-b border-white/10 bg-black">
          <div className="flex justify-center gap-0 md:justify-center border border-gold-400/40 rounded-lg overflow-hidden max-w-6xl mx-auto divide-x divide-gold-400/40">
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Total Selection Amount
              </div>
              <div className="text-lg md:text-xl font-bold text-white">
                ${calculateTotalSelectionAmount().toFixed(2)}
              </div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Potential Profit
              </div>
              <div className="text-lg md:text-xl font-bold text-gold-400">
                ${calculateTotalPotentialWinnings().toFixed(2)}
              </div>
            </div>
            <div className="flex-1 bg-black p-3 text-center">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                Total Return
              </div>
              <div className="text-lg md:text-xl font-bold text-green-400">
                ${calculateTotalReturnAmount().toFixed(2)}
              </div>
            </div>
          </div>

          {locked && (
            <div className="inline-block rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              Ballot is locked.
            </div>
          )}
        </div>
      </div>

      <main className="container-pad py-8">
        {/* Categories Grid - Single Column */}
        <div className="max-w-3xl mx-auto space-y-6">
          {categories.map((c) => (
            <div
              key={c.key}
              className="rounded-lg border border-gold-500/30 bg-black p-1"
            >
              <div className="text-center py-2 border-b border-white/10 bg-zinc-900/40 rounded-t">
                <h3 className="font-[var(--font-inter)] text-xl text-zinc-100">
                  {c.title}
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {c.nominees.map((nominee) => {
                  const nomineeStr = formatNominee(nominee);
                  const isSelected = localPicks[c.key] === nomineeStr;
                  const isLocked = lockedPicks[c.key] || false;
                  const betAmount = betAmounts[c.key] || 0;
                  const profit =
                    isSelected && nominee.odds && betAmount > 0
                      ? calculateProfit(betAmount, nominee.odds)
                      : 0;
                  const totalReturn =
                    isSelected && nominee.odds && betAmount > 0
                      ? calculateTotalReturn(betAmount, nominee.odds)
                      : 0;

                  return (
                    <div key={nomineeStr} className="space-y-2">
                      <button
                        onClick={() => handleSelect(c.key, nomineeStr)}
                        disabled={locked || isLocked}
                        className={`w-full text-left flex justify-between items-center px-3 py-2 rounded text-[11px] md:text-xs transition-colors ${
                          isSelected
                            ? isLocked
                              ? "bg-gold-500/20 text-gold-400 font-semibold border border-gold-500/40"
                              : "bg-white/10 text-green-400 font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        } ${
                          (locked || isLocked) &&
                          "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{nomineeStr}</span>
                          {nominee.odds && (
                            <span className="text-[11px] md:text-xs text-gold-400 font-mono">
                              {formatOdds(nominee.odds)}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-2">
                          {isSelected && !isLocked && (
                            <span className="text-xs uppercase tracking-wider text-green-500 font-bold bg-green-900/20 px-1.5 py-0.5 rounded">
                              Picked
                            </span>
                          )}
                          {isSelected && isLocked && (
                            <span className="text-xs uppercase tracking-wider text-gold-400 font-bold bg-gold-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              Locked
                            </span>
                          )}
                        </span>
                      </button>

                      {isSelected && nominee.odds && (
                        <div className="ml-3 p-3 bg-zinc-900/50 rounded border border-gold-500/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] md:text-[11px] text-zinc-400 whitespace-nowrap">
                              Bet Amount:
                            </label>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] md:text-[11px] text-zinc-500">
                                $
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={betAmount || ""}
                                onChange={(e) =>
                                  handleBetAmountChange(c.key, e.target.value)
                                }
                                onBlur={() =>
                                  handleBetAmountBlur(c.key, nomineeStr)
                                }
                                disabled={locked || isLocked}
                                placeholder="0.00"
                                className="w-full pl-5 pr-2 py-1 bg-black border border-zinc-700 rounded text-[10px] md:text-[11px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-500 disabled:opacity-60 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          {betAmount > 0 && (
                            <div className="text-xs space-y-1 pt-2 border-t border-zinc-700">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">
                                  Potential Profit:
                                </span>
                                <span className="text-gold-400 font-mono font-semibold">
                                  ${profit.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">
                                  Total Return:
                                </span>
                                <span className="text-green-400 font-mono font-semibold">
                                  ${totalReturn.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Lock Button (only show if not locked) */}
                          {!isLocked && (
                            <div className="pt-2 border-t border-zinc-700">
                              <button
                                onClick={() => handleLockPick(c.key)}
                                disabled={locked || betAmount <= 0}
                                className="w-full px-3 py-2 text-xs font-medium bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded hover:bg-gold-500/20 hover:border-gold-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                                Lock This Pick
                              </button>
                            </div>
                          )}
                          {isLocked && (
                            <div className="pt-2 border-t border-zinc-700 text-center">
                              <div className="text-xs text-gold-400/70 italic flex items-center justify-center gap-2">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                                This pick is locked
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="max-w-3xl mx-auto mt-8 space-y-4">
          {/* Lock All Picks Button */}
          {!locked && getPicksToLock().length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowLockAllModal(true)}
                className="rounded-full bg-gold-400 px-8 py-3 font-bold text-black shadow-[0_0_20px_rgba(231,200,106,0.3)] hover:bg-gold-500 hover:shadow-[0_0_30px_rgba(231,200,106,0.5)] transition-all"
              >
                Lock All Picks
              </button>
            </div>
          )}

          {/* Clear Unlocked Picks Button */}
          {!locked &&
            Object.keys(localPicks).some((key) => !lockedPicks[key]) && (
              <div className="flex justify-center">
                <Form method="post">
                  <input type="hidden" name="intent" value="clearUnlocked" />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (
                        !confirm(
                          "Are you sure you want to clear all unlocked selections? This cannot be undone."
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="rounded-full bg-zinc-800 px-8 py-3 font-medium text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-500 transition-all"
                  >
                    Clear Unlocked Picks
                  </button>
                </Form>
              </div>
            )}
        </div>
      </main>

      {/* Lock All Confirmation Modal */}
      {showLockAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-gold-500/30 bg-zinc-900 p-6">
            <h2 className="font-[var(--font-inter)] text-5xl text-gold-400 mb-4">
              Confirm Lock All Picks
            </h2>
            <p className="text-zinc-300 text-sm mb-6">
              You are about to lock the following picks. Once locked, you won't
              be able to change them unless you unlock them first.
            </p>

            {/* Summary Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gold-500/30">
                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Category
                    </th>
                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Nominee
                    </th>
                    <th className="text-center p-3 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Odds
                    </th>
                    <th className="text-right p-3 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Bet
                    </th>
                    <th className="text-right p-3 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Profit
                    </th>
                    <th className="text-right p-3 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Return
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getPicksToLock().map((pick) => (
                    <tr
                      key={pick.categoryKey}
                      className="border-b border-white/10"
                    >
                      <td className="p-3 text-zinc-300">
                        {pick.categoryTitle}
                      </td>
                      <td className="p-3 text-white font-medium">
                        {pick.nominee}
                      </td>
                      <td className="p-3 text-center text-gold-400 font-mono">
                        {pick.odds ? formatOdds(pick.odds) : "—"}
                      </td>
                      <td className="p-3 text-right text-white font-mono">
                        ${pick.betAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gold-400 font-mono font-semibold">
                        ${pick.profit.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-green-400 font-mono font-semibold">
                        ${pick.totalReturn.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="border-t-2 border-gold-500/50 bg-zinc-800/40">
                    <td
                      colSpan={3}
                      className="p-3 text-xs font-bold uppercase tracking-widest text-gold-400"
                    >
                      Totals
                    </td>
                    <td className="p-3 text-right font-bold text-white font-mono">
                      $
                      {getPicksToLock()
                        .reduce((sum, pick) => sum + pick.betAmount, 0)
                        .toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-gold-400 font-mono">
                      $
                      {getPicksToLock()
                        .reduce((sum, pick) => sum + pick.profit, 0)
                        .toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-green-400 font-mono">
                      $
                      {getPicksToLock()
                        .reduce((sum, pick) => sum + pick.totalReturn, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowLockAllModal(false)}
                className="px-6 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLockAll}
                className="px-6 py-2 rounded-lg bg-gold-400 text-black font-bold hover:bg-gold-500 transition-colors"
              >
                Confirm & Lock All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
