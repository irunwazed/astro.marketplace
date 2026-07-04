import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import {
  addStoreDropPoint,
  getStoreDropPoints,
  removeStoreDropPoint,
  updateStoreDropPoint,
} from "../../services/store-service";
import LeafletMap from "./LeafletMap";
import Modal from "./Modal";
import { formatIDR } from "./ProductCard";
import type { DropPoint, StoreDropPoint } from "../../types";

interface Props {
  storeId: string;
  masterDropPoints: DropPoint[];
  initialDropPointIds: string[];
}

const JAKARTA = { lat: -6.2, lng: 106.8167 };

export default function StoreDropPointsManager({
  storeId,
  masterDropPoints,
  initialDropPointIds,
}: Props) {
  const [selectedMaster, setSelectedMaster] = useState<string[]>(initialDropPointIds);
  const [customDps, setCustomDps] = useState<StoreDropPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedMaster, setSavedMaster] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StoreDropPoint | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StoreDropPoint | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [shippingCost, setShippingCost] = useState("10000");
  const [lat, setLat] = useState(String(JAKARTA.lat));
  const [lng, setLng] = useState(String(JAKARTA.lng));

  useEffect(() => {
    (async () => {
      try {
        setCustomDps(await getStoreDropPoints(storeId));
      } catch {
        setCustomDps([]);
      }
      setLoading(false);
    })();
  }, [storeId]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setShippingCost("10000");
    setLat(String(JAKARTA.lat));
    setLng(String(JAKARTA.lng));
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (dp: StoreDropPoint) => {
    setEditing(dp);
    setName(dp.name);
    setAddress(dp.address);
    setShippingCost(String(dp.shippingCost));
    setLat(String(dp.location.lat));
    setLng(String(dp.location.lng));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const toggleMaster = (id: string) => {
    setSelectedMaster(
      selectedMaster.includes(id) ? selectedMaster.filter((s) => s !== id) : [...selectedMaster, id],
    );
    setSavedMaster(false);
  };

  const handleSaveMaster = () => {
    setSavedMaster(true);
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) return setError("Nama drop point wajib diisi");
    if (!address.trim()) return setError("Alamat wajib diisi");
    const sc = Number(shippingCost);
    if (isNaN(sc) || sc < 0) return setError("Ongkir tidak valid");

    setBusy(true);
    try {
      if (editing) {
        const updated = await updateStoreDropPoint(storeId, editing.id, {
          name: name.trim(),
          address: address.trim(),
          location: { lat: Number(lat), lng: Number(lng) },
          shippingCost: sc,
        });
        setCustomDps(customDps.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const dp = await addStoreDropPoint(storeId, {
          name: name.trim(),
          address: address.trim(),
          lat: Number(lat),
          lng: Number(lng),
          shippingCost: sc,
        });
        setCustomDps([...customDps, dp]);
      }
      closeForm();
    } catch {
      setError("Gagal menyimpan drop point. Coba lagi.");
    }
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await removeStoreDropPoint(storeId, confirmDelete.id);
      setCustomDps(customDps.filter((d) => d.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      setError("Gagal menghapus drop point.");
    }
  };

  if (loading) return <p className="text-sm text-moss">Memuat drop point…</p>;

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p>
      )}

      {/* Master list */}
      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg font-bold">Drop Point Master</h2>
        <p className="mt-1 text-xs text-moss">
          Pilih drop point pusat yang dilayani toko — pembeli memilih salah satunya saat checkout.
        </p>
        <ul className="mt-4 space-y-2">
          {masterDropPoints.map((dp) => (
            <li key={dp.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  selectedMaster.includes(dp.id)
                    ? "border-brand bg-brand/5"
                    : "border-ink/10 hover:border-brand/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedMaster.includes(dp.id)}
                  onChange={() => toggleMaster(dp.id)}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-semibold">{dp.name}</span>
                  <span className="block text-xs text-moss">{dp.address}</span>
                  <span className="mt-0.5 block text-xs text-brand">
                    Ongkir {formatIDR(dp.shippingCost)}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleSaveMaster}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Simpan Pilihan
        </button>
        {savedMaster && (
          <p className="mt-2 text-sm text-brand">{selectedMaster.length} drop point disimpan (demo).</p>
        )}
      </section>

      {/* Custom drop point */}
      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Drop Point Custom</h2>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            + Tambah Drop Point
          </button>
        </div>

        <ul className="mt-4 divide-y divide-ink/10">
          {customDps.map((dp) => (
            <li key={dp.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{dp.name}</p>
                <p className="truncate text-xs text-moss">{dp.address}</p>
                <p className="text-xs text-brand">Ongkir {formatIDR(dp.shippingCost)}</p>
                <p className="text-[11px] text-moss">
                  {dp.location.lat.toFixed(4)}, {dp.location.lng.toFixed(4)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(dp)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(dp)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-rose transition-colors hover:bg-rose/10"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
          {customDps.length === 0 && (
            <li className="py-6 text-center text-sm text-moss">
              Belum ada drop point custom. Klik "Tambah Drop Point" untuk membuat lewat peta.
            </li>
          )}
        </ul>
      </section>

      {/* Modal tambah/edit drop point (dengan map) */}
      <Modal
        open={showForm}
        title={editing ? "Edit Drop Point" : "Tambah Drop Point"}
        onClose={closeForm}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/80">Nama</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Drop Point Minimarket Sekitar"
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/80">Ongkir (Rp)</label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="8000"
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Alamat</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. ... No. ..."
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Map — key dipakai agar map re-init saat modal buka (lat/lng terisi) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">
              Lokasi <span className="font-normal text-moss">(klik peta atau geser marker)</span>
            </label>
            {showForm && (
              <LeafletMap
                key={editing?.id ?? "add"}
                lat={Number(lat) || JAKARTA.lat}
                lng={Number(lng) || JAKARTA.lng}
                onChange={(newLat, newLng) => {
                  setLat(String(newLat.toFixed(6)));
                  setLng(String(newLng.toFixed(6)));
                }}
              />
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[11px] text-moss">Latitude</label>
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full rounded-md border border-ink/15 px-2 py-1.5 text-xs outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] text-moss">Longitude</label>
                <input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full rounded-md border border-ink/15 px-2 py-1.5 text-xs outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Tambah Drop Point"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal open={!!confirmDelete} title="Hapus Drop Point" onClose={() => setConfirmDelete(null)} size="sm">
        <p className="text-sm text-ink">
          Hapus <strong>{confirmDelete?.name}</strong> dari drop point toko?
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
            onClick={handleDelete}
            className="rounded-md bg-rose px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose/80"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}