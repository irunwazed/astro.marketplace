import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import {
  addProduct,
  fallbackProducts,
  getProducts,
  removeProduct,
  updateProduct,
} from "../../services/store-service";
import { formatIDR } from "./ProductCard";
import ProductFormFull from "./ProductFormFull";
import Modal from "./Modal";
import type { Product } from "../../types";

interface Props {
  storeId: string;
  initialProducts: Product[];
  categoryOptions: string[];
}

export default function StoreProductsManager({ storeId, initialProducts, categoryOptions }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setProducts(await getProducts(storeId));
      } catch {
        setProducts(fallbackProducts(storeId));
      }
      setLoading(false);
    })();
  }, [storeId]);

  const keyword = search.trim().toLowerCase();
  const visible = keyword
    ? products.filter((p) => p.name.toLowerCase().includes(keyword))
    : products;
  const publishedCount = products.filter((p) => p.published).length;

  const handleAdd = async (data: Partial<Product>) => {
    setBusy(true);
    setError("");
    try {
      const product = await addProduct(storeId, data);
      setProducts([...products, product]);
      setShowForm(false);
    } catch {
      setError("Gagal menambah produk. Coba lagi.");
    }
    setBusy(false);
  };

  const handleEdit = async (data: Partial<Product>) => {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const updated = await updateProduct(storeId, editing.id, data);
      setProducts(products.map((p) => (p.id === editing.id ? updated : p)));
      setEditing(null);
    } catch {
      setError("Gagal menyimpan perubahan.");
    }
    setBusy(false);
  };

  const handleTogglePublish = async (p: Product) => {
    try {
      const updated = await updateProduct(storeId, p.id, { published: !p.published });
      setProducts(products.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      setError("Gagal mengubah status publish.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeProduct(storeId, id);
      setProducts(products.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch {
      setError("Gagal menghapus produk.");
    }
  };

  if (loading) return <p className="text-sm text-moss">Memuat produk…</p>;

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-moss">
          {publishedCount} tayang · {products.length - publishedCount} draft
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          + Tambah Produk
        </button>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari produk…"
        className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
        {visible.map((p) => (
          <li key={p.id} className="flex items-center gap-3 p-4">
            <img src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-moss">
                {formatIDR(p.price)}
                {p.originalPrice && <span className="line-through"> · {formatIDR(p.originalPrice)}</span>}
                {" · stok "}{p.stock} · {p.volume}
              </p>
              {p.badge && (
                <span className="mt-0.5 inline-block rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-deep">
                  {p.badge}
                </span>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={p.published}
              aria-label={`${p.published ? "Unpublish" : "Publish"} ${p.name}`}
              onClick={() => handleTogglePublish(p)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                p.published ? "bg-brand" : "bg-ink/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left]",
                  p.published ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
            <span
              className={cn(
                "w-14 text-right text-[11px] font-bold uppercase",
                p.published ? "text-brand" : "text-moss",
              )}
            >
              {p.published ? "Tayang" : "Draft"}
            </span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(p)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-rose transition-colors hover:bg-rose/10"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="p-8 text-center text-sm text-moss">
            {keyword ? "Tidak ada produk cocok." : "Belum ada produk di toko ini."}
          </li>
        )}
      </ul>

      {/* Modal tambah/edit produk */}
      <Modal
        open={showForm}
        title={editing ? "Edit Produk" : "Tambah Produk"}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        size="lg"
      >
        <ProductFormFull
          categoryOptions={categoryOptions}
          editing={editing}
          onSubmit={editing ? handleEdit : handleAdd}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          busy={busy}
        />
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        open={!!confirmDelete}
        title="Hapus Produk"
        onClose={() => setConfirmDelete(null)}
        size="sm"
      >
        <p className="text-sm text-ink">
          Hapus <strong>{confirmDelete?.name}</strong> dari toko? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(null)}
            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => confirmDelete && handleDelete(confirmDelete.id)}
            className="rounded-md bg-rose px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose/80"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}