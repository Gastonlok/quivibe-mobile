import { z } from "zod";
import { api, params, successSchema } from "./client";
import { pageSchema, reservationSchema } from "../../types/api";
export const reservations = {
  availability: (
    id: string,
    date: string,
    partySize: number,
    signal?: AbortSignal,
  ) =>
    api(
      "venues/" +
        encodeURIComponent(id) +
        "/availability?" +
        params({ date, partySize }),
      z.object({
        success: z.literal(true),
        slots: z.array(z.string()),
        closed: z.boolean(),
        quote: z.object({ amountMinor: z.number(), currency: z.string() }),
      }),
      { signal },
    ),
  create: (body: {
    requestKey: string;
    placeId: string;
    date: string;
    time: string;
    partySize: number;
    phone?: string;
    specialRequest?: string;
    expectedPriceMinor: number;
    expectedCurrency: string;
  }) =>
    api(
      "reservations",
      z.object({
        success: z.literal(true),
        reference: z.string(),
        status: z.string(),
      }),
      { method: "POST", body },
    ),
  list: (page = 1, signal?: AbortSignal, group = "upcoming") =>
    api(
      "reservations?" + params({ page, group }),
      pageSchema(reservationSchema),
      { signal },
    ),
  detail: (reference: string, signal?: AbortSignal) =>
    api("reservations/" + encodeURIComponent(reference), reservationSchema, {
      signal,
    }),
  cancel: (id: string) =>
    api("reservations/" + encodeURIComponent(id), successSchema, {
      method: "DELETE",
    }),
};
