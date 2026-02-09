export type JobSourceKind =
  | "linkedin"
  | "glassdoor"
  | "glints"
  | "indeed"
  | "jobstreet"
  | "kalibrr"
  | "google_jobs"
  | "unknown";

export type JobSource = {
  kind: JobSourceKind;
  label: string;
  hostname?: string;
};

const SOURCE_RULES: Array<{
  kind: Exclude<JobSourceKind, "unknown">;
  label: string;
  domains: readonly string[];
}> = [
  {
    kind: "linkedin",
    label: "LinkedIn",
    domains: ["linkedin.com"],
  },
  {
    kind: "glassdoor",
    label: "Glassdoor",
    domains: ["glassdoor.com"],
  },
  {
    kind: "glints",
    label: "Glints",
    domains: ["glints.com"],
  },
  {
    kind: "indeed",
    label: "Indeed",
    domains: ["indeed.com", "id.indeed.com"],
  },
  {
    kind: "jobstreet",
    label: "JobStreet",
    domains: ["jobstreet.co.id", "jobstreet.com"],
  },
  {
    kind: "kalibrr",
    label: "Kalibrr",
    domains: ["kalibrr.com"],
  },
  {
    kind: "google_jobs",
    label: "Google Jobs",
    domains: ["google.com"],
  },
];

function toTitleCase(value: string) {
  const s = value.trim();
  if (!s) return "";

  return s
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function safeHostname(inputUrl: string): string {
  try {
    const u = new URL(inputUrl);
    return u.hostname;
  } catch {
    const m = inputUrl.trim().match(/^(?:https?:\/\/)?([^/]+)/i);
    return m?.[1] ?? "";
  }
}

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

function isIdSecondLevelTld(part: string) {
  return part === "co" || part === "ac" || part === "go" || part === "or" || part === "sch";
}

function guessBrandFromHostname(hostname: string) {
  const parts = normalizeHostname(hostname).split(".").filter(Boolean);
  if (parts.length <= 1) return toTitleCase(parts[0] ?? "");

  const last = parts.at(-1);
  const secondLast = parts.at(-2);
  const thirdLast = parts.at(-3);

  if (last === "id" && secondLast && isIdSecondLevelTld(secondLast) && thirdLast) {
    return toTitleCase(thirdLast);
  }

  return toTitleCase(secondLast ?? "");
}

function matchesDomain(hostname: string, domain: string) {
  const h = normalizeHostname(hostname);
  const d = normalizeHostname(domain);
  return h === d || h.endsWith(`.${d}`);
}

export function getJobSourceFromUrl(sourceUrl: string | undefined | null): JobSource {
  const raw = typeof sourceUrl === "string" ? sourceUrl.trim() : "";
  if (!raw) return { kind: "unknown", label: "Unknown" };

  const hostname = safeHostname(raw);
  const normalized = normalizeHostname(hostname);

  for (const rule of SOURCE_RULES) {
    if (rule.domains.some((d) => matchesDomain(normalized, d))) {
      return { kind: rule.kind, label: rule.label, hostname: normalized };
    }
  }

  const label = guessBrandFromHostname(normalized);
  return {
    kind: "unknown",
    label: label || "Unknown",
    hostname: normalized || undefined,
  };
}
