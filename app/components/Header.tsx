import { Link } from "@remix-run/react";

type HeaderProps = {
  user?: { email: string; lockedAt: Date | string | null } | null;
  currentPage?: "home" | "ballot" | "portfolio" | "faq";
};

export function Header({ user, currentPage }: HeaderProps) {
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
              </>
            )}
          </div>
        </div>
        <div className="flex justify-center gap-4 border-t border-white/30 py-3 mt-4">
          <Link
            to="/"
            className={`text-lg text-gold-h1 border-r border-white/20 pr-4 ${
              currentPage === "home"
                ? "hover:text-gold-300"
                : "hover:text-zinc-200"
            }`}
          >
            Home
          </Link>
          <Link
            to="/ballot"
            className={`text-lg text-gold-h1 border-r border-white/20 pr-4 ${
              currentPage === "ballot"
                ? "hover:text-gold-300"
                : "hover:text-zinc-200"
            }`}
          >
            Make Selections
          </Link>
          <Link
            to="/portfolio"
            className={`text-lg text-gold-h1 border-r border-white/20 pr-4 ${
              currentPage === "portfolio"
                ? "hover:text-gold-300"
                : "hover:text-zinc-200"
            }`}
          >
            Portfolio
          </Link>
          <Link
            to="/faq"
            className={`text-lg text-gold-h1 ${
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
