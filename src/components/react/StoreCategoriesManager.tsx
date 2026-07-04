import { useEffect, useState } from "react";
import {
  addCategory,
  fallbackCategories,
  getCategories,
  removeCategory,
  updateCategory,
} from "../../services/store-service";
import Modal from "./Modal";

interface Props {
  initialCategories: string[];
}

export default function StoreCategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setCategories(await getCategories());
      } catch {
        setCategories(fallbackCategories());
      }
      setLoading(false);
    })();
  }, []);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Nama kategori wajib diisi");
    if (categories.includes(trimmed)) return setError("Kategori sudah ada");
    setBusy(true);
    setError("");
    try {
      await addCategory(trimmed);
      setCategories([...categories, trimmed]);
      setName("");
      setShowAdd(false);
    } catch {
      setError("Gagal menambah kategori.");
    }
    setBusy(false);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const trimmed = newName.trim();
    if (!trimmed) return setError("Nama kategori wajib diisi");
    if (categories.includes(trimmed)) return setError("Nama kategori sudah dipakai");
    setBusy(true);
    setError("");
    try {
      await updateCategory(editing, trimmed);
      setCategories(categories.map((c) => (c === editing ? trimmed : c)));
      setEditing(null);
      setNewName("");
    } catch {
      setError("Gagal mengubah kategori.");
    }
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await removeCategory(confirmDelete);
      setCategories(categories.filter((c) => c !== confirmDelete));
      setConfirmDelete(null);
    } catch {
      setError("Gagal menghapus kategori.");
    }
  };

  if (loading) return <p className="text-sm text-moss">Memuat kategori…</p>;

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-moss">{categories.length} kategori referensi</p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setShowAdd(true);
          }}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          + Tambah Kategori
        </button>
      </div>

      <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
        {categories.map((c) => (
          <li key={c} className="flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 7h.01M7 3h5a1.99 1.99 0 0 1 1.4.6l7.6 7.6a2 2 0 0 1 0 2.8l-5.6 5.6a2 2 0 0 1-2.8 0L5 12a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c}</span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(c);
                  setNewName(c);
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(c)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-rose transition-colors hover:bg-rose/10"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="p-8 text-center text-sm text-moss">Belum ada kategori.</li>
        )}
      </ul>

      {/* Modal tambah */}
      <Modal open={showAdd} title="Tambah Kategori" onClose={() => setShowAdd(false)} size="sm">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Nama Kategori</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="mis. Perlengkapan Rumah"
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={busy}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal edit */}
      <Modal open={!!editing} title="Edit Kategori" onClose={() => setEditing(null)} size="sm">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Nama Kategori</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              disabled={busy}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal hapus */}
      <Modal open={!!confirmDelete} title="Hapus Kategori" onClose={() => setConfirmDelete(null)} size="sm">
        <p className="text-sm text-ink">
          Hapus kategori <strong>{confirmDelete}</strong>? Produk yang memakai kategori ini tidak ikut terhapus.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(null)}
            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose/80"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}