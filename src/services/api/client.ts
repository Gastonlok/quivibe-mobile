import { z } from "zod";
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://quivibe.vercel.app"
).replace(/\/$/, "");
let token: string | null = null;
let onExpired: (() => void) | undefined;
export function configureSession(value: string | null, expired?: () => void) {
  token = value;
  onExpired = expired;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    anonymous?: boolean;
  } = {},
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 20000);
  try {
    const response = await fetch(API_URL + "/api/mobile/" + path, {
      method: options.method || "GET",
      signal: controller.signal,
      credentials: "omit",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(!options.anonymous && token
          ? { Authorization: "Bearer " + token }
          : {}),
      },
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && !options.anonymous) onExpired?.();
      const error = z
        .object({ error: z.string().optional(), code: z.string().optional() })
        .safeParse(body);
      throw new ApiError(
        error.success
          ? error.data.error || "Le service est indisponible."
          : "Le service est indisponible.",
        response.status,
        error.success ? error.data.code : undefined,
      );
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      throw new ApiError(
        "La réponse du service est incompatible. Réessaie plus tard.",
        502,
      );
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw error;
    throw new ApiError("Vérifie ta connexion et réessaie.", 0);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}
export function params(values: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== "") p.set(key, String(value));
  return p.toString();
}
export const successSchema = z.object({ success: z.boolean().optional() });
