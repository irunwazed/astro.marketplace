import { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import { getSession, initialsOf, logout, type Session } from "../../lib/session";
import type { UserProfile } from "../../types";

const quickLinks = [
  { label: "Toko Saya", hint: "Kelola toko & produk", href: "/toko" },
  { label: "Pesanan Saya", hint: "Lacak status belanja", href: "/orders" },
  { label: "Keranjang", hint: "Lanjutkan belanja", href: "/cart" },
];

export default function ProfileView() {
  // undefined = belum dibaca dari localStorage (hindari kedipan saat hidrasi)
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (session === undefined) return null;

  if (!session) {
    return (
      <div className="rounded-xl border border-ink/10 bg-white p-8 text-center shadow-sm shadow-ink/5">
        <p className="font-display text-xl font-bold">Anda belum masuk</p>
        <p className="mt-2 text-sm text-moss">
          Masuk untuk melihat profil, toko, dan pesanan Anda.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/login"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Masuk
          </a>
          <a
            href="/register"
            className="rounded-full border border-ink/10 bg-white px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Daftar
          </a>
        </div>
      </div>
    );
  }

  const profile: UserProfile = {
    name: session.name,
    email: session.email,
    bio: "Anggota koperasi aktif, langganan produk UMKM lokal.",
    avatar: "",
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand font-display text-2xl font-bold text-white"
          aria-hidden="true"
        >
          {initialsOf(session.name)}
        </span>
        <div className="text-center">
          <p className="font-display text-xl font-bold">{session.name}</p>
          <p className="text-sm text-moss">{session.email}</p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="block rounded-xl border border-ink/10 bg-white p-4 transition-colors hover:border-brand"
            >
              <span className="block text-sm font-bold">{link.label}</span>
              <span className="mt-0.5 block text-xs text-moss">{link.hint}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm shadow-ink/5">
        <h2 className="mb-4 font-display text-lg font-bold">Ubah Profil</h2>
        <ProfileForm user={profile} />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-full border border-rose px-5 py-2 text-sm font-semibold text-rose transition-colors hover:bg-rose hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Keluar
      </button>
    </div>
  );
}
