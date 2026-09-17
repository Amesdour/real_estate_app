import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(6).optional(),
  role: z.enum(["AGENT", "BUYER_TENANT", "PROPERTY_OWNER"]).default("BUYER_TENANT"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AMENITIES = [
  "POOL",
  "GARAGE",
  "GARDEN",
  "AIR_CONDITIONING",
  "ELEVATOR",
  "FURNISHED",
  "BALCONY",
  "SECURITY",
  "PARKING",
  "INTERNET",
] as const;

export const propertyCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(["LAND", "HOUSE", "APARTMENT", "COMMERCIAL", "VILLA"]),
  listingKind: z.enum(["SALE", "RENT"]).default("SALE"),
  price: z.number().positive(),
  reservationFee: z.number().nonnegative(),
  address: z.string().min(3),
  city: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  bedrooms: z.number().int().nonnegative().nullable().optional(),
  bathrooms: z.number().int().nonnegative().nullable().optional(),
  areaSqm: z.number().int().positive().nullable().optional(),
  amenities: z.array(z.enum(AMENITIES)).default([]),
  attributes: z.record(z.any()).default({}),
  // Our own /api/upload endpoint returns a relative path like
  // "/uploads/abc123.jpg", which z.string().url() actually REJECTS —
  // it requires an absolute URL (new URL() throws on a bare relative
  // path). That meant every property submission/edit that included an
  // uploaded image failed validation. Accept either an absolute
  // http(s) URL (for a future S3/R2 migration) or a same-origin
  // relative path starting with "/".
  images: z
    .array(z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), { message: "Invalid image URL" }))
    .default([]),
});

/** Same shape, but every field optional — used for admin edits (partial update). */
export const propertyUpdateSchema = propertyCreateSchema.partial().extend({
  status: z
    .enum(["DRAFT", "PENDING_APPROVAL", "AVAILABLE", "RESERVED", "SOLD", "RENTED", "EXPIRED"])
    .optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const reservationCreateSchema = z.object({
  propertyId: z.string().uuid(),
});

export const conversationCreateSchema = z.object({
  propertyId: z.string().uuid().optional(),
  body: z.string().min(1).max(4000),
});

export const messageCreateSchema = z.object({
  body: z.string().min(1).max(4000),
});
