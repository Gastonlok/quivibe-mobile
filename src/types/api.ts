import { z } from "zod";
const media = z.object({
  url: z.string(),
  altText: z.string().nullable().optional(),
});
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  role: z.string(),
});
export type User = z.infer<typeof userSchema>;
export const venueSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  neighborhood: z.string(),
  priceRange: z.number(),
  reservationsEnabled: z.boolean(),
  media: z.array(media),
  categories: z.array(z.object({ category: z.object({ name: z.string() }) })),
  averageRating: z.number().nullable().default(null),
  reviewCount: z.number().default(0),
  isFavorite: z.boolean().default(false),
  distanceKm: z.number().nullable().optional(),
});
export type Venue = z.infer<typeof venueSchema>;
export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string().nullable(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
});
export const detailSchema = venueSchema.extend({
  description: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  maxPartySize: z.number(),
  menuItems: z.array(menuItemSchema),
});
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  media: z.array(media),
  place: venueSchema.extend({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});
export type QuivibeEvent = z.infer<typeof eventSchema>;
export const reviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string(),
  status: z.string().optional(),
  author: z.object({ name: z.string() }).optional(),
  place: z.object({ name: z.string(), slug: z.string() }).optional(),
  response: z.object({ body: z.string() }).nullable().optional(),
});
export const reservationSchema = z.object({
  id: z.string(),
  reference: z.string(),
  dateTime: z.string(),
  partySize: z.number(),
  status: z.string(),
  reservationPriceMinor: z.number(),
  reservationCurrency: z.string(),
  place: venueSchema.extend({ address: z.string() }),
});
export type Reservation = z.infer<typeof reservationSchema>;
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
  });
export const searchSchema = z.object({
  places: z.array(venueSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});
export const optionsSchema = z.object({
  neighborhoods: z.array(z.string()),
  categories: z.array(z.object({ name: z.string(), slug: z.string() })),
});
