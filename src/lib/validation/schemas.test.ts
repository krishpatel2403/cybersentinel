import { describe, expect, it } from "vitest";
import {
  assetSchema,
  changePasswordSchema,
  findingSchema,
  loginSchema,
} from "@/lib/validation/schemas";

describe("validation schemas", () => {
  it("normalizes login emails", () => {
    const parsed = loginSchema.parse({ email: "  Admin@Example.COM ", password: "secret" });
    expect(parsed.email).toBe("admin@example.com");
  });

  it("rejects invalid login input", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(201) }).success).toBe(
      false,
    );
  });

  it("accepts a valid asset and normalizes empty optional IP", () => {
    const parsed = assetSchema.parse({
      name: "Edge Gateway",
      hostname: "edge-01.example.com",
      ipAddress: "",
      type: "network",
      criticality: "4",
      exposure: "internet",
      owner: "Network team",
      os: "PAN-OS",
      tags: "edge, public",
    });
    expect(parsed.criticality).toBe(4);
    expect(parsed.ipAddress).toBeNull();
  });

  it("rejects invalid hostnames, IPs, and criticality", () => {
    const base = {
      name: "Edge Gateway",
      hostname: "edge-01",
      ipAddress: "",
      type: "network",
      criticality: "4",
      exposure: "internet",
      owner: "Network team",
      os: "PAN-OS",
      tags: "",
    };
    expect(assetSchema.safeParse({ ...base, hostname: "-bad-host" }).success).toBe(false);
    expect(assetSchema.safeParse({ ...base, hostname: "bad..host" }).success).toBe(false);
    expect(assetSchema.safeParse({ ...base, ipAddress: "999.1.1.1" }).success).toBe(false);
    expect(assetSchema.safeParse({ ...base, criticality: "9" }).success).toBe(false);
  });

  it("normalizes CVSS, CVE, and empty due dates in findings", () => {
    const parsed = findingSchema.parse({
      assetId: "d8f0c532-1a58-4a55-b9e4-6d7f33c0a9b7",
      title: "Outdated TLS configuration",
      description: "The edge service still accepts TLS 1.0 connections.",
      severity: "high",
      cvss: "8.1",
      cveId: "cve-2024-3400",
      status: "open",
      remediation: "",
      dueDate: "",
    });
    expect(parsed.cvss).toBe(8.1);
    expect(parsed.cveId).toBe("CVE-2024-3400");
    expect(parsed.dueDate).toBeNull();
  });

  it("rejects mismatched or weak password changes", () => {
    const base = {
      currentPassword: "OldPassword!2025",
      newPassword: "NewPassword!2026",
      confirmPassword: "NewPassword!2026",
    };
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
    expect(
      changePasswordSchema.safeParse({ ...base, confirmPassword: "Different!2026" }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({ ...base, newPassword: "short", confirmPassword: "short" })
        .success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "SamePassword!2026",
        newPassword: "SamePassword!2026",
        confirmPassword: "SamePassword!2026",
      }).success,
    ).toBe(false);
  });
});
