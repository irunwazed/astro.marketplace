import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";
import type { UserProfile } from "../../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
  name?: string;
  email?: string;
}

interface Props {
  user: UserProfile;
}

export default function ProfileForm({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name) next.name = "Nama wajib diisi";
    if (!email) next.email = "Email wajib diisi";
    else if (!EMAIL_REGEX.test(email)) next.email = "Format email tidak valid";
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
        onChange={setEmail}
      />
      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Simpan Profil
      </button>
      {success && (
        <p className="text-sm text-green-600">Profil disimpan (demo, belum terhubung ke backend).</p>
      )}
    </form>
  );
}
