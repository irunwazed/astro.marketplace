import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import {
  removeCustomDropPoint,
  updateCustomDropPoint,
} from "../../../../../lib/server/store-drop-points-store";
import type { StoreDropPoint } from "../../../../../types";

export const prerender = false;

interface UpdateBody {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  shippingCost?: number;
}

/** PUT /api/stores/:idtoko/drop-points/:dpId — ubah drop point custom. */
export const PUT: APIRoute = async ({ params, request }) => {
  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  const patch: Partial<Pick<StoreDropPoint, "name" | "address" | "location" | "shippingCost">> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return err("Nama tidak boleh kosong", 400);
    patch.name = name;
  }
  if (body.address !== undefined) {
    const address = body.address.trim();
    if (!address) return err("Alamat tidak boleh kosong", 400);
    patch.address = address;
  }
  if (body.lat !== undefined && body.lng !== undefined) {
    patch.location = { lat: body.lat, lng: body.lng };
  }
  if (body.shippingCost !== undefined) {
    if (body.shippingCost < 0) return err("Ongkir tidak boleh negatif", 400);
    patch.shippingCost = body.shippingCost;
  }

  const updated = updateCustomDropPoint(params.idtoko!, params.dpId!, patch);
  if (!updated) return err("Drop point tidak ditemukan", 404);
  return ok(updated);
};

/** DELETE /api/stores/:idtoko/drop-points/:dpId — hapus drop point custom. */
export const DELETE: APIRoute = ({ params }) => {
  const success = removeCustomDropPoint(params.idtoko!, params.dpId!);
  if (!success) return err("Drop point tidak ditemukan", 404);
  return ok({ deleted: true });
};