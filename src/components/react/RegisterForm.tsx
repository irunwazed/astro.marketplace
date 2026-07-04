import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";
import { login } from "../../lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;
const PHONE_REGEX = /^(\+?62|0)8[1-9][0-9]{6,11}$/;

interface Errors {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Generate nomor anggota mock di frontend — sementara sampai backend
 * menyediakan endpoint POST /api/auth/register yang menggenerate nomor anggota
 * server-side. Format: ANG-YYYY-NNNN.
 */
function generateMemberNo(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `ANG-${year}-${seq}`;
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name) next.name = "Nama wajib diisi";
    if (!username) next.username = "Username wajib diisi";
    else if (!USERNAME_REGEX.test(username))
      next.username = "Username 3-20 karakter, hanya huruf/angka/_.";
    if (!email) next.email = "Email wajib diisi";
    else if (!EMAIL_REGEX.test(email)) next.email = "Format email tidak valid";
    if (!phone) next.phone = "Nomor HP wajib diisi";
    else if (!PHONE_REGEX.test(phone.replace(/[\s-]/g, "")))
      next.phone = "Format nomor HP tidak valid (mis. 081234567890)";
    if (!password) next.password = "Password wajib diisi";
    else if (password.length < 6) next.password = "Password minimal 6 karakter";
    if (!confirmPassword) next.confirmPassword = "Konfirmasi password wajib diisi";
    else if (confirmPassword !== password) next.confirmPassword = "Password tidak cocok";
    return next;
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    const valid = Object.keys(next).length === 0;
    setSuccess(valid);
    if (valid) {
      // Sesi demo: akun langsung "terdaftar" dan masuk tanpa backend.
      // Nomor anggota di-generate di frontend untuk demo — nantinya backend
      // (POST /api/auth/register) yang generate & mengembalikannya.
      login({
        name,
        email,
        username,
        phone,
        memberNo: generateMemberNo(),
      });
      setTimeout(() => {
        window.location.href = "/profile";
      }, 600);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nama" name="name" value={name} error={errors.name} onChange={setName} />
      <FormField
        label="Username"
        name="username"
        value={username}
        error={errors.username}
        placeholder="mis. siti_pratiwi"
        onChange={setUsername}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        error={errors.email}
        placeholder="you@example.com"
        onChange={setEmail}
      />
      <FormField
        label="Nomor HP"
        name="phone"
        type="tel"
        value={phone}
        error={errors.phone}
        placeholder="081234567890"
        onChange={setPhone}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={password}
        error={errors.password}
        placeholder="••••••••"
        onChange={setPassword}
      />
      <FormField
        label="Konfirmasi Password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        error={errors.confirmPassword}
        placeholder="••••••••"
        onChange={setConfirmPassword}
      />
      <button
        type="submit"
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Daftar
      </button>
      {success && (
        <p className="text-sm text-brand">Akun terdaftar — mengalihkan ke profil…</p>
      )}
      <p className="text-center text-sm text-moss">
        Sudah punya akun?{" "}
        <a href="/login" className="font-semibold text-brand hover:underline">
          Masuk
        </a>
      </p>
    </form>
  );
}