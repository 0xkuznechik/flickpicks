import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { BALLOT_CATEGORIES, formatNominee } from "../lib/ballot-data";
import {
  formatOdds,
  calculateProfit,
  calculateTotalReturn,
} from "../lib/betting-utils";
import { prisma } from "../utils/db.server";
import { getUser } from "../utils/auth.server";
import { Header } from "../components/Header";

const MAX_BUDGET = 1000;

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  let pickMap: Record<string, string> = {};
  let betMap: Record<string, number> = {};
  let savedMap: Record<string, boolean> = {};
  let submittedMap: Record<string, boolean> = {};

  // Only fetch picks if user is logged in
  if (user) {
    const picks = await prisma.pick.findMany({
      where: { userId: user.id },
      select: {
        categoryKey: true,
        nominee: true,
        betAmount: true,
        savedAt: true,
        lockedAt: true,
      },
    });

    for (const p of picks) {
      pickMap[p.categoryKey] = p.nominee;
      betMap[p.categoryKey] = parseFloat(p.betAmount.toString());
      savedMap[p.categoryKey] = p.savedAt !== null;
      submittedMap[p.categoryKey] = p.lockedAt !== null;
    }
  }

  return json({
    user,
    pickMap,
    betMap,
    savedMap,
    submittedMap,
    categories: BALLOT_CATEGORIES,
  });
}

type ActionData = { ok: true } | { ok: false; message: string } | undefined;

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request);

  // Require authentication for all actions
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/join?redirectTo=${url.pathname}`);
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  // Submit all saved picks at once (make them permanent)
  if (intent === "submitAll") {
    // Check total budget before submitting
    const allPicks = await prisma.pick.findMany({
      where: { userId: user.id },
      select: { betAmount: true },
    });
    const totalBet = allPicks.reduce(
      (sum, p) => sum + parseFloat(p.betAmount.toString()),
      0
    );

    if (totalBet > MAX_BUDGET) {
      return json<ActionData>(
        {
          ok: false,
          message: `Cannot submit: Your total bets ($${totalBet.toFixed(
            2
          )}) exceed the $${MAX_BUDGET} limit. Please adjust your bet amounts.`,
        },
        { status: 400 }
      );
    }

    // Get all saved but not yet submitted picks
    const picksToSubmit = await prisma.pick.findMany({
      where: {
        userId: user.id,
        savedAt: { not: null },
        lockedAt: null,
        betAmount: { gt: 0 },
      },
    });

    if (picksToSubmit.length === 0) {
      return json<ActionData>(
        { ok: false, message: "No saved picks to submit." },
        { status: 400 }
      );
    }

    // Submit all saved picks by setting lockedAt
    await prisma.pick.updateMany({
      where: {
        userId: user.id,
        savedAt: { not: null },
        lockedAt: null,
        betAmount: { gt: 0 },
      },
      data: { lockedAt: new Date() },
    });

    return redirect("/ballot");
  }

  // Clear all unsaved and unsubmitted picks
  if (intent === "clearUnsaved") {
    await prisma.pick.deleteMany({
      where: {
        userId: user.id,
        lockedAt: null, // Only clear picks that haven't been submitted
      },
    });

    return redirect("/ballot");
  }

  // Save individual pick (temporary)
  if (intent === "savePick") {
    const categoryKey = String(form.get("categoryKey"));

    // Check total budget
    const allPicks = await prisma.pick.findMany({
      where: { userId: user.id },
      select: { betAmount: true },
    });
    const totalBet = allPicks.reduce(
      (sum, p) => sum + parseFloat(p.betAmount.toString()),
      0
    );

    if (totalBet > MAX_BUDGET) {
      return json<ActionData>(
        {
          ok: false,
          message: `Budget exceeded. Your total bets ($${totalBet.toFixed(
            2
          )}) exceed the $${MAX_BUDGET} limit.`,
        },
        { status: 400 }
      );
    }

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
        { ok: false, message: "Pick is already submitted." },
        { status: 400 }
      );
    }

    await prisma.pick.update({
      where: {
        userId_categoryKey: { userId: user.id, categoryKey },
      },
      data: { savedAt: new Date() },
    });

    return json<ActionData>({ ok: true });
  }

  // Unsave individual pick
  if (intent === "unsavePick") {
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
        { ok: false, message: "Cannot unsave a submitted pick." },
        { status: 400 }
      );
    }

    await prisma.pick.update({
      where: {
        userId_categoryKey: { userId: user.id, categoryKey },
      },
      data: { savedAt: null },
    });

    return json<ActionData>({ ok: true });
  }

  // Save bet amount
  if (intent === "saveBetAmount") {
    const categoryKey = String(form.get("categoryKey"));
    const betAmount = parseFloat(String(form.get("betAmount") ?? "0"));

    // Check total budget with new bet amount
    const allPicks = await prisma.pick.findMany({
      where: {
        userId: user.id,
        categoryKey: { not: categoryKey },
      },
      select: { betAmount: true },
    });
    const otherBetsTotal = allPicks.reduce(
      (sum, p) => sum + parseFloat(p.betAmount.toString()),
      0
    );
    const newTotal = otherBetsTotal + betAmount;

    if (newTotal > MAX_BUDGET) {
      return json<ActionData>(
        {
          ok: false,
          message: `Budget exceeded. This bet would bring your total to $${newTotal.toFixed(
            2
          )}, which exceeds the $${MAX_BUDGET} limit.`,
        },
        { status: 400 }
      );
    }

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
  const { user, pickMap, betMap, savedMap, submittedMap, categories } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const locked = Boolean(user?.lockedAt);
  const submit = useSubmit();

  // Optimistic UI for picks
  const [localPicks, setLocalPicks] = useState(pickMap);
  // Bet amounts for each category
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>(betMap);
  // Saved state for each category (temporary)
  const [savedPicks, setSavedPicks] =
    useState<Record<string, boolean>>(savedMap);
  // Submitted state for each category (permanent)
  const [submittedPicks, setSubmittedPicks] =
    useState<Record<string, boolean>>(submittedMap);
  // Confirmation modal state
  const [showSubmitAllModal, setShowSubmitAllModal] = useState(false);
  // Refs for bet amount sections to detect clicks outside
  const betSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Flash message state
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Load from localStorage if not logged in
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const savedPicks = localStorage.getItem("guestPicks");
      const savedBets = localStorage.getItem("guestBets");
      if (savedPicks) {
        try {
          setLocalPicks(JSON.parse(savedPicks));
        } catch (e) {
          console.error("Failed to parse guest picks", e);
        }
      }
      if (savedBets) {
        try {
          setBetAmounts(JSON.parse(savedBets));
        } catch (e) {
          console.error("Failed to parse guest bets", e);
        }
      }
    }
  }, [user]);

  // Sync with server data when logged in
  useEffect(() => {
    if (user) {
      // Check if there are guest picks to save
      if (typeof window !== "undefined") {
        const savedPicks = localStorage.getItem("guestPicks");
        const savedBets = localStorage.getItem("guestBets");

        if (savedPicks || savedBets) {
          // Parse guest data
          const guestPicks = savedPicks ? JSON.parse(savedPicks) : {};
          const guestBets = savedBets ? JSON.parse(savedBets) : {};

          // Save each pick to server
          Object.keys(guestPicks).forEach((categoryKey) => {
            const nominee = guestPicks[categoryKey];
            const betAmount = guestBets[categoryKey] || 0;

            const formData = new FormData();
            formData.append("intent", "save");
            formData.append("categoryKey", categoryKey);
            formData.append("nominee", nominee);
            submit(formData, { method: "post", replace: true });

            // Also save bet amount if present
            if (betAmount > 0) {
              const betFormData = new FormData();
              betFormData.append("intent", "saveBetAmount");
              betFormData.append("categoryKey", categoryKey);
              betFormData.append("nominee", nominee);
              betFormData.append("betAmount", String(betAmount));
              submit(betFormData, { method: "post", replace: true });
            }
          });

          // Clear guest data after saving
          localStorage.removeItem("guestPicks");
          localStorage.removeItem("guestBets");
        }
      }

      setLocalPicks(pickMap);
      setBetAmounts(betMap);
      setSavedPicks(savedMap);
      setSubmittedPicks(submittedMap);
    }
  }, [user, pickMap, betMap, savedMap, submittedMap, submit]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSubmitAllModal) {
        setShowSubmitAllModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showSubmitAllModal]);

  // Handle clicks outside bet amount sections
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check each selected category with a bet section
      Object.keys(localPicks).forEach((categoryKey) => {
        const betSection = betSectionRefs.current[categoryKey];
        const betAmount = betAmounts[categoryKey] || 0;

        // If bet section exists, click is outside it, and bet amount is 0
        if (
          betSection &&
          !betSection.contains(event.target as Node) &&
          betAmount === 0
        ) {
          // Deselect the nominee
          const newPicks = { ...localPicks };
          delete newPicks[categoryKey];
          setLocalPicks(newPicks);

          // If not logged in, update localStorage
          if (!user && typeof window !== "undefined") {
            localStorage.setItem("guestPicks", JSON.stringify(newPicks));
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [localPicks, betAmounts, user]);

  const handleSelect = (categoryKey: string, nominee: string) => {
    // Check if this specific pick is submitted (permanent)
    if (submittedPicks[categoryKey]) return;
    if (locked) return; // Global ballot lock

    const newPicks = { ...localPicks, [categoryKey]: nominee };
    setLocalPicks(newPicks);

    // If not logged in, save to localStorage
    if (!user && typeof window !== "undefined") {
      localStorage.setItem("guestPicks", JSON.stringify(newPicks));
      return;
    }

    // If logged in, auto-save to server
    const formData = new FormData();
    formData.append("intent", "save");
    formData.append("categoryKey", categoryKey);
    formData.append("nominee", nominee);
    submit(formData, { method: "post", replace: true });
  };

  const handleBetAmountChange = (categoryKey: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;

    // Calculate total if this bet were applied
    const totalWithNewBet = categories.reduce((sum, category) => {
      if (category.key === categoryKey) {
        return sum + numAmount;
      }
      return sum + (betAmounts[category.key] || 0);
    }, 0);

    // Only update if it doesn't exceed budget
    if (totalWithNewBet <= MAX_BUDGET) {
      setBetAmounts((prev) => ({ ...prev, [categoryKey]: numAmount }));
    } else {
      // Show flash message
      setFlashMessage("Out of budget!");
      setTimeout(() => setFlashMessage(null), 2000);
    }
  };

  const handleBetAmountBlur = (categoryKey: string, nominee: string) => {
    const betAmount = betAmounts[categoryKey] || 0;

    // If bet amount is 0, deselect the nominee
    if (betAmount === 0) {
      const newPicks = { ...localPicks };
      delete newPicks[categoryKey];
      setLocalPicks(newPicks);

      // If not logged in, update localStorage
      if (!user && typeof window !== "undefined") {
        localStorage.setItem("guestPicks", JSON.stringify(newPicks));
      }
      return;
    }

    // Check if total exceeds budget
    const totalBet = categories.reduce((sum, category) => {
      return sum + (betAmounts[category.key] || 0);
    }, 0);

    if (totalBet > MAX_BUDGET) {
      alert(
        `Your total bets ($${totalBet.toFixed(
          2
        )}) exceed your budget of $${MAX_BUDGET}. Please adjust your bet amounts.`
      );
      return;
    }

    const newBets = {
      ...betAmounts,
      [categoryKey]: betAmount,
    };

    // If not logged in, save to localStorage
    if (!user && typeof window !== "undefined") {
      localStorage.setItem("guestBets", JSON.stringify(newBets));
      return;
    }

    // If logged in, save bet amount to database when input loses focus
    const formData = new FormData();
    formData.append("intent", "saveBetAmount");
    formData.append("categoryKey", categoryKey);
    formData.append("nominee", nominee);
    formData.append("betAmount", String(betAmount));
    submit(formData, { method: "post", replace: true });
  };

  const handleSavePick = (categoryKey: string) => {
    // If not logged in, redirect to sign up
    if (!user) {
      window.location.href = "/join?redirectTo=/ballot";
      return;
    }

    // Check if total exceeds budget
    const totalBet = categories.reduce((sum, category) => {
      return sum + (betAmounts[category.key] || 0);
    }, 0);

    if (totalBet > MAX_BUDGET) {
      alert(
        `Your total bets ($${totalBet.toFixed(
          2
        )}) exceed your budget of $${MAX_BUDGET}. Please adjust your bet amounts before saving.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("intent", "savePick");
    formData.append("categoryKey", categoryKey);
    submit(formData, { method: "post", replace: true });

    // Optimistic update
    setSavedPicks((prev) => ({ ...prev, [categoryKey]: true }));
  };

  const handleUnsavePick = (categoryKey: string) => {
    // If not logged in, redirect to sign up
    if (!user) {
      window.location.href = "/join?redirectTo=/ballot";
      return;
    }

    const formData = new FormData();
    formData.append("intent", "unsavePick");
    formData.append("categoryKey", categoryKey);
    submit(formData, { method: "post", replace: true });

    // Optimistic update
    setSavedPicks((prev) => ({ ...prev, [categoryKey]: false }));
  };

  // Calculate total potential winnings (unsubmitted picks only)
  const calculateTotalPotentialWinnings = () => {
    let total = 0;
    categories.forEach((category) => {
      const isSubmitted = submittedPicks[category.key];
      if (isSubmitted) return; // Skip submitted picks

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

  // Calculate total bet amount across unsubmitted selections only
  const calculateTotalSelectionAmount = () => {
    let total = 0;
    categories.forEach((category) => {
      const isSubmitted = submittedPicks[category.key];
      if (isSubmitted) return; // Skip submitted picks

      const betAmount = betAmounts[category.key] || 0;
      total += betAmount;
    });
    return total;
  };

  // Calculate total return across unsubmitted selections only
  const calculateTotalReturnAmount = () => {
    let total = 0;
    categories.forEach((category) => {
      const isSubmitted = submittedPicks[category.key];
      if (isSubmitted) return; // Skip submitted picks

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

  // Get picks that will be submitted (saved but not yet submitted picks)
  const getPicksToSubmit = () => {
    return categories
      .filter((category) => {
        const selectedNominee = localPicks[category.key];
        const betAmount = betAmounts[category.key] || 0;
        const isSaved = savedPicks[category.key];
        const isSubmitted = submittedPicks[category.key];
        return selectedNominee && betAmount > 0 && isSaved && !isSubmitted;
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

  const handleSubmitAll = () => {
    // If not logged in, redirect to sign up
    if (!user) {
      window.location.href = "/join?redirectTo=/ballot";
      return;
    }

    // Final check before submission
    const totalBet = categories.reduce((sum, category) => {
      return sum + (betAmounts[category.key] || 0);
    }, 0);

    if (totalBet > MAX_BUDGET) {
      alert(
        `Cannot submit: Your total bets ($${totalBet.toFixed(
          2
        )}) exceed your budget of $${MAX_BUDGET}.`
      );
      setShowSubmitAllModal(false);
      return;
    }

    const formData = new FormData();
    formData.append("intent", "submitAll");
    submit(formData, { method: "post" });
    setShowSubmitAllModal(false);
  };

  // Get submitted picks with details
  const getSubmittedPicks = () => {
    return categories
      .filter((category) => {
        const selectedNominee = localPicks[category.key];
        const isSubmitted = submittedPicks[category.key];
        return selectedNominee && isSubmitted;
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

  // Get pending/saved picks with details
  const getPendingPicks = () => {
    return categories
      .filter((category) => {
        const selectedNominee = localPicks[category.key];
        const isSaved = savedPicks[category.key];
        const isSubmitted = submittedPicks[category.key];
        const betAmount = betAmounts[category.key] || 0;
        return selectedNominee && (isSaved || betAmount > 0) && !isSubmitted;
      })
      .map((category) => {
        const selectedNominee = localPicks[category.key];
        const betAmount = betAmounts[category.key] || 0;
        const isSaved = savedPicks[category.key];
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
          isSaved,
        };
      });
  };

  const submittedPicksList = getSubmittedPicks();
  const pendingPicksList = getPendingPicks();

  // Calculate total budget used
  const totalBudgetUsed = categories.reduce((sum, category) => {
    return sum + (betAmounts[category.key] || 0);
  }, 0);
  const remainingBudget = MAX_BUDGET - totalBudgetUsed;
  const budgetExceeded = totalBudgetUsed > MAX_BUDGET;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-gold-500/30">
      <Header
        user={user}
        currentPage="ballot"
        budgetInfo={{
          used: totalBudgetUsed,
          max: MAX_BUDGET,
          remaining: remainingBudget,
          exceeded: budgetExceeded,
        }}
      />

      {/* Flash Message */}
      {flashMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold">
            {flashMessage}
          </div>
        </div>
      )}

      <main className="container-pad py-8">
        {/* Portfolio Card */}
        {(submittedPicksList.length > 0 || pendingPicksList.length > 0) && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-lg border border-white/20 bg-zinc-900/30 overflow-hidden">
              <div className="bg-zinc-900/50 px-6 py-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-gold-400">Your Picks</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Submitted Picks Section */}
                {submittedPicksList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gold-400 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
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
                        Submitted ({submittedPicksList.length})
                      </h3>
                      <div className="text-xs text-zinc-400">
                        Total: $
                        {submittedPicksList
                          .reduce((sum, pick) => sum + pick.betAmount, 0)
                          .toFixed(2)}{" "}
                        → Potential: ${" "}
                        {submittedPicksList
                          .reduce((sum, pick) => sum + pick.totalReturn, 0)
                          .toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {submittedPicksList.map((pick) => (
                        <div
                          key={pick.categoryKey}
                          className="bg-gold-500/5 border border-gold-500/20 rounded p-3 grid grid-cols-[1fr_80px_80px_90px_90px] gap-3 items-center text-xs"
                        >
                          <div>
                            <div className="text-zinc-400 mb-1">
                              {pick.categoryTitle}
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pick.nominee}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-zinc-500 mb-1">Bet</div>
                            <div className="font-mono text-white">
                              ${pick.betAmount.toFixed(2)}
                            </div>
                          </div>
                          {pick.odds ? (
                            <>
                              <div className="text-center">
                                <div className="text-zinc-500 mb-1">Odds</div>
                                <div className="font-mono text-gold-400">
                                  {formatOdds(pick.odds)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-500 mb-1">Profit</div>
                                <div className="font-mono text-gold-400">
                                  ${pick.profit.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-500 mb-1">Return</div>
                                <div className="font-mono text-green-400">
                                  ${pick.totalReturn.toFixed(2)}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div></div>
                              <div></div>
                              <div></div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending/Saved Picks Section */}
                {pendingPicksList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Pending ({pendingPicksList.length})
                      </h3>
                      <div className="text-xs text-zinc-400">
                        Total: $
                        {pendingPicksList
                          .reduce((sum, pick) => sum + pick.betAmount, 0)
                          .toFixed(2)}{" "}
                        → Potential: ${" "}
                        {pendingPicksList
                          .reduce((sum, pick) => sum + pick.totalReturn, 0)
                          .toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {pendingPicksList.map((pick) => (
                        <div
                          key={pick.categoryKey}
                          className={`rounded p-3 grid grid-cols-[1fr_80px_80px_90px_90px] gap-3 items-center text-xs ${
                            pick.isSaved
                              ? "bg-blue-500/5 border border-blue-500/20"
                              : "bg-zinc-800/30 border border-zinc-700/30"
                          }`}
                        >
                          <div>
                            <div className="text-zinc-400 mb-1 flex items-center gap-2">
                              {pick.categoryTitle}
                              {pick.isSaved && (
                                <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                  Saved
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pick.nominee}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-zinc-500 mb-1">Bet</div>
                            <div className="font-mono text-white">
                              ${pick.betAmount.toFixed(2)}
                            </div>
                          </div>
                          {pick.odds ? (
                            <>
                              <div className="text-center">
                                <div className="text-zinc-500 mb-1">Odds</div>
                                <div className="font-mono text-gold-400">
                                  {formatOdds(pick.odds)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-500 mb-1">Profit</div>
                                <div className="font-mono text-gold-400">
                                  ${pick.profit.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-500 mb-1">Return</div>
                                <div className="font-mono text-green-400">
                                  ${pick.totalReturn.toFixed(2)}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div></div>
                              <div></div>
                              <div></div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {locked && (
                  <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 text-center">
                    Ballot is locked.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid - Single Column */}
        <div className="max-w-3xl mx-auto space-y-6">
          {categories.map((c) => (
            <div
              key={c.key}
              className="rounded-lg border border-gold-500/30 bg-black p-1"
            >
              <div className="text-center py-2 border-b border-white/10 bg-zinc-900/40 rounded-t">
                <h3 className="h2">{c.title}</h3>
              </div>
              <div className="p-3 space-y-3">
                {c.nominees.map((nominee) => {
                  const nomineeStr = formatNominee(nominee);
                  const isSelected = localPicks[c.key] === nomineeStr;
                  const isSaved = savedPicks[c.key] || false;
                  const isSubmitted = submittedPicks[c.key] || false;
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
                        disabled={locked || isSubmitted}
                        className={`w-full text-left flex justify-between items-center px-3 py-2 rounded text-[11px] md:text-xs transition-colors ${
                          isSelected
                            ? isSubmitted
                              ? "bg-gold-500/20 text-gold-400 font-semibold border border-gold-500/40"
                              : isSaved
                              ? "bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/40"
                              : "bg-white/10 text-green-400 font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        } ${
                          (locked || isSubmitted) &&
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
                          {isSelected && !isSaved && !isSubmitted && (
                            <span className="text-xs uppercase tracking-wider text-green-500 font-bold bg-green-900/20 px-1.5 py-0.5 rounded">
                              Picked
                            </span>
                          )}
                          {isSelected && isSaved && !isSubmitted && (
                            <span className="text-xs uppercase tracking-wider text-blue-400 font-bold bg-blue-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Saved
                            </span>
                          )}
                          {isSelected && isSubmitted && (
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
                              Submitted
                            </span>
                          )}
                        </span>
                      </button>

                      {isSelected && nominee.odds && (
                        <div
                          ref={(el) => {
                            betSectionRefs.current[c.key] = el;
                          }}
                          className="ml-3 p-3 bg-zinc-900/50 rounded border border-gold-500/20 space-y-2"
                        >
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
                                disabled={locked || isSubmitted}
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

                          {/* Save/Unsave Buttons */}
                          {!isSubmitted && (
                            <div className="pt-2 border-t border-zinc-700">
                              {!isSaved && (
                                <button
                                  onClick={() => handleSavePick(c.key)}
                                  disabled={
                                    locked || betAmount <= 0 || budgetExceeded
                                  }
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  {user ? "Save This Pick" : "Sign Up to Save"}
                                </button>
                              )}
                              {isSaved && (
                                <button
                                  onClick={() => handleUnsavePick(c.key)}
                                  disabled={locked}
                                  className="w-full px-3 py-2 text-xs font-medium bg-zinc-800 border border-zinc-600 text-zinc-300 rounded hover:bg-zinc-700 hover:border-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Unsave This Pick
                                </button>
                              )}
                            </div>
                          )}
                          {isSubmitted && (
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
                                This pick is submitted
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
          {/* Submit All Picks Button */}
          {!locked && getPicksToSubmit().length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (budgetExceeded) {
                    alert(
                      `Cannot submit: Your total bets exceed your budget of $${MAX_BUDGET}.`
                    );
                    return;
                  }
                  user
                    ? setShowSubmitAllModal(true)
                    : (window.location.href = "/join?redirectTo=/ballot");
                }}
                disabled={budgetExceeded}
                className={`rounded-full px-8 py-3 font-bold transition-all ${
                  budgetExceeded
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    : "bg-gold-400 text-black shadow-[0_0_20px_rgba(231,200,106,0.3)] hover:bg-gold-500 hover:shadow-[0_0_30px_rgba(231,200,106,0.5)]"
                }`}
              >
                {budgetExceeded
                  ? "Budget Exceeded"
                  : user
                  ? "Submit All Saved Picks"
                  : "Sign Up to Submit"}
              </button>
            </div>
          )}

          {/* Clear Unsaved Picks Button */}
          {!locked &&
            Object.keys(localPicks).some((key) => !submittedPicks[key]) && (
              <div className="flex justify-center">
                <Form method="post">
                  <input type="hidden" name="intent" value="clearUnsaved" />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (
                        !confirm(
                          "Are you sure you want to clear all unsaved selections? This cannot be undone."
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="rounded-full bg-zinc-800 px-8 py-3 font-medium text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-500 transition-all"
                  >
                    Clear Unsaved Picks
                  </button>
                </Form>
              </div>
            )}
        </div>
      </main>

      {/* Submit All Confirmation Modal */}
      {showSubmitAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-gold-500/30 bg-zinc-900 p-6">
            <h2 className="font-[var(--font-inter)] text-5xl text-gold-400 mb-4">
              Confirm Submit All Picks
            </h2>
            <p className="text-zinc-300 text-sm mb-6">
              You are about to submit the following saved picks. Once submitted,
              you won't be able to change them unless you unlock them first.
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
                  {getPicksToSubmit().map((pick) => (
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
                      {getPicksToSubmit()
                        .reduce((sum, pick) => sum + pick.betAmount, 0)
                        .toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-gold-400 font-mono">
                      $
                      {getPicksToSubmit()
                        .reduce((sum, pick) => sum + pick.profit, 0)
                        .toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-green-400 font-mono">
                      $
                      {getPicksToSubmit()
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
                onClick={() => setShowSubmitAllModal(false)}
                className="px-6 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAll}
                className="px-6 py-2 rounded-lg bg-gold-400 text-black font-bold hover:bg-gold-500 transition-colors"
              >
                Confirm & Submit All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
