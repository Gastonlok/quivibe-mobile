import { api, params } from "./client";
import { detailSchema, searchSchema } from "../../types/api";
export const venues = {
  list: (filters: Record<string, string>, page = 1, signal?: AbortSignal) =>
    api("venues?" + params({ ...filters, page }), searchSchema, { signal }),
  detail: (slug: string, signal?: AbortSignal) =>
    api("venues/" + encodeURIComponent(slug), detailSchema, { signal }),
};
