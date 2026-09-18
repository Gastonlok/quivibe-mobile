import { z } from "zod";
import { api } from "./client";
import { optionsSchema } from "../../types/api";
export const search = {
  options: (signal?: AbortSignal) =>
    api("search-options", optionsSchema, { signal }),
  suggestions: (q: string, signal?: AbortSignal) =>
    api(
      "suggestions?q=" + encodeURIComponent(q),
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          neighborhood: z.string(),
        }),
      ),
      { signal },
    ),
};
