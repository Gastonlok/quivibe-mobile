import { z } from "zod";
import { api, params } from "./client";
import { pageSchema, reviewSchema } from "../../types/api";
export const reviews = {
  list: (id: string, page = 1, signal?: AbortSignal) =>
    api(
      "reviews/" + encodeURIComponent(id) + "?" + params({ page }),
      pageSchema(reviewSchema),
      { signal },
    ),
  create: (body: { placeId: string; rating: number; comment: string }) =>
    api("reviews", z.object({ message: z.string() }), { method: "POST", body }),
};
