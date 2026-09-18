import { z } from "zod";
import { api, params } from "./client";
import { pageSchema, venueSchema } from "../../types/api";
export const favorites = {
  list: (page = 1, signal?: AbortSignal) =>
    api("favorites?" + params({ page }), pageSchema(venueSchema), { signal }),
  set: (id: string, saved: boolean) =>
    api(
      "favorites/" + encodeURIComponent(id),
      z.object({ isFavorite: z.boolean() }),
      { method: saved ? "PUT" : "DELETE" },
    ),
};
