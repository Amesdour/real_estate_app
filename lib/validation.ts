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
  images: z.array(z.string().url()).default([]),
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
