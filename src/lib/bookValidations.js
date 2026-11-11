import { z } from "zod";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const bookOrderSchema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+91|91|0)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  child_class: z.string().regex(/^[4-9]$/, "Select a class"),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().refine((v) => INDIAN_STATES.includes(v), "Select a state"),
  address_line1: z.string().trim().min(5, "Enter your address").max(120),
  address_line2: z.string().trim().max(120).optional(),
  landmark: z.string().trim().max(120).optional(),
  website: z.string().optional(), // honeypot
  utm_source: z.string().max(200).nullish(),
  utm_medium: z.string().max(200).nullish(),
  utm_campaign: z.string().max(200).nullish(),
});