/**
 * Sesi login demo berbasis localStorage — simulasi tanpa backend.
 * Pola sama dengan cart.ts: perubahan disiarkan lewat SESSION_EVENT.
 */
export interface Session {
  name: string;
  email: string;
  /** Username unik anggota. */
  username?: string;
  /** Nomor HP anggota. */
  phone?: string;
  /** Nomor anggota koperasi — di-generate backend saat registrasi. */
  memberNo?: string;
}

const KEY = "pk-session";
export const SESSION_EVENT = "pk-session-change";

export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null") as Session | null;
  } catch {
    return null;
  }
}

export function login(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

/** "siti.pratiwi@example.com" → "Siti Pratiwi" (untuk login demo tanpa field nama). */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ") || "Anggota"
  );
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Wajib login sebelum aksi sensitif (tambah cart, checkout).
 * Bila belum login, redirect ke /login?next=<next> dan kembalikan false.
 * Bila sudah login, kembalikan true tanpa efek samping.
 *
 * `next` adalah URL tujuan setelah login berhasil (mis. halaman saat ini
 * atau URL checkout yang akan dibuka).
 */
export function requireLogin(next: string): boolean {
  if (getSession()) return true;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
  return false;
}
