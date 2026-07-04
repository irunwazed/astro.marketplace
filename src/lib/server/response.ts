/** Helper respons JSON untuk route API — amplop { data } / { error }. */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function ok(data: unknown, status = 200): Response {
  return json({ data }, status);
}

export function err(message: string, status: number): Response {
  return json({ error: message }, status);
}
