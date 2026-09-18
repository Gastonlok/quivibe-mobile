import { z } from "zod";
import { api, successSchema } from "./client";
import { userSchema } from "../../types/api";
export const users = {
  session: (signal?: AbortSignal) =>
    api("session", z.object({ user: userSchema, expires: z.string() }), {
      signal,
    }),
  login: (body: { email: string; password: string }) =>
    api(
      "session",
      z.object({ token: z.string(), expires: z.string(), user: userSchema }),
      { method: "POST", body, anonymous: true },
    ),
  register: (body: { name: string; email: string; password: string }) =>
    api("register", z.object({ message: z.string() }), {
      method: "POST",
      body,
      anonymous: true,
    }),
  logout: () => api("session", successSchema, { method: "DELETE" }),
  update: (body: { name: string; email: string; image: string }) =>
    api(
      "profile",
      z.object({
        user: userSchema.omit({ id: true, role: true }),
        verificationRequired: z.boolean(),
        verificationSent: z.boolean(),
      }),
      { method: "PATCH", body },
    ),
  reset: (email: string) =>
    api(
      "password-reset",
      z.object({ message: z.string().optional() }).passthrough(),
      { method: "POST", body: { email }, anonymous: true },
    ),
};
