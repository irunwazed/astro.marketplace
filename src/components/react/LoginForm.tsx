import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";
import { login, nameFromEmail } from "../../lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!email) next.email = "Email wajib diisi";
    else if (!EMAIL_REGEX.test(email)) next.email = "Format email tidak valid";
    if (!password) next.password = "Password wajib diisi";
    else if (password.length < 6) next.password = "Password minimal 6 karakter";
    return next;
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    const valid = Object.keys(next).length === 0;
    setSuccess(valid);
    if (valid) {
      // Sesi demo: tanpa backend, nama diambil dari alamat email.
      login({ name: nameFromEmail(email), email });
      setTimeout(() => {
        window.location.href = "/profile";
      }, 600);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        label="Password"
        name="password"
        type="password"
        value={password}
        error={errors.password}
        placeholder="••••••••"
        onChange={setPassword}
      />
      <button
        type="submit"
        className="w-full rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
      >
        Masuk
      </button>
      {success && (
        <p className="text-sm text-forest">Berhasil masuk — mengalihkan ke profil…</p>
      )}
      <p className="text-center text-sm text-moss">
        Belum punya akun?{" "}
        <a href="/register" className="font-semibold text-forest hover:underline">
          Daftar
        </a>
      </p>
    </form>
  );
}
