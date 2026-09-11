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

export const propertyCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(["LAND", "HOUSE", "APARTMENT", "COMMERCIAL", "VILLA"]),
  price: z.number().positive(),
  reservationFee: z.number().nonnegative(),
  address: z.string().min(3),
  city: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  attributes: z.record(z.any()).default({}),
  images: z.array(z.string().url()).default([]),
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
