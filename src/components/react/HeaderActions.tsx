import { useEffect, useState } from "react";
import { CART_EVENT, cartCount } from "../../lib/cart";
import { SESSION_EVENT, getSession, initialsOf, type Session } from "../../lib/session";

function shortName(name: string): string {
  const parts = name.split(" ");
  return parts[1] ? `${parts[0]} ${parts[1][0]}.` : parts[0];
}

export default function HeaderActions() {
  const [count, setCount] = useState(0);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sync = () => {
      setCount(cartCount());
      setSession(getSession());
    };
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      <button
        type="button"
        aria-label="Wishlist"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-forest hover:text-forest"
      >
        <svg
          className="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 14c1.5-1.5 3-3.4 3-5.5A4.5 4.5 0 0 0 17.5 4c-1.8 0-3 .7-4.1 2l-1.4 1.5L10.6 6C9.5 4.7 8.3 4 6.5 4A4.5 4.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7Z" />
        </svg>
      </button>
      <a
        href="/cart"
        aria-label={`Keranjang, ${count} item`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-forest hover:text-forest"
      >
        <svg
          className="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M2 3h2.5l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.9a1.5 1.5 0 0 0 1.4-1.1L21 8H6" />
        </svg>
        {count > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white"
            aria-hidden="true"
          >
            {count}
          </span>
        )}
      </a>
      {session ? (
        <a
          href="/profile"
          className="flex items-center gap-2 rounded-full border border-ink/10 py-1 pl-1 pr-3 transition-colors hover:border-forest"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-white"
            aria-hidden="true"
          >
            {initialsOf(session.name)}
          </span>
          <span className="text-sm font-semibold">{shortName(session.name)}</span>
        </a>
      ) : (
        <a
          href="/login"
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
        >
          Masuk
        </a>
      )}
    </div>
  );
}
