import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Valid Indian mobile number required"),
  message: z.string().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export const enrollSchema = z.object({
  parent_name: z.string().min(2).max(100),
  parent_email: z.string().email(),
  parent_phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Valid Indian mobile (+91) required"),
  child_first_name: z.string().min(1).max(50),
  child_class: z.coerce.number().int().min(5).max(8),
  city: z.string().min(2).max(80),
  batch_id: z.string().uuid(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Parental consent is required" }),
  }),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept Terms and Refund Policy" }),
  }),
  website: z.string().max(0).optional(), // honeypot
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export const CONSENT_TEXT_VERSION = "v1-2025";
export const CONSENT_TEXT =
  "I am the parent/legal guardian and consent to my child's participation and to the processing of this data as per the Privacy Policy.";
