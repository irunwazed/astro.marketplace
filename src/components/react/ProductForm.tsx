import { useState, type SyntheticEvent } from "react";
import FormField from "./FormField";
import { cn } from "../../lib/utils";

interface Errors {
  name?: string;
  price?: string;
  stock?: string;
  volume?: string;
  categories?: string;
  description?: string;
}

interface Props {
  /** Daftar kategori produk (master) untuk pilihan multi-kategori. */
  categoryOptions: string[];
}

export default function ProductForm({ categoryOptions }: Props) {
  const [photoName, setPhotoName] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [volume, setVolume] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const toggleCategory = (c: string) =>
    setCategories(
      categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c],
    );

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name) next.name = "Nama produk wajib diisi";
    if (!price) next.price = "Harga wajib diisi";
    else if (Number(price) <= 0) next.price = "Harga harus lebih dari 0";
    if (!stock) next.stock = "Stok wajib diisi";
    else if (Number(stock) < 0) next.stock = "Stok tidak boleh negatif";
    if (!volume) next.volume = "Volume/berat wajib diisi, mis. 250 gr";
    if (categories.length === 0) next.categories = "Pilih minimal satu kategori";
    if (!description) next.description = "Penjelasan produk wajib diisi";
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
      <div>
        <label htmlFor="photo" className="mb-1 block text-sm font-medium text-ink/80">
          Foto produk
        </label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-moss outline-none file:mr-3 file:rounded-full file:border-0 file:bg-forest/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-forest focus:border-forest focus:ring-2 focus:ring-forest/20"
        />
        {photoName && <p className="mt-1 text-xs text-moss">Terpilih: {photoName}</p>}
      </div>

      <FormField
        label="Nama Produk"
        name="name"
        value={name}
        error={errors.name}
        placeholder="mis. Kopi Robusta Lokal Sangrai 250gr"
        onChange={setName}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Harga (Rp)"
          name="price"
          type="number"
          value={price}
          error={errors.price}
          placeholder="38000"
          onChange={setPrice}
        />
        <FormField
          label="Stok"
          name="stock"
          type="number"
          value={stock}
          error={errors.stock}
          placeholder="48"
          onChange={setStock}
        />
        <FormField
          label="Volume / Berat"
          name="volume"
          value={volume}
          error={errors.volume}
          placeholder="250 gr"
          onChange={setVolume}
        />
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-ink/80">
          Kategori <span className="font-normal text-moss">(bisa lebih dari satu)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((c) => {
            const active = categories.includes(c);
            return (
              <label
                key={c}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-forest bg-forest text-white"
                    : "border-ink/10 bg-white text-ink/80 hover:border-forest hover:text-forest",
                )}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleCategory(c)}
                  className="sr-only"
                />
                {c}
              </label>
            );
          })}
        </div>
        {errors.categories && <p className="mt-1 text-xs text-red-600">{errors.categories}</p>}
      </fieldset>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink/80">
          Penjelasan produk
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Bahan, keunggulan, cara penyimpanan, dan info lainnya"
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-ink/80">Status</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="publish"
              checked={publishNow}
              onChange={() => setPublishNow(true)}
              className="h-4 w-4 accent-forest"
            />
            Publish langsung
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="publish"
              checked={!publishNow}
              onChange={() => setPublishNow(false)}
              className="h-4 w-4 accent-forest"
            />
            Simpan sebagai draft
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
      >
        Simpan Produk
      </button>
      {success && (
        <p className="text-sm text-forest">
          Produk tersimpan sebagai {publishNow ? "PUBLISHED — tayang di katalog" : "DRAFT"} (demo).{" "}
          <a href="/toko/kelola" className="font-semibold underline">
            Kembali ke kelola toko
          </a>
        </p>
      )}
    </form>
  );
}
