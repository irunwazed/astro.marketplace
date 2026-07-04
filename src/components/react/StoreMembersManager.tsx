import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { initialsOf } from "../../lib/session";
import {
  addMember,
  fallbackMembers,
  getMembers,
  removeMember,
  updateMember,
} from "../../services/store-service";
import Modal from "./Modal";
import type { StoreMember, StoreMemberRole } from "../../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES: StoreMemberRole[] = [
  "owner",
  "manager",
  "staff pembelian",
  "staff verifikasi",
  "staff",
  "kasir",
  "kurir",
];

const ROLE_LABEL: Record<StoreMemberRole, string> = {
  owner: "Owner",
  manager: "Manager",
  "staff pembelian": "Staff Pembelian",
  "staff verifikasi": "Staff Verifikasi",
  staff: "Staff",
  kasir: "Kasir",
  kurir: "Kurir",
};

const ROLE_BADGE: Record<StoreMemberRole, string> = {
  owner: "bg-brand text-white",
  manager: "bg-brand-deep text-white",
  "staff pembelian": "bg-brand/15 text-brand",
  "staff verifikasi": "bg-brand/10 text-brand",
  staff: "bg-brand/10 text-brand",
  kasir: "bg-amber/15 text-amber-deep",
  kurir: "bg-amber/15 text-amber-deep",
};

interface Props {
  storeId: string;
  initialMembers: StoreMember[];
}

export default function StoreMembersManager({ storeId, initialMembers }: Props) {
  const [members, setMembers] = useState<StoreMember[]>(initialMembers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StoreMember | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StoreMember | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMembers(await getMembers(storeId));
      } catch {
        setMembers(fallbackMembers(storeId));
      }
      setLoading(false);
    })();
  }, [storeId]);

  /* ---------- Tambah ---------- */
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<StoreMember["role"]>("staff");
  const [addError, setAddError] = useState("");

  const handleAdd = async () => {
    setAddError("");
    if (!addName.trim()) return setAddError("Nama wajib diisi");
    if (!EMAIL_REGEX.test(addEmail)) return setAddError("Format email tidak valid");
    if (members.some((m) => m.email === addEmail)) {
      return setAddError("Email ini sudah menjadi anggota / sudah diundang");
    }
    try {
      const member = await addMember(storeId, {
        name: addName.trim(),
        email: addEmail.trim(),
        role: addRole,
        status: "diundang",
      });
      setMembers([...members, member]);
      setAddName("");
      setAddEmail("");
      setAddRole("staff");
      setShowAdd(false);
    } catch {
      setAddError("Gagal menambah anggota. Coba lagi.");
    }
  };

  /* ---------- Edit ---------- */
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<StoreMember["role"]>("staff");
  const [editStatus, setEditStatus] = useState<StoreMember["status"]>("aktif");

  const startEdit = (m: StoreMember) => {
    setEditing(m);
    setEditName(m.name);
    setEditRole(m.role);
    setEditStatus(m.status);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    try {
      const updated = await updateMember(storeId, editing.id, {
        name: editName.trim(),
        role: editRole,
        status: editStatus,
      });
      setMembers(members.map((m) => (m.id === editing.id ? updated : m)));
      setEditing(null);
    } catch {
      setError("Gagal menyimpan perubahan.");
    }
  };

  /* ---------- Hapus ---------- */
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await removeMember(storeId, confirmDelete.id);
      setMembers(members.filter((m) => m.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      setError("Gagal menghapus anggota.");
    }
  };

  /* ---------- Aktifkan ---------- */
  const handleActivate = async (id: string) => {
    try {
      const updated = await updateMember(storeId, id, { status: "aktif" });
      setMembers(members.map((m) => (m.id === id ? updated : m)));
    } catch {
      setError("Gagal mengaktifkan anggota.");
    }
  };

  if (loading) return <p className="text-sm text-moss">Memuat anggota…</p>;

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-moss">{members.length} anggota</p>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          + Tambah Anggota
        </button>
      </div>

      {/* Daftar anggota */}
      <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 p-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand"
              aria-hidden="true"
            >
              {initialsOf(m.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="truncate text-xs text-moss">{m.email}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase",
                ROLE_BADGE[m.role],
              )}
            >
              {ROLE_LABEL[m.role]}
            </span>
            {m.status === "diundang" ? (
              <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-[11px] font-bold uppercase text-amber-deep">
                Diundang
              </span>
            ) : (
              <span className="rounded-full bg-moss/10 px-2.5 py-0.5 text-[11px] font-bold uppercase text-moss">
                Aktif
              </span>
            )}
            <div className="flex shrink-0 gap-1">
              {m.status === "diundang" && (
                <button
                  type="button"
                  onClick={() => handleActivate(m.id)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
                  aria-label={`Aktifkan ${m.name}`}
                >
                  Aktifkan
                </button>
              )}
              <button
                type="button"
                onClick={() => startEdit(m)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
                aria-label={`Edit ${m.name}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(m)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-rose transition-colors hover:bg-rose/10"
                aria-label={`Hapus ${m.name}`}
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
        {members.length === 0 && (
          <li className="p-8 text-center text-sm text-moss">Belum ada anggota di toko ini.</li>
        )}
      </ul>

      {/* Modal tambah anggota */}
      <Modal open={showAdd} title="Undang Anggota Baru" onClose={() => setShowAdd(false)} size="md">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Nama</label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Email</label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Jabatan</label>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as StoreMember["role"])}
              className="cursor-pointer rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Kirim Undangan
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal edit anggota */}
      <Modal open={!!editing} title="Edit Anggota" onClose={() => setEditing(null)} size="md">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Nama</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Jabatan</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as StoreMember["role"])}
              className="cursor-pointer rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/80">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as StoreMember["status"])}
              className="cursor-pointer rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="aktif">Aktif</option>
              <option value="diundang">Diundang</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal open={!!confirmDelete} title="Hapus Anggota" onClose={() => setConfirmDelete(null)} size="sm">
        <p className="text-sm text-ink">
          Hapus <strong>{confirmDelete?.name}</strong> dari anggota toko? Tindakan ini tidak bisa dibatalkan.
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