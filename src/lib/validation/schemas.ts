import { isIP } from "node:net";
import { z } from "zod";
import { ASSET_TYPES, EXPOSURES, FINDING_STATUSES, SEVERITIES } from "@/types";

const emailSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.email("Enter a valid email address"),
);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(200, "Password is too long"),
});

export const assetSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  hostname: z
    .string()
    .trim()
    .min(1, "Hostname is required")
    .max(253, "Hostname is too long")
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/,
      "Use a valid hostname (letters, numbers, dots, hyphens)",
    )
    .refine((value) => !value.includes(".."), "Hostname cannot contain consecutive dots"),
  ipAddress: z
    .string()
    .trim()
    .max(45, "IP address is too long")
    .refine((value) => value === "" || isIP(value) !== 0, "Enter a valid IPv4 or IPv6 address")
    .transform((value) => (value === "" ? null : value)),
  type: z.enum(ASSET_TYPES),
  criticality: z.coerce
    .number()
    .int("Criticality must be a whole number")
    .min(1, "Criticality must be between 1 and 5")
    .max(5, "Criticality must be between 1 and 5"),
  exposure: z.enum(EXPOSURES),
  owner: z
    .string()
    .trim()
    .min(2, "Owner must be at least 2 characters")
    .max(80, "Owner is too long"),
  os: z.string().trim().min(1, "Operating system is required").max(80, "OS name is too long"),
  tags: z.string().max(300, "Tags are too long").optional().default(""),
});

const optionalCvss = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 10),
    "CVSS must be between 0 and 10",
  )
  .transform((value) => (value === "" ? null : Number(value)));

const optionalCve = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => value === "" || /^CVE-\d{4}-\d{4,}$/.test(value), "Use CVE-YYYY-NNNN format")
  .transform((value) => (value === "" ? null : value));

const optionalDueDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use a valid date")
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), "Use a valid date")
  .transform((value) => (value === "" ? null : value));

export const findingSchema = z.object({
  assetId: z.string().uuid("Select a valid asset"),
  title: z
    .string()
    .trim()
    .min(4, "Title must be at least 4 characters")
    .max(140, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the finding in at least 10 characters")
    .max(4000, "Description is too long"),
  severity: z.enum(SEVERITIES),
  cvss: optionalCvss,
  cveId: optionalCve,
  status: z.enum(FINDING_STATUSES),
  remediation: z.string().trim().max(4000, "Remediation is too long").optional().default(""),
  dueDate: optionalDueDate,
});

export const findingStatusSchema = z.enum(FINDING_STATUSES);

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(200),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .max(128, "New password is too long")
      .refine((value) => /[a-z]/.test(value), "Include a lowercase letter")
      .refine((value) => /[A-Z]/.test(value), "Include an uppercase letter")
      .refine((value) => /\d/.test(value), "Include a number")
      .refine((value) => /[^A-Za-z0-9]/.test(value), "Include a symbol"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Choose a password you have not used before",
    path: ["newPassword"],
  });

export const copilotQuestionSchema = z
  .string()
  .trim()
  .min(3, "Ask a question with at least 3 characters")
  .max(500, "Questions are limited to 500 characters");

export const findingIdSchema = z.string().uuid("Invalid finding");
