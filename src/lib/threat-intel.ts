import { logger } from "@/lib/logger";
import type { ThreatAdvisory } from "@/types";

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const MAX_ADVISORIES = 24;

/**
 * Bundled fallback used when the live CISA KEV feed cannot be reached.
 * These are real, well-known advisories; dates and actions are abbreviated.
 * The UI always labels whether data is live or bundled.
 */
const SAMPLE_ADVISORIES: ThreatAdvisory[] = [
  {
    cveId: "CVE-2021-44228",
    vendorProject: "Apache",
    product: "Log4j2",
    name: "Apache Log4j2 Remote Code Execution Vulnerability",
    shortDescription:
      "JNDI features in Log4j2 do not protect against attacker-controlled LDAP endpoints, enabling remote code execution.",
    requiredAction:
      "Apply the vendor update and remove vulnerable JndiLookup classes where required.",
    dateAdded: "2021-12-10",
    dueDate: "2021-12-24",
    ransomwareUse: true,
  },
  {
    cveId: "CVE-2024-3400",
    vendorProject: "Palo Alto Networks",
    product: "PAN-OS GlobalProtect",
    name: "PAN-OS GlobalProtect Command Injection Vulnerability",
    shortDescription:
      "A command injection flaw in the GlobalProtect feature can allow unauthenticated remote code execution.",
    requiredAction: "Upgrade PAN-OS and apply the vendor mitigations until patched.",
    dateAdded: "2024-04-12",
    dueDate: "2024-04-19",
    ransomwareUse: false,
  },
  {
    cveId: "CVE-2023-4966",
    vendorProject: "Citrix",
    product: "NetScaler ADC and Gateway",
    name: "Citrix NetScaler Sensitive Information Disclosure",
    shortDescription:
      "A buffer-related flaw can leak session information and enable session hijacking.",
    requiredAction: "Install the vendor update and invalidate active sessions.",
    dateAdded: "2023-10-04",
    dueDate: "2023-10-25",
    ransomwareUse: true,
  },
  {
    cveId: "CVE-2023-34362",
    vendorProject: "Progress",
    product: "MOVEit Transfer",
    name: "MOVEit Transfer SQL Injection Vulnerability",
    shortDescription:
      "A SQL injection flaw in MOVEit Transfer can allow unauthorized access to the database.",
    requiredAction: "Apply the vendor patch, review for webshells, and rotate credentials.",
    dateAdded: "2023-06-02",
    dueDate: "2023-06-23",
    ransomwareUse: true,
  },
  {
    cveId: "CVE-2021-34473",
    vendorProject: "Microsoft",
    product: "Exchange Server",
    name: "Microsoft Exchange Server Remote Code Execution (ProxyShell)",
    shortDescription:
      "A path confusion flaw in Exchange could allow unauthenticated remote code execution.",
    requiredAction: "Apply the July 2021 Exchange cumulative updates and related security updates.",
    dateAdded: "2021-11-03",
    dueDate: "2021-11-17",
    ransomwareUse: true,
  },
  {
    cveId: "CVE-2022-22965",
    vendorProject: "VMware",
    product: "Spring Framework",
    name: "Spring Framework Remote Code Execution (Spring4Shell)",
    shortDescription:
      "Data binding to class loader properties can enable remote code execution on affected deployments.",
    requiredAction: "Upgrade Spring Framework or apply the vendor mitigation guidance.",
    dateAdded: "2022-04-04",
    dueDate: "2022-04-25",
    ransomwareUse: false,
  },
  {
    cveId: "CVE-2023-44487",
    vendorProject: "IETF",
    product: "HTTP/2",
    name: "HTTP/2 Rapid Reset Attack",
    shortDescription:
      "Rapid stream cancellation can be abused for denial-of-service against HTTP/2 servers.",
    requiredAction: "Apply vendor updates and rate limits for HTTP/2 request streams.",
    dateAdded: "2023-10-10",
    dueDate: "2023-10-31",
    ransomwareUse: false,
  },
  {
    cveId: "CVE-2017-0144",
    vendorProject: "Microsoft",
    product: "SMBv1",
    name: "Microsoft SMBv1 Remote Code Execution (EternalBlue)",
    shortDescription:
      "A flaw in SMBv1 allows remote code execution; it was used by WannaCry and other worms.",
    requiredAction: "Disable SMBv1 and apply the MS17-010 security update.",
    dateAdded: "2017-04-14",
    dueDate: "2017-05-05",
    ransomwareUse: true,
  },
];

export interface ThreatIntelResult {
  advisories: ThreatAdvisory[];
  source: "live" | "bundled";
  fetchedAt: string;
  note: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(record: Record<string, unknown>, key: string, max = 1000): string | null {
  const value = record[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function parseKevFeed(payload: unknown): ThreatAdvisory[] {
  if (!isRecord(payload) || !Array.isArray(payload.vulnerabilities)) return [];

  const advisories: ThreatAdvisory[] = [];
  for (const entry of payload.vulnerabilities) {
    if (!isRecord(entry)) continue;
    const cveId = stringField(entry, "cveID", 32);
    if (!cveId || !/^CVE-\d{4}-\d{4,}$/.test(cveId)) continue;

    const name = stringField(entry, "vulnerabilityName");
    const dateAdded = stringField(entry, "dateAdded", 32);
    if (!name || !dateAdded) continue;

    advisories.push({
      cveId,
      vendorProject: stringField(entry, "vendorProject", 120) ?? "Unknown",
      product: stringField(entry, "product", 160) ?? "Unknown",
      name,
      shortDescription: stringField(entry, "shortDescription", 800) ?? "",
      requiredAction: stringField(entry, "requiredAction", 800) ?? "",
      dateAdded,
      dueDate: stringField(entry, "dueDate", 32),
      ransomwareUse: stringField(entry, "knownRansomwareCampaignUse", 32) === "Known",
    });
    if (advisories.length >= 500) break;
  }

  return advisories.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, MAX_ADVISORIES);
}

export async function getThreatAdvisories(): Promise<ThreatIntelResult> {
  try {
    const response = await fetch(KEV_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 21_600 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`CISA feed returned HTTP ${response.status}`);
    const payload: unknown = await response.json();
    const advisories = parseKevFeed(payload);
    if (advisories.length === 0) throw new Error("CISA feed contained no usable advisories");

    return {
      advisories,
      source: "live",
      fetchedAt: new Date().toISOString(),
      note: null,
    };
  } catch (error) {
    logger.warn("threat_intel.fetch_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      advisories: SAMPLE_ADVISORIES,
      source: "bundled",
      fetchedAt: new Date().toISOString(),
      note: "The live CISA KEV feed could not be reached. Showing a bundled sample of well-known advisories instead.",
    };
  }
}

export { SAMPLE_ADVISORIES };
