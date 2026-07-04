import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import { addMember, getMembers } from "../../../../../lib/server/store-members-store";
import type { StoreMember } from "../../../../../types";

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["owner", "staff", "kurir"] as const;

interface AddMemberBody {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

/** GET /api/stores/:idtoko/members — daftar anggota toko. */
export const GET: APIRoute = ({ params }) => ok(getMembers(params.idtoko!));

/** POST /api/stores/:idtoko/members — tambah anggota. */
export const POST: APIRoute = async ({ params, request }) => {
  let body: AddMemberBody;
  try {
    body = (await request.json()) as AddMemberBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  if (!name) return err("Nama wajib diisi", 400);
  if (!email || !EMAIL_REGEX.test(email)) return err("Format email tidak valid", 400);

  const role = (ROLES as readonly string[]).includes(body.role ?? "")
    ? (body.role as StoreMember["role"])
    : "staff";
  const status: StoreMember["status"] = body.status === "aktif" ? "aktif" : "diundang";

  const members = getMembers(params.idtoko!);
  if (members.some((m) => m.email === email)) {
    return err("Email ini sudah menjadi anggota / sudah diundang", 400);
  }

  const member: StoreMember = {
    id: `M-${Date.now()}`,
    name,
    email,
    role,
    status,
  };
  return ok(addMember(params.idtoko!, member), 201);
};