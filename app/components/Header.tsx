import { Link } from "@remix-run/react";

type HeaderProps = {
  user?: { email: string; lockedAt: Date | string | null } | null;
  currentPage?: "home" | "ballot" | "faq";
  budgetInfo?: {
    used: number;
    max: number;
    remaining: number;
    exceeded: boolean;
  };
};

export function Header({ user, currentPage, budgetInfo }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-black">
      {/* Navigation */}
      <nav className="border-b border-white/30 bg-black py-4">
        <div className="container-pad flex items-center justify-between">
          <div className="flex-1"></div>
          <h1 className="h1 flex items-center gap-3">
            <span className="tracking-widest">FLICK</span>
            <img
              src="/images/oscarspoollogo.png"
              alt="Logo"
              className="h-10 w-auto"
            />
            <span className="tracking-widest">PICKS</span>
          </h1>
          <div className="flex-1 flex justify-end gap-4 items-center">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white border border-zinc-700 px-3 py-1 rounded"
                >
                  Log In
                </Link>
                <Link
                  to="/join"
                  className="text-xs font-semibold uppercase tracking-wider text-black bg-gold-400 hover:bg-gold-500 px-3 py-1 rounded"
                >
                  Sign Up
                </Link>
              </>
            )}
            {user && (
              <>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-zinc-400">{user.email}</span>
                  </div>
                  {budgetInfo && (
                    <div className="text-[10px] font-mono">
                      <span className="text-zinc-500">Budget: </span>
                      <span
                        className={`font-bold ${
                          budgetInfo.exceeded
                            ? "text-red-400"
                            : budgetInfo.remaining < 100
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        ${budgetInfo.remaining.toFixed(2)}
                      </span>
                      <span className="text-zinc-600">
                        {" "}
                        / ${budgetInfo.max.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  to="/logout"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                >
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 border-t border-white/30 py-4 mt-6">
          <Link
            to="/"
            className={`text-lg text-gold-h1 border-r border-white/20 pr-4 leading-none ${
              currentPage === "home"
                ? "hover:text-gold-300"
                : "hover:text-zinc-200"
            }`}
          >
            Home
          </Link>
          <Link
            to="/ballot"
            className={`text-lg text-gold-h1 border-r border-white/20 pr-4 leading-none ${
              currentPage === "ballot"
                ? "hover:text-gold-300"
                : "hover:text-zinc-200"
            }`}
          >
            Make Selections
          </Link>
          <Link
            to="/faq"
            className={`text-lg text-gold-h1 leading-none ${
              currentPage === "faq"
                ? "hover:text-gold-300"
                : "hover:text-zinc-200"
            }`}
          >
            FAQ
          </Link>
        </div>
      </nav>
    </div>
  );
}
