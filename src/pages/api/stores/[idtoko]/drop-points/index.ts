import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import { addCustomDropPoint, getCustomDropPoints } from "../../../../../lib/server/store-drop-points-store";
import type { StoreDropPoint } from "../../../../../types";

export const prerender = false;

interface AddDropPointBody {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  shippingCost?: number;
}

/** GET /api/stores/:idtoko/drop-points — drop point custom milik toko. */
export const GET: APIRoute = ({ params }) => ok(getCustomDropPoints(params.idtoko!));

/** POST /api/stores/:idtoko/drop-points — tambah drop point custom. */
export const POST: APIRoute = async ({ params, request }) => {
  let body: AddDropPointBody;
  try {
    body = (await request.json()) as AddDropPointBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  const name = body.name?.trim();
  const address = body.address?.trim();
  if (!name) return err("Nama drop point wajib diisi", 400);
  if (!address) return err("Alamat wajib diisi", 400);
  if (body.lat === undefined || body.lng === undefined) return err("Lokasi (lat/lng) wajib diisi", 400);
  if (body.shippingCost === undefined || body.shippingCost < 0) {
    return err("Ongkir tidak boleh negatif", 400);
  }

  const dp: StoreDropPoint = {
    id: `DP-${Date.now()}`,
    storeId: params.idtoko!,
    name,
    address,
    location: { lat: body.lat, lng: body.lng },
    shippingCost: body.shippingCost,
    isCustom: true,
  };
  return ok(addCustomDropPoint(params.idtoko!, dp), 201);
};