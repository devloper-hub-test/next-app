// lib/request-body.ts
// Reads a JSON request body as an object of unknown values (empty if missing or invalid),
// so route handlers must check each field's type before using it.
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
