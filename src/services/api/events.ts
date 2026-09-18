import { api, params } from "./client";
import { eventSchema, pageSchema } from "../../types/api";
export const events = {
  list: (filter: Record<string, string>, page = 1, signal?: AbortSignal) =>
    api("events?" + params({ ...filter, page }), pageSchema(eventSchema), {
      signal,
    }),
  detail: (id: string, signal?: AbortSignal) =>
    api("events/" + encodeURIComponent(id), eventSchema, { signal }),
};
