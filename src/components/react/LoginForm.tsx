import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";

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
    setSuccess(Object.keys(next).length === 0);
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
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Login
      </button>
      {success && (
        <p className="text-sm text-green-600">Form valid (demo, belum terhubung ke backend).</p>
      )}
      <p className="text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <a href="/register" className="font-medium text-slate-900 hover:underline">
          Daftar
        </a>
      </p>
    </form>
  );
}
