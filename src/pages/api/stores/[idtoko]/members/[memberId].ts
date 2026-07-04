import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import { removeMember, updateMember } from "../../../../../lib/server/store-members-store";
import type { StoreMember } from "../../../../../types";

export const prerender = false;

const ROLES = ["owner", "staff", "kurir"] as const;

interface UpdateBody {
  name?: string;
  role?: string;
  status?: string;
}

/** PUT /api/stores/:idtoko/members/:memberId — ubah nama/role/status anggota. */
export const PUT: APIRoute = async ({ params, request }) => {
  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  const patch: Partial<Pick<StoreMember, "name" | "role" | "status">> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return err("Nama tidak boleh kosong", 400);
    patch.name = name;
  }
  if (body.role !== undefined) {
    if (!(ROLES as readonly string[]).includes(body.role)) {
      return err("Role tidak valid (owner/staff/kurir)", 400);
    }
    patch.role = body.role as StoreMember["role"];
  }
  if (body.status !== undefined) {
    if (body.status !== "aktif" && body.status !== "diundang") {
      return err("Status tidak valid (aktif/diundang)", 400);
    }
    patch.status = body.status as StoreMember["status"];
  }

  const updated = updateMember(params.idtoko!, params.memberId!, patch);
  if (!updated) return err("Anggota tidak ditemukan", 404);
  return ok(updated);
};

/** DELETE /api/stores/:idtoko/members/:memberId — hapus anggota. */
export const DELETE: APIRoute = ({ params }) => {
  const success = removeMember(params.idtoko!, params.memberId!);
  if (!success) return err("Anggota tidak ditemukan", 404);
  return ok({ deleted: true });
};