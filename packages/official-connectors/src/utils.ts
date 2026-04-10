export function arrayify<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value == null ? [] : [value];
}

export function cleanWhitespace(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim();
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseSpanishDate(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (!match) {
    return undefined;
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function splitUrls(value?: string | null) {
  return cleanWhitespace(value)
    ?.split(/\s+/)
    .filter((entry) => entry.startsWith("http")) ?? [];
}

const htmlEntityMap: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\"",
};

export function decodeHtmlEntities(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, rawCode) => {
    const code = String(rawCode).toLowerCase();

    if (code.startsWith("#x")) {
      const decoded = Number.parseInt(code.slice(2), 16);
      return Number.isNaN(decoded) ? entity : String.fromCodePoint(decoded);
    }

    if (code.startsWith("#")) {
      const decoded = Number.parseInt(code.slice(1), 10);
      return Number.isNaN(decoded) ? entity : String.fromCodePoint(decoded);
    }

    return htmlEntityMap[code] ?? entity;
  });
}

export function stripMarkup(value?: string | null) {
  return cleanWhitespace(decodeHtmlEntities(value)?.replace(/<[^>]+>/g, " "));
}

export function toSpanishTitleCase(value?: string | null) {
  const cleaned = cleanWhitespace(value);

  if (!cleaned) {
    return undefined;
  }

  const titleCased = cleaned
    .toLocaleLowerCase("es-ES")
    .replace(/(^|[\s\-/'’(])([\p{L}])/gu, (_, prefix: string, letter: string) => {
      return `${prefix}${letter.toLocaleUpperCase("es-ES")}`;
    });

  return titleCased.replace(
    /\b(De|Del|La|Las|Los|Y|I|Da|Das|Dei|Della|Dels|Des|Do|Dos|Van|Von)\b/g,
    (word) => word.toLocaleLowerCase("es-ES"),
  );
}

export function normalizeInstitutionalPersonName(value: string) {
  const cleaned = stripMarkup(value) ?? value;
  const [lastNames, firstNames, ...rest] = cleaned.split(",").map((segment) => cleanWhitespace(segment) ?? "");

  if (rest.length === 0 && firstNames) {
    return cleanWhitespace(`${firstNames} ${lastNames}`) ?? cleaned;
  }

  return cleaned;
}

export function normalizePersonMatchKey(value: string) {
  return normalizeInstitutionalPersonName(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function extractXmlAttribute(xml: string, attributeName: string) {
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapedName}="([^"]+)"`);
  return xml.match(pattern)?.[1];
}

export function extractXmlBlocks(xml: string, tagName: string) {
  const escapedName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<${escapedName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedName}>`, "g");
  const blocks: string[] = [];

  for (const match of xml.matchAll(pattern)) {
    if (match[1]) {
      blocks.push(match[1]);
    }
  }

  return blocks;
}

export function extractXmlValue(xml: string, tagName: string) {
  const escapedName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<${escapedName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedName}>`);
  const rawValue = xml.match(pattern)?.[1];

  if (!rawValue) {
    return undefined;
  }

  return cleanWhitespace(
    decodeHtmlEntities(
      rawValue
        .replace(/^<!\[CDATA\[(.*)\]\]>$/s, "$1")
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"),
    ),
  );
}

function withDefaultHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (!headers.has("user-agent")) {
    headers.set("user-agent", "Mozilla/5.0 (compatible; EspanaIA/0.1)");
  }

  return {
    ...init,
    headers,
  } satisfies RequestInit;
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, withDefaultHeaders(init));

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, withDefaultHeaders(init));

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export function absoluteUrl(pathname: string, baseUrl: string) {
  return new URL(pathname, baseUrl).toString();
}

export function extractRequiredMatch(label: string, html: string, pattern: RegExp) {
  const match = html.match(pattern);

  if (!match?.[1]) {
    throw new Error(`Could not discover ${label} in official HTML source.`);
  }

  return match[1];
}
