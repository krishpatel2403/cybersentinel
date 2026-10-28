import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseFile = path.join(os.tmpdir(), `cybersentinel-test-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_FILE = databaseFile;
delete process.env.TURSO_DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;

const { createAsset, getAssetById, listAssets, updateAsset } =
  await import("@/lib/repositories/assets");
const { createFinding, getFindingById, listActiveFindings, listFindings, updateFindingStatus } =
  await import("@/lib/repositories/findings");
const { createEvents, listEvents } = await import("@/lib/repositories/events");
const { writeAuditLog, listAuditEntries } = await import("@/lib/repositories/audit");
const { createUser, getUserByEmail } = await import("@/lib/repositories/users");
const { closeDb } = await import("@/lib/db/client");

const actor = { id: "test-user-id", email: "test@example.com" };
let assetId = "";
let findingId = "";

beforeAll(async () => {
  const user = await createUser({
    email: "Test@Example.com",
    name: "Test Analyst",
    role: "analyst",
    passwordHash: "scrypt$16384$8$1$salt$hash",
  });
  actor.id = user.id;
  actor.email = user.email;
});

afterAll(async () => {
  await closeDb();
  for (const suffix of ["", "-wal", "-shm"]) {
    try {
      fs.rmSync(`${databaseFile}${suffix}`, { force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Windows may keep a short-lived handle after close; the OS temp cleaner will collect it.
    }
  }
});

describe("repository integration", () => {
  it("creates and reads a user with normalized email", async () => {
    const user = await getUserByEmail("test@example.com");
    expect(user?.email).toBe("test@example.com");
    expect(user?.role).toBe("analyst");
    expect(user?.passwordHash).toBe("scrypt$16384$8$1$salt$hash");
  });

  it("creates, filters, and updates an asset", async () => {
    const asset = await createAsset({
      name: "Edge Gateway",
      hostname: "edge-01.example.com",
      ipAddress: "203.0.113.10",
      type: "network",
      criticality: 5,
      exposure: "internet",
      owner: "Network team",
      os: "PAN-OS 11",
      tags: ["edge", "public"],
    });
    assetId = asset.id;

    expect(asset.tags).toEqual(["edge", "public"]);
    expect(await getAssetById(asset.id)).toMatchObject({ hostname: "edge-01.example.com" });

    const filtered = await listAssets({ search: "edge-01", exposure: "internet" });
    expect(filtered.map((item) => item.id)).toContain(asset.id);

    expect(
      await updateAsset(asset.id, {
        name: "Edge Gateway",
        hostname: "edge-01.example.com",
        ipAddress: "203.0.113.10",
        type: "network",
        criticality: 4,
        exposure: "internet",
        owner: "Network team",
        os: "PAN-OS 11.1",
        tags: ["edge", "public", "pci"],
      }),
    ).toBe(true);

    expect(await getAssetById(asset.id)).toMatchObject({ criticality: 4, os: "PAN-OS 11.1" });
  });

  it("creates findings, filters them, and maintains resolved timestamps", async () => {
    const finding = await createFinding(
      {
        assetId,
        title: "PAN-OS command injection",
        description: "The management interface is exposed to untrusted networks.",
        severity: "critical",
        cvss: 10,
        cveId: "CVE-2024-3400",
        status: "open",
        remediation: "Upgrade PAN-OS and restrict management access.",
        dueDate: "2026-04-01",
      },
      actor.id,
    );
    findingId = finding.id;

    expect(finding.assetName).toBe("Edge Gateway");
    expect(finding.assetExposure).toBe("internet");

    const search = await listFindings({ search: "CVE-2024-3400" });
    expect(search.map((item) => item.id)).toContain(finding.id);

    const active = await listActiveFindings();
    expect(active.map((item) => item.id)).toContain(finding.id);

    expect(await updateFindingStatus(finding.id, "in_progress")).toBe(true);
    expect((await getFindingById(finding.id))?.status).toBe("in_progress");

    expect(await updateFindingStatus(finding.id, "resolved")).toBe(true);
    const resolved = await getFindingById(finding.id);
    expect(resolved?.status).toBe("resolved");
    expect(resolved?.resolvedAt).not.toBeNull();

    const activeAfter = await listActiveFindings();
    expect(activeAfter.map((item) => item.id)).not.toContain(finding.id);
  });

  it("stores and filters events", async () => {
    await createEvents([
      {
        source: "WAF",
        eventType: "Blocked exploit attempt",
        severity: "high",
        message: "Blocked a path traversal attempt against the customer portal.",
        assetId,
        occurredAt: new Date().toISOString(),
      },
      {
        source: "Scanner",
        eventType: "TLS drift",
        severity: "medium",
        message: "Detected a weakened TLS configuration.",
        assetId: null,
        occurredAt: new Date().toISOString(),
      },
    ]);

    const high = await listEvents({ severity: "high" });
    expect(high).toHaveLength(1);
    expect(high[0]?.assetName).toBe("Edge Gateway");

    const search = await listEvents({ search: "path traversal" });
    expect(search).toHaveLength(1);
  });

  it("writes structured audit entries", async () => {
    await writeAuditLog({
      actor,
      action: "finding.status_changed",
      entityType: "finding",
      entityId: findingId,
      details: { from: "open", to: "resolved" },
    });

    const entries = await listAuditEntries(10);
    expect(entries[0]?.action).toBe("finding.status_changed");
    expect(entries[0]?.actorEmail).toBe("test@example.com");
    expect(JSON.parse(entries[0]?.details ?? "{}")).toEqual({ from: "open", to: "resolved" });
  });
});
