/**
 * Klien HTTP dasar untuk semua service.
 * Semua respons API memakai amplop { data } (sukses) atau { error } (gagal).
 * Komponen tidak memanggil fetch langsung — selalu lewat service di folder ini.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface Envelope<T> {
  data?: T;
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const body = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok || body.error) {
    throw new ApiError(body.error ?? `Permintaan gagal (${res.status})`, res.status);
  }
  return body.data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, payload?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}
