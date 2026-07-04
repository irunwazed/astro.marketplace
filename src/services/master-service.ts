import { apiGet } from "./http";
import type { DropPoint, Office } from "../types";

/** GET /api/offices — master kantor mitra. */
export function getOffices(): Promise<Office[]> {
  return apiGet<Office[]>("/api/offices");
}

/** GET /api/drop-points — master titik ambil/terima paket. */
export function getDropPoints(): Promise<DropPoint[]> {
  return apiGet<DropPoint[]>("/api/drop-points");
}
