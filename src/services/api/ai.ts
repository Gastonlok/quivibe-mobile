import { z } from "zod";
import { api } from "./client";
const recommendation = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    neighborhood: z.string(),
    priceRange: z.number(),
    category: z.string(),
    image: z.string().nullable(),
    rating: z.number().nullable(),
    reason: z.string(),
  })
  .passthrough();
export type ChatMessage = { role: "user" | "assistant"; content: string };
export const askAI = (body: {
  query: string;
  history: ChatMessage[];
  context?: Record<string, unknown>;
  previousIds?: string[];
  position?: { latitude: number; longitude: number };
}) =>
  api(
    "ai",
    z.object({
      message: z.string(),
      context: z.record(z.string(), z.unknown()),
      recommendations: z.array(recommendation).nullable(),
    }),
    { method: "POST", body },
  );

export type Recommendation = z.infer<typeof recommendation>;
