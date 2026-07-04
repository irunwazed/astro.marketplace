import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";

interface Errors {
  name?: string;
  description?: string;
}

export default function StoreCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoName, setLogoName] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name) next.name = "Nama toko wajib diisi";
    if (!description) next.description = "Deskripsi toko wajib diisi";
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
        label="Nama Toko"
        name="storeName"
        value={name}
        error={errors.name}
        placeholder="mis. Warung Ibu Ani"
        onChange={setName}
      />
      <div>
        <label htmlFor="storeDescription" className="mb-1 block text-sm font-medium text-ink/80">
          Deskripsi
        </label>
        <textarea
          id="storeDescription"
          name="storeDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ceritakan produk apa yang dijual toko Anda"
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>
      <div>
        <label htmlFor="storeLogo" className="mb-1 block text-sm font-medium text-ink/80">
          Logo <span className="font-normal text-moss">(opsional)</span>
        </label>
        <input
          id="storeLogo"
          name="storeLogo"
          type="file"
          accept="image/*"
          onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? "")}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-moss outline-none file:mr-3 file:rounded-full file:border-0 file:bg-brand/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {logoName && <p className="mt-1 text-xs text-moss">Terpilih: {logoName}</p>}
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Buat Toko
      </button>
      {success && (
        <p className="text-sm text-brand">
          Toko berhasil dibuat (demo) — Anda menjadi owner.{" "}
          <a href="/toko/kelola" className="font-semibold underline">
            Kelola toko sekarang
          </a>
        </p>
      )}
    </form>
  );
}
