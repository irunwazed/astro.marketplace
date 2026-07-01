import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name) next.name = "Nama wajib diisi";
    if (!email) next.email = "Email wajib diisi";
    else if (!EMAIL_REGEX.test(email)) next.email = "Format email tidak valid";
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
    setSuccess(Object.keys(next).length === 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nama" name="name" value={name} error={errors.name} onChange={setName} />
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
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Daftar
      </button>
      {success && (
        <p className="text-sm text-green-600">Form valid (demo, belum terhubung ke backend).</p>
      )}
      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <a href="/login" className="font-medium text-slate-900 hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}
