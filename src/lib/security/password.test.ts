import { describe, expect, it } from "vitest";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "@/lib/security/password";

describe("password hashing", () => {
  it("creates a scrypt hash with a random salt", async () => {
    const first = await hashPassword("CorrectHorse!2026");
    const second = await hashPassword("CorrectHorse!2026");

    expect(first.startsWith("scrypt$16384$8$1$")).toBe(true);
    expect(first).not.toContain("CorrectHorse!2026");
    expect(first).not.toBe(second);
  });

  it("verifies the correct password and rejects the wrong one", async () => {
    const hash = await hashPassword("CorrectHorse!2026");
    await expect(verifyPassword("CorrectHorse!2026", hash)).resolves.toBe(true);
    await expect(verifyPassword("correcthorse!2026", hash)).resolves.toBe(false);
  });

  it("rejects malformed stored hashes without throwing", async () => {
    await expect(verifyPassword("anything", "not-a-hash")).resolves.toBe(false);
    await expect(verifyPassword("anything", "scrypt$bad$8$1$salt$hash")).resolves.toBe(false);
    await expect(verifyPassword("anything", "")).resolves.toBe(false);
  });

  it("ships a usable dummy hash for timing equalization", async () => {
    await expect(verifyPassword("not-the-password", DUMMY_PASSWORD_HASH)).resolves.toBe(false);
  });
});
