import { useState, type SyntheticEvent } from "react";
import { cn } from "../../lib/utils";
import { slugify } from "../../lib/slug";
import type { Product } from "../../types";

interface Errors {
  name?: string;
  price?: string;
  stock?: string;
  volume?: string;
  categories?: string;
  description?: string;
  weight?: string;
}

interface Props {
  categoryOptions: string[];
  /** Produk yang diedit (null = mode tambah). */
  editing?: Product | null;
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
  busy?: boolean;
}

const BADGES: Product["badge"][] = [undefined, "Terlaris", "Baru"];

export default function ProductFormFull({
  categoryOptions,
  editing = null,
  onSubmit,
  onCancel,
  busy = false,
}: Props) {
  const [photoPreview, setPhotoPreview] = useState(editing?.image ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!editing);
  const [price, setPrice] = useState(editing ? String(editing.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    editing?.originalPrice ? String(editing.originalPrice) : "",
  );
  const [stock, setStock] = useState(editing ? String(editing.stock) : "");
  const [volume, setVolume] = useState(editing?.volume ?? "");
  const [weight, setWeight] = useState(editing?.weight ? String(editing.weight) : "");
  const [dimL, setDimL] = useState(editing?.dimensions?.length ? String(editing.dimensions.length) : "");
  const [dimW, setDimW] = useState(editing?.dimensions?.width ? String(editing.dimensions.width) : "");
  const [dimH, setDimH] = useState(editing?.dimensions?.height ? String(editing.dimensions.height) : "");
  const [categories, setCategories] = useState<string[]>(editing?.categories ?? []);
  const [badge, setBadge] = useState<Product["badge"]>(editing?.badge ?? undefined);
  const [description, setDescription] = useState(editing?.description ?? "");
  const [publishNow, setPublishNow] = useState(editing?.published ?? true);
  const [errors, setErrors] = useState<Errors>({});

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const toggleCategory = (c: string) =>
    setCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c]);

  const handlePhoto = (e: SyntheticEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Nama produk wajib diisi";
    if (!price) next.price = "Harga wajib diisi";
    else if (Number(price) <= 0) next.price = "Harga harus lebih dari 0";
    if (!stock) next.stock = "Stok wajib diisi";
    else if (Number(stock) < 0) next.stock = "Stok tidak boleh negatif";
    if (!volume.trim()) next.volume = "Volume/berat wajib diisi, mis. 250 gr";
    if (weight && Number(weight) < 0) next.weight = "Berat tidak boleh negatif";
    if (categories.length === 0) next.categories = "Pilih minimal satu kategori";
    if (!description.trim()) next.description = "Penjelasan produk wajib diisi";
    return next;
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const data: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: photoPreview,
      category: categories[0],
      categories,
      badge,
      stock: Number(stock),
      volume: volume.trim(),
      weight: weight ? Number(weight) : undefined,
      dimensions:
        dimL && dimW && dimH
          ? { length: Number(dimL), width: Number(dimW), height: Number(dimH) }
          : undefined,
      description: description.trim(),
      published: publishNow,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Foto */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/80">Foto produk</label>
        <div className="flex items-center gap-4">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="h-20 w-20 shrink-0 rounded-lg border border-ink/10 object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm text-moss outline-none file:mr-3 file:rounded-full file:border-0 file:bg-brand/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Nama + slug */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/80">Nama Produk</label>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="mis. Kopi Robusta Lokal Sangrai 250gr"
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
            errors.name ? "border-red-400" : "border-ink/15",
          )}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/80">
          Slug URL <span className="font-normal text-moss">(otomatis dari nama, bisa diubah)</span>
        </label>
        <input
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugTouched(true);
          }}
          placeholder="kopi-robusta-sangrai-250gr"
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <p className="mt-1 text-xs text-moss">URL: /products/{slug || "…"}</p>
      </div>

      {/* Harga + harga coret */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Harga (Rp)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="38000"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
              errors.price ? "border-red-400" : "border-ink/15",
            )}
          />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">
            Harga Coret <span className="font-normal text-moss">(opsional)</span>
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="45000"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Stok + volume + berat */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Stok</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="48"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
              errors.stock ? "border-red-400" : "border-ink/15",
            )}
          />
          {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Volume / Berat</label>
          <input
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="250 gr"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
              errors.volume ? "border-red-400" : "border-ink/15",
            )}
          />
          {errors.volume && <p className="mt-1 text-xs text-red-600">{errors.volume}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">
            Berat (gr) <span className="font-normal text-moss">(ongkir)</span>
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="250"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
              errors.weight ? "border-red-400" : "border-ink/15",
            )}
          />
          {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight}</p>}
        </div>
      </div>

      {/* Dimensi */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/80">
          Dimensi Kemasan (cm) <span className="font-normal text-moss">(opsional, untuk ongkir)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={dimL}
            onChange={(e) => setDimL(e.target.value)}
            placeholder="P"
            className="rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="number"
            value={dimW}
            onChange={(e) => setDimW(e.target.value)}
            placeholder="L"
            className="rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="number"
            value={dimH}
            onChange={(e) => setDimH(e.target.value)}
            placeholder="T"
            className="rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Kategori */}
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
                    ? "border-brand bg-brand text-white"
                    : "border-ink/10 bg-white text-ink/80 hover:border-brand hover:text-brand",
                )}
              >
                <input type="checkbox" checked={active} onChange={() => toggleCategory(c)} className="sr-only" />
                {c}
              </label>
            );
          })}
        </div>
        {errors.categories && <p className="mt-1 text-xs text-red-600">{errors.categories}</p>}
      </fieldset>

      {/* Badge */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/80">Badge</label>
        <div className="flex gap-2">
          {BADGES.map((b) => (
            <label
              key={b ?? "none"}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                badge === b
                  ? "border-brand bg-brand text-white"
                  : "border-ink/10 bg-white text-ink/80 hover:border-brand hover:text-brand",
              )}
            >
              <input
                type="radio"
                name="badge"
                checked={badge === b}
                onChange={() => setBadge(b)}
                className="sr-only"
              />
              {b ?? "Tidak ada"}
            </label>
          ))}
        </div>
      </div>

      {/* Deskripsi */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/80">Penjelasan produk</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Bahan, keunggulan, cara penyimpanan, dan info lainnya"
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
            errors.description ? "border-red-400" : "border-ink/15",
          )}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      {/* Status */}
      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-ink/80">Status</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="publish" checked={publishNow} onChange={() => setPublishNow(true)} className="h-4 w-4 accent-brand" />
            Publish langsung
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="publish" checked={!publishNow} onChange={() => setPublishNow(false)} className="h-4 w-4 accent-brand" />
            Simpan sebagai draft
          </label>
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Simpan Produk"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
        >
          Batal
        </button>
      </div>
    </form>
  );
}