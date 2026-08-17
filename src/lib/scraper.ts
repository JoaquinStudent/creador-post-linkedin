import * as cheerio from "cheerio";
import { resolve } from "dns/promises";

const BLOCKED_RANGES = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^169\.254\./, /^0\./, /^::1$/, /^fc/, /^fd/, /^fe80/,
];

async function validateUrl(raw: string) {
  const parsed = new URL(raw);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Solo URLs http/https");
  }
  let addrs: string[];
  try {
    addrs = await resolve(parsed.hostname);
  } catch {
    throw new Error("No se pudo resolver el hostname");
  }
  for (const addr of addrs) {
    if (BLOCKED_RANGES.some((r) => r.test(addr))) {
      throw new Error("URL apunta a red interna");
    }
  }
  return parsed.toString();
}

export async function scrapeUrl(url: string): Promise<string> {
  let safeUrl: string;
  try {
    safeUrl = await validateUrl(url);
  } catch (e) {
    return `[URL rechazada: ${(e as Error).message}]`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  const res = await fetch(safeUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LinkedInPostCreator/1.0; +personal-tool)",
    },
    redirect: "manual",
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    return `[No se pudo acceder a ${url} — status ${res.status}]`;
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, iframe, noscript").remove();

  const title = $("title").text().trim();
  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";
  const body = $("main, article, [role='main'], .event-description, .content")
    .first()
    .text()
    .trim()
    || $("body").text().trim();

  const cleaned = body.replace(/\s+/g, " ").slice(0, 3000);

  return [
    title && `Título: ${title}`,
    metaDesc && `Descripción: ${metaDesc}`,
    `Contenido: ${cleaned}`,
  ]
    .filter(Boolean)
    .join("\n");
}
