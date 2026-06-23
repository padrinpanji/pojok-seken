import "server-only";
import { createSupabaseAdminClient, getSupabaseAdminConfigError } from "@/lib/supabase-admin";

const SAFE_FALLBACK_IMAGE = "/logo-pojok-seken.svg";

export const SCRAPE_SOURCES = [
  {
    id: "rumah123",
    label: "Rumah123",
    url: "https://rumah123.com/jual/cari",
    fallbackImage: SAFE_FALLBACK_IMAGE
  },
  {
    id: "olx-bandung",
    label: "OLX Bandung",
    url: "https://www.olx.co.id/bandung-kota_g4000018/q-barang-bekas",
    fallbackImage: SAFE_FALLBACK_IMAGE
  }
] as const;

type DefaultScrapeSource = (typeof SCRAPE_SOURCES)[number];
export type ScrapeSourceId = DefaultScrapeSource["id"];
export type ScrapeSource = Omit<DefaultScrapeSource, "url"> & {
  defaultUrl: string;
  isCustomUrl: boolean;
  url: string;
};

type JsonRecord = Record<string, unknown>;
type ScrapedRawValue = string | number | boolean | null;
export type ScrapedRawData = Record<string, ScrapedRawValue>;

type PriceInfo = {
  price: number | null;
  priceText: string;
};

type ScrapedProductDraft = {
  source: string;
  sourceLabel: string;
  sourceUrl: string;
  imageUrl: string;
  title: string;
  description: string;
  price: number | null;
  priceText: string;
  detailUrl: string;
  raw: ScrapedRawData;
};

export type ScrapedProduct = ScrapedProductDraft & {
  id?: number;
  scrapedAt: string;
};

export type ScrapeSourceResult = {
  source: string;
  sourceLabel: string;
  sourceUrl: string;
  count: number;
  error?: string;
};

export type ScrapeRunResult = {
  products: ScrapedProduct[];
  sources: ScrapeSourceResult[];
  scrapedAt: string;
};

type ScrapeSourcesResult = {
  sources: ScrapeSource[];
  error?: string;
  usedFallback: boolean;
};

type ScrapedProductDbRow = {
  id: number | string | null;
  source: string | null;
  source_label: string | null;
  source_url: string | null;
  image_url: string | null;
  title: string | null;
  description: string | null;
  price: number | string | null;
  price_text: string | null;
  detail_url: string | null;
  raw: unknown;
  scraped_at: string | null;
};

type ScrapeSourceSettingDbRow = {
  source: string | null;
  target_url: string | null;
};

type StoredScrapedProductsResult = {
  products: ScrapedProduct[];
  error?: string;
  usedFallback: boolean;
};

type SaveScrapedProductsResult = {
  savedCount: number;
  error?: string;
  usedFallback: boolean;
};

type DeleteScrapedProductResult = {
  deletedCount: number;
  error?: string;
  usedFallback: boolean;
};

type SaveScrapeSourceUrlResult = {
  error?: string;
  targetUrl: string;
  usedFallback: boolean;
};

const MAX_PRODUCTS_PER_SOURCE = 12;
const REQUEST_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
};
const IMAGE_REQUEST_HEADERS = {
  ...REQUEST_HEADERS,
  accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
};

let fallbackScrapedProducts: ScrapedProduct[] = [];
let fallbackScrapeSourceUrls: Partial<Record<ScrapeSourceId, string>> = {};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\"",
    apos: "'"
  };

  return value
    .replace(/&#(\d+);/g, (_match, entity: string) => String.fromCodePoint(Number(entity)))
    .replace(/&#x([a-f0-9]+);/gi, (_match, entity: string) => String.fromCodePoint(Number.parseInt(entity, 16)))
    .replace(/&([a-z]+);/gi, (match, entity: string) => namedEntities[entity.toLowerCase()] || match);
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function normalizeText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function isScrapeSourceId(value: string): value is ScrapeSourceId {
  return SCRAPE_SOURCES.some((source) => source.id === value);
}

function getDefaultScrapeSourceById(sourceId: string) {
  return SCRAPE_SOURCES.find((source) => source.id === sourceId);
}

function normalizeScrapeTargetUrl(value: string) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function toConfiguredScrapeSource(defaultSource: DefaultScrapeSource, targetUrl?: string | null): ScrapeSource {
  const normalizedTargetUrl = normalizeScrapeTargetUrl(targetUrl || "");
  const defaultUrl = defaultSource.url;
  const url = normalizedTargetUrl || defaultUrl;

  return {
    ...defaultSource,
    defaultUrl,
    isCustomUrl: url !== defaultUrl,
    url
  };
}

function limitText(value: string, maxLength: number) {
  const normalized = normalizeText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function absoluteUrl(value: string, baseUrl: string) {
  const normalized = normalizeText(value);

  if (!normalized || normalized.startsWith("data:")) {
    return "";
  }

  try {
    const url = new URL(normalized, baseUrl);

    if (url.pathname.endsWith("/_next/image") || url.pathname.endsWith("/_next/image/")) {
      const nestedUrl = url.searchParams.get("url");

      if (nestedUrl) {
        const normalizedNestedUrl = nestedUrl.replace(/^https:\/(?!\/)/i, "https://").replace(/^http:\/(?!\/)/i, "http://");

        return new URL(normalizedNestedUrl, baseUrl).toString();
      }
    }

    return url.toString();
  } catch {
    return "";
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLocalImageUrl(imageUrl: string) {
  return imageUrl.startsWith("/");
}

function isFaviconImageUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl, "https://www.rumah123.com");
    const pathname = url.pathname.toLowerCase();

    return pathname.endsWith("/favicon.ico") || pathname.includes("favicon");
  } catch {
    return false;
  }
}

function isDisallowedImageUrl(imageUrl: string, sourceId?: string | null) {
  if (!imageUrl.trim() || isFaviconImageUrl(imageUrl)) {
    return true;
  }

  if (isLocalImageUrl(imageUrl)) {
    return false;
  }

  try {
    const url = new URL(imageUrl);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (sourceId === "rumah123") {
      if (pathname.includes("/logo/") || pathname.includes("/photo/") || hostname === "pic.rumah123.com") {
        return true;
      }

      return !isLikelyRumah123PropertyImage(imageUrl);
    }

    return pathname.includes("/logo/") || pathname.includes("/asset-core/");
  } catch {
    return true;
  }
}

function getSafeImageUrl(imageUrl: string | null | undefined, sourceId?: string | null) {
  const normalizedImageUrl = normalizeText(imageUrl || "");

  return isDisallowedImageUrl(normalizedImageUrl, sourceId) ? SAFE_FALLBACK_IMAGE : normalizedImageUrl;
}

function chooseBetterImageUrl(currentImageUrl: string, nextImageUrl: string, sourceId: string) {
  const currentAllowed = !isDisallowedImageUrl(currentImageUrl, sourceId);
  const nextAllowed = !isDisallowedImageUrl(nextImageUrl, sourceId);

  if (nextAllowed && (!currentAllowed || !currentImageUrl)) {
    return nextImageUrl;
  }

  return currentAllowed ? currentImageUrl : "";
}

function isImageResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  return response.ok && (!contentType || contentType.toLowerCase().startsWith("image/"));
}

async function isReachableImageUrl(imageUrl: string) {
  if (isLocalImageUrl(imageUrl)) {
    return true;
  }

  try {
    const headResponse = await fetch(imageUrl, {
      method: "HEAD",
      headers: IMAGE_REQUEST_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    if (isImageResponse(headResponse)) {
      return true;
    }
  } catch {
    // Some image hosts block HEAD; fall through to a tiny GET request.
  }

  try {
    const getResponse = await fetch(imageUrl, {
      headers: {
        ...IMAGE_REQUEST_HEADERS,
        range: "bytes=0-1023"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    return isImageResponse(getResponse);
  } catch {
    return false;
  }
}

async function ensureDraftHasReachableImage(draft: ScrapedProductDraft, source: ScrapeSource) {
  const imageUrl = getSafeImageUrl(draft.imageUrl, source.id);

  if (imageUrl === SAFE_FALLBACK_IMAGE) {
    return source.id === "rumah123" ? null : { ...draft, imageUrl };
  }

  if (await isReachableImageUrl(imageUrl)) {
    return {
      ...draft,
      imageUrl
    };
  }

  return source.id === "rumah123" ? null : { ...draft, imageUrl: SAFE_FALLBACK_IMAGE };
}

function parseAttributes(tag: string) {
  const attributes: Record<string, string> = {};
  const attributePattern = /([a-zA-Z_:.-]+)\s*=\s*(["'])([\s\S]*?)\2/g;
  let attributeMatch = attributePattern.exec(tag);

  while (attributeMatch) {
    attributes[attributeMatch[1].toLowerCase()] = decodeHtmlEntities(attributeMatch[3]);
    attributeMatch = attributePattern.exec(tag);
  }

  return attributes;
}

function getMetaContent(html: string, keys: string[]) {
  const normalizedKeys = keys.map((key) => key.toLowerCase());
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const attributes = parseAttributes(tag);
    const key = (attributes.property || attributes.name || attributes.itemprop || "").toLowerCase();

    if (normalizedKeys.includes(key) && attributes.content) {
      return normalizeText(attributes.content);
    }
  }

  return "";
}

function getLinkHref(html: string, relName: string) {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];

  for (const tag of linkTags) {
    const attributes = parseAttributes(tag);

    if ((attributes.rel || "").toLowerCase() === relName.toLowerCase() && attributes.href) {
      return normalizeText(attributes.href);
    }
  }

  return "";
}

function getTitleTag(html: string) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);

  return titleMatch ? normalizeTitle(stripTags(titleMatch[1])) : "";
}

function normalizeTitle(value: string) {
  return normalizeText(value)
    .replace(/\s*[|-]\s*(OLX.*|Rumah123.*|rumah123\.com).*$/i, "")
    .trim();
}

function extractImageFromHtml(html: string, baseUrl: string) {
  const imageTags = html.match(/<img\b[^>]*>/gi) || [];

  for (const tag of imageTags) {
    const attributes = parseAttributes(tag);
    const imageSource = attributes.src || attributes["data-src"] || attributes["data-original"] || attributes.srcset || "";
    const firstSource = imageSource.split(",")[0]?.trim().split(/\s+/)[0] || "";
    const imageUrl = absoluteUrl(firstSource, baseUrl);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return "";
}

function extractImageUrlFromTag(tag: string, baseUrl: string) {
  const attributes = parseAttributes(tag);
  const imageSource =
    attributes.src ||
    attributes["data-src"] ||
    attributes["data-original"] ||
    attributes.srcset ||
    attributes.imagesrcset ||
    "";
  const firstSource = imageSource.split(",")[0]?.trim().split(/\s+/)[0] || "";

  return absoluteUrl(firstSource, baseUrl);
}

function getElementTextByAttribute(html: string, attributeName: string, attributeValue: string) {
  const pattern = new RegExp(
    `<([a-z0-9]+)\\b[^>]*${escapeRegExp(attributeName)}=(["'])${escapeRegExp(attributeValue)}\\2[^>]*>([\\s\\S]*?)<\\/\\1>`,
    "i"
  );
  const match = html.match(pattern);

  return match ? normalizeText(stripTags(match[3])) : "";
}

function parsePriceInfo(value: string): PriceInfo {
  const text = normalizeText(value);
  const freeMatch = text.match(/\bgratis\b/i);

  if (freeMatch) {
    return {
      price: 0,
      priceText: freeMatch[0]
    };
  }

  const priceMatch = text.match(/\b(?:rp|idr)\s*([0-9][0-9.,\s]*)(?:\s*(miliar|milyar|juta|ribu|rb|jt|m))?/i);

  if (!priceMatch) {
    return {
      price: null,
      priceText: ""
    };
  }

  const numericText = priceMatch[1].replace(/\s+/g, "");
  const unit = (priceMatch[2] || "").toLowerCase();
  let valueNumber = 0;

  if (unit) {
    valueNumber = Number(numericText.replace(/\./g, "").replace(",", "."));
  } else {
    valueNumber = Number(numericText.replace(/[^\d]/g, ""));
  }

  if (!Number.isFinite(valueNumber)) {
    return {
      price: null,
      priceText: normalizeText(priceMatch[0])
    };
  }

  const multiplier =
    unit === "miliar" || unit === "milyar" || unit === "m"
      ? 1_000_000_000
      : unit === "juta" || unit === "jt"
        ? 1_000_000
        : unit === "ribu" || unit === "rb"
          ? 1_000
          : 1;

  return {
    price: Math.round(valueNumber * multiplier),
    priceText: normalizeText(priceMatch[0])
  };
}

function formatPriceText(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price);
}

function normalizeRequiredPrice(price: number | null, priceText: string) {
  const normalizedPriceText = normalizeText(priceText);

  if (/\bgratis\b/i.test(normalizedPriceText)) {
    return null;
  }

  if (typeof price === "number" && Number.isFinite(price) && price > 0) {
    return {
      price,
      priceText: normalizedPriceText || formatPriceText(price)
    };
  }

  const parsedPrice = parsePriceInfo(normalizedPriceText);

  if (parsedPrice.price && parsedPrice.price > 0) {
    return {
      price: parsedPrice.price,
      priceText: normalizedPriceText || parsedPrice.priceText || formatPriceText(parsedPrice.price)
    };
  }

  return null;
}

function ensureDraftHasRequiredPrice(draft: ScrapedProductDraft): ScrapedProductDraft | null {
  const price = normalizeRequiredPrice(draft.price, draft.priceText);

  if (!price) {
    return null;
  }

  return {
    ...draft,
    price: price.price,
    priceText: price.priceText,
    raw: {
      ...draft.raw,
      priceRequired: true
    }
  };
}

function normalizeScrapedProductPrice(product: ScrapedProduct): ScrapedProduct | null {
  const price = normalizeRequiredPrice(product.price, product.priceText);

  if (!price) {
    return null;
  }

  return {
    ...product,
    price: price.price,
    priceText: price.priceText
  };
}

function getValidFallbackScrapedProducts() {
  fallbackScrapedProducts = fallbackScrapedProducts
    .map(normalizeScrapedProductPrice)
    .filter((product): product is ScrapedProduct => Boolean(product));

  return fallbackScrapedProducts;
}

function readString(value: unknown) {
  if (typeof value === "string") {
    return normalizeText(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (isRecord(value)) {
    return readString(value.url || value["@id"] || value.contentUrl);
  }

  return "";
}

function normalizeRawData(value: unknown): ScrapedRawData {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, ScrapedRawValue] => {
      const entryValue = entry[1];

      return (
        typeof entryValue === "string" ||
        typeof entryValue === "number" ||
        typeof entryValue === "boolean" ||
        entryValue === null
      );
    })
  );
}

function readFirstString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = readString(record[key]);

    if (value) {
      return value;
    }
  }

  return "";
}

function readJsonType(record: JsonRecord) {
  const value = record["@type"];

  if (Array.isArray(value)) {
    return value.map(readString).join(" ").toLowerCase();
  }

  return readString(value).toLowerCase();
}

function readImageValue(value: unknown, baseUrl: string): string {
  if (typeof value === "string") {
    return absoluteUrl(value, baseUrl);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const imageUrl: string = readImageValue(item, baseUrl);

      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  if (isRecord(value)) {
    return readImageValue(value.url || value.contentUrl || value.thumbnailUrl, baseUrl);
  }

  return "";
}

function readOfferPrice(record: JsonRecord): PriceInfo {
  const offers = record.offers;
  const offerRecord = Array.isArray(offers) ? offers.find(isRecord) : offers;
  const priceSource = isRecord(offerRecord) ? offerRecord : record;
  const priceText = readFirstString(priceSource, ["price", "lowPrice", "highPrice", "priceSpecification"]);
  const currency = readFirstString(priceSource, ["priceCurrency"]);

  if (!priceText) {
    return parsePriceInfo(readFirstString(record, ["price", "priceText"]));
  }

  const parsedPrice = Number(String(priceText).replace(/[^\d.]/g, ""));

  if (Number.isFinite(parsedPrice) && parsedPrice > 0) {
    return {
      price: Math.round(parsedPrice),
      priceText: currency.toUpperCase() === "IDR" || !currency ? formatPriceText(parsedPrice) : `${currency} ${priceText}`
    };
  }

  return parsePriceInfo(priceText);
}

function recordToDraft(record: JsonRecord, source: ScrapeSource): ScrapedProductDraft | null {
  const type = readJsonType(record);
  const title = normalizeTitle(readFirstString(record, ["name", "title", "headline"]));
  const detailUrl = absoluteUrl(readFirstString(record, ["url", "mainEntityOfPage", "@id"]), source.url);
  const imageUrl = readImageValue(record.image || record.thumbnailUrl || record.photo, source.url);
  const price = readOfferPrice(record);
  const description = readFirstString(record, ["description", "caption", "summary"]);
  const looksLikeProduct =
    type.includes("product") ||
    type.includes("offer") ||
    type.includes("realestatelisting") ||
    type.includes("house") ||
    Boolean(record.offers) ||
    Boolean(price.priceText);

  if (!title || !detailUrl || !looksLikeProduct) {
    return null;
  }

  return {
    source: source.id,
    sourceLabel: source.label,
    sourceUrl: source.url,
    imageUrl: getSafeImageUrl(imageUrl, source.id),
    title: limitText(title, 160),
    description: limitText(description || title, 320),
    price: price.price,
    priceText: price.priceText,
    detailUrl,
    raw: {
      extractor: "json-ld",
      schemaType: type || null
    }
  };
}

function parseJsonCandidate(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getScriptContentById(html: string, scriptId: string) {
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch = scriptPattern.exec(html);

  while (scriptMatch) {
    const attributes = parseAttributes(`<script ${scriptMatch[1]}>`);

    if (attributes.id === scriptId) {
      return decodeHtmlEntities(scriptMatch[2]).trim();
    }

    scriptMatch = scriptPattern.exec(html);
  }

  return "";
}

function getRumah123SeoRescuePayload(html: string) {
  const parsed = parseJsonCandidate(getScriptContentById(html, "__ldp_seo_rescue"));

  return isRecord(parsed) ? parsed : null;
}

function isLikelyRumah123PropertyImage(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    return hostname.includes("picture.rumah123.com") && pathname.includes("/r123-images/") && pathname.includes("/customer/");
  } catch {
    return false;
  }
}

function extractRumah123MainImage(html: string, detailUrl: string) {
  const imageTags = html.match(/<img\b[^>]*>/gi) || [];

  for (const tag of imageTags) {
    const attributes = parseAttributes(tag);
    const testId = attributes["data-test-id"] || attributes["data-testid"] || "";

    if (testId === "ldp-image-main") {
      const imageUrl = extractImageUrlFromTag(tag, detailUrl);

      if (imageUrl && isLikelyRumah123PropertyImage(imageUrl)) {
        return imageUrl;
      }
    }
  }

  for (const tag of imageTags) {
    const imageUrl = extractImageUrlFromTag(tag, detailUrl);

    if (imageUrl && isLikelyRumah123PropertyImage(imageUrl)) {
      return imageUrl;
    }
  }

  return "";
}

function extractRumah123PriceInfo(html: string) {
  const rescuePayload = getRumah123SeoRescuePayload(html);
  const listingInfo = rescuePayload && isRecord(rescuePayload.listingInfo) ? rescuePayload.listingInfo : null;
  const priceCandidates = [
    listingInfo ? readString(listingInfo.price) : "",
    getElementTextByAttribute(html, "data-testid", "ldp-text-price"),
    getElementTextByAttribute(html, "data-test-id", "ldp-text-price")
  ];

  for (const priceText of priceCandidates) {
    const normalizedPriceText = normalizeText(priceText);

    if (!normalizedPriceText) {
      continue;
    }

    const price = parsePriceInfo(normalizedPriceText);

    if (price.price !== null || price.priceText) {
      return {
        price: price.price,
        priceText: normalizedPriceText
      };
    }
  }

  return null;
}

function collectStructuredDrafts(value: unknown, source: ScrapeSource, drafts: ScrapedProductDraft[], depth = 0) {
  if (depth > 8 || !value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStructuredDrafts(item, source, drafts, depth + 1));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  const draft = recordToDraft(value, source);

  if (draft) {
    drafts.push(draft);
  }

  Object.values(value).forEach((nestedValue) => collectStructuredDrafts(nestedValue, source, drafts, depth + 1));
}

function extractStructuredDrafts(html: string, source: ScrapeSource) {
  const drafts: ScrapedProductDraft[] = [];
  const scriptPattern = /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch = scriptPattern.exec(html);

  while (scriptMatch) {
    const parsed = parseJsonCandidate(decodeHtmlEntities(scriptMatch[2]).trim());
    collectStructuredDrafts(parsed, source, drafts);
    scriptMatch = scriptPattern.exec(html);
  }

  return drafts;
}

function isLikelyDetailUrl(url: string, source: ScrapeSource) {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();

    if (source.id === "olx-bandung") {
      return parsedUrl.hostname.includes("olx.co.id") && (path.includes("/item/") || path.includes("-iid-") || path.endsWith(".html"));
    }

    if (source.id === "rumah123") {
      return parsedUrl.hostname.includes("rumah123.com") && path !== "/jual/cari" && path.includes("properti");
    }

    return false;
  } catch {
    return false;
  }
}

function deriveTitleFromAnchor(text: string, priceText: string) {
  const withoutPrice = priceText ? text.replace(priceText, " ") : text;
  const title = withoutPrice
    .replace(/\b(hari ini|kemarin|\d+\s+hari yang lalu)\b.*$/i, "")
    .replace(/\b\d{2}\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalizeTitle(title || text);
}

function extractAnchorDrafts(html: string, source: ScrapeSource) {
  const drafts: ScrapedProductDraft[] = [];
  const anchorPattern = /<a\b[^>]*href=(["'])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch = anchorPattern.exec(html);

  while (anchorMatch) {
    const href = decodeHtmlEntities(anchorMatch[2]);
    const detailUrl = absoluteUrl(href, source.url);

    if (!detailUrl || !isLikelyDetailUrl(detailUrl, source)) {
      anchorMatch = anchorPattern.exec(html);
      continue;
    }

    const text = limitText(stripTags(anchorMatch[3]), 420);
    const price = parsePriceInfo(text);
    const title = deriveTitleFromAnchor(text, price.priceText);

    if (!title || title.length < 6) {
      anchorMatch = anchorPattern.exec(html);
      continue;
    }

    const nearbyHtml = html.slice(Math.max(0, anchorMatch.index - 1200), Math.min(html.length, anchorMatch.index + anchorMatch[0].length + 1600));
    const imageUrl = getSafeImageUrl(extractImageFromHtml(nearbyHtml, source.url), source.id);

    drafts.push({
      source: source.id,
      sourceLabel: source.label,
      sourceUrl: source.url,
      imageUrl,
      title: limitText(title, 160),
      description: text || limitText(title, 320),
      price: price.price,
      priceText: price.priceText,
      detailUrl,
      raw: {
        extractor: "anchor"
      }
    });

    anchorMatch = anchorPattern.exec(html);
  }

  return drafts;
}

function extractMetadataDraft(html: string, source: ScrapeSource, detailUrl: string): Partial<ScrapedProductDraft> {
  const canonicalUrl = absoluteUrl(getLinkHref(html, "canonical"), detailUrl) || detailUrl;
  const title = normalizeTitle(getMetaContent(html, ["og:title", "twitter:title"]) || getTitleTag(html));
  const description = getMetaContent(html, ["og:description", "twitter:description", "description"]);
  const imageUrl = absoluteUrl(getMetaContent(html, ["og:image", "twitter:image", "image"]), detailUrl);
  const price = parsePriceInfo(html);
  const structuredDrafts = extractStructuredDrafts(html, source);
  const structuredDraft = structuredDrafts.find((draft) => draft.detailUrl === canonicalUrl) || structuredDrafts[0];
  const rumah123ImageUrl = source.id === "rumah123" ? extractRumah123MainImage(html, detailUrl) : "";
  const rumah123Price = source.id === "rumah123" ? extractRumah123PriceInfo(html) : null;

  return {
    title: structuredDraft?.title || title,
    description: structuredDraft?.description || description,
    imageUrl: rumah123ImageUrl || structuredDraft?.imageUrl || imageUrl,
    price: rumah123Price?.price ?? structuredDraft?.price ?? price.price,
    priceText: rumah123Price?.priceText || structuredDraft?.priceText || price.priceText,
    detailUrl: canonicalUrl
  };
}

function dedupeDrafts(drafts: ScrapedProductDraft[]) {
  const draftMap = new Map<string, ScrapedProductDraft>();

  drafts.forEach((draft) => {
    const existingDraft = draftMap.get(draft.detailUrl);

    if (!existingDraft) {
      draftMap.set(draft.detailUrl, draft);
      return;
    }

    draftMap.set(draft.detailUrl, {
      ...existingDraft,
      title: existingDraft.title || draft.title,
      description: existingDraft.description.length >= draft.description.length ? existingDraft.description : draft.description,
      imageUrl: chooseBetterImageUrl(existingDraft.imageUrl, draft.imageUrl, draft.source),
      price: existingDraft.price ?? draft.price,
      priceText: existingDraft.priceText || draft.priceText,
      raw: {
        ...existingDraft.raw,
        mergedExtractor: draft.raw.extractor || null
      }
    });
  });

  return Array.from(draftMap.values());
}

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(18_000)
    });

    const html = await response.text();

    if (!response.ok) {
      return {
        html: "",
        error: `${response.status} ${response.statusText}`.trim()
      };
    }

    if (!html.trim()) {
      return {
        html: "",
        error: "The source returned an empty response."
      };
    }

    return {
      html,
      error: ""
    };
  } catch (error) {
    return {
      html: "",
      error: error instanceof Error ? error.message : "Unable to fetch source."
    };
  }
}

async function enrichDraft(draft: ScrapedProductDraft, source: ScrapeSource) {
  const response = await fetchHtml(draft.detailUrl);

  if (!response.html) {
    return draft;
  }

  const metadata = extractMetadataDraft(response.html, source, draft.detailUrl);

  return {
    ...draft,
    title: metadata.title ? limitText(metadata.title, 160) : draft.title,
    description: metadata.description ? limitText(metadata.description, 320) : draft.description,
    imageUrl: chooseBetterImageUrl(draft.imageUrl, metadata.imageUrl || "", source.id),
    price: metadata.price ?? draft.price,
    priceText: metadata.priceText || draft.priceText,
    detailUrl: metadata.detailUrl || draft.detailUrl,
    raw: {
      ...draft.raw,
      detailExtractor: "metadata"
    }
  };
}

export function getBaseScrapeSourceById(sourceId: string) {
  return getDefaultScrapeSourceById(sourceId);
}

export async function getScrapeSources(): Promise<ScrapeSourcesResult> {
  const fallbackSources = SCRAPE_SOURCES.map((source) => toConfiguredScrapeSource(source, fallbackScrapeSourceUrls[source.id]));
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      sources: fallbackSources,
      error: getSupabaseAdminConfigError(),
      usedFallback: true
    };
  }

  const { data, error } = await supabase
    .from("scraping_source_settings")
    .select("source, target_url")
    .in(
      "source",
      SCRAPE_SOURCES.map((source) => source.id)
    );

  if (error) {
    return {
      sources: fallbackSources,
      error: error.message,
      usedFallback: true
    };
  }

  const settings = new Map<ScrapeSourceId, string>();

  ((data || []) as ScrapeSourceSettingDbRow[]).forEach((setting) => {
    if (setting.source && isScrapeSourceId(setting.source) && setting.target_url) {
      settings.set(setting.source, setting.target_url);
    }
  });

  return {
    sources: SCRAPE_SOURCES.map((source) => toConfiguredScrapeSource(source, settings.get(source.id))),
    usedFallback: false
  };
}

export async function getScrapeSourceById(sourceId: string) {
  if (!getDefaultScrapeSourceById(sourceId)) {
    return undefined;
  }

  const { sources } = await getScrapeSources();

  return sources.find((source) => source.id === sourceId);
}

export async function saveScrapeSourceUrl(sourceId: ScrapeSourceId, targetUrl: string): Promise<SaveScrapeSourceUrlResult> {
  const defaultSource = getDefaultScrapeSourceById(sourceId);

  if (!defaultSource) {
    return {
      targetUrl: "",
      error: "Unknown scrape source.",
      usedFallback: true
    };
  }

  const normalizedTargetUrl = normalizeScrapeTargetUrl(targetUrl);

  if (!normalizedTargetUrl) {
    return {
      targetUrl: defaultSource.url,
      error: "Target URL harus memakai format http:// atau https://.",
      usedFallback: true
    };
  }

  fallbackScrapeSourceUrls = {
    ...fallbackScrapeSourceUrls,
    [sourceId]: normalizedTargetUrl
  };

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      targetUrl: normalizedTargetUrl,
      error: getSupabaseAdminConfigError(),
      usedFallback: true
    };
  }

  const { error } = await supabase.from("scraping_source_settings").upsert(
    {
      source: sourceId,
      target_url: normalizedTargetUrl,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "source"
    }
  );

  if (error) {
    return {
      targetUrl: normalizedTargetUrl,
      error: error.message,
      usedFallback: true
    };
  }

  return {
    targetUrl: normalizedTargetUrl,
    usedFallback: false
  };
}

export async function resetScrapeSourceUrl(sourceId: ScrapeSourceId): Promise<SaveScrapeSourceUrlResult> {
  const defaultSource = getDefaultScrapeSourceById(sourceId);

  if (!defaultSource) {
    return {
      targetUrl: "",
      error: "Unknown scrape source.",
      usedFallback: true
    };
  }

  const nextFallbackScrapeSourceUrls = { ...fallbackScrapeSourceUrls };

  delete nextFallbackScrapeSourceUrls[sourceId];
  fallbackScrapeSourceUrls = nextFallbackScrapeSourceUrls;

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      targetUrl: defaultSource.url,
      error: getSupabaseAdminConfigError(),
      usedFallback: true
    };
  }

  const { error } = await supabase.from("scraping_source_settings").delete().eq("source", sourceId);

  if (error) {
    return {
      targetUrl: defaultSource.url,
      error: error.message,
      usedFallback: true
    };
  }

  return {
    targetUrl: defaultSource.url,
    usedFallback: false
  };
}

function toScrapedProduct(draft: ScrapedProductDraft, scrapedAt: string): ScrapedProduct {
  return {
    ...draft,
    imageUrl: getSafeImageUrl(draft.imageUrl, draft.source),
    scrapedAt
  };
}

async function scrapeSource(source: ScrapeSource, scrapedAt: string) {
  const response = await fetchHtml(source.url);

  if (!response.html) {
    return {
      products: [],
      result: {
        source: source.id,
        sourceLabel: source.label,
        sourceUrl: source.url,
        count: 0,
        error: response.error || "No HTML returned."
      }
    };
  }

  const drafts = dedupeDrafts([...extractStructuredDrafts(response.html, source), ...extractAnchorDrafts(response.html, source)]).slice(0, MAX_PRODUCTS_PER_SOURCE);
  const enrichedDrafts = await Promise.all(drafts.map((draft) => enrichDraft(draft, source)));
  const pricedDrafts = dedupeDrafts(enrichedDrafts)
    .map(ensureDraftHasRequiredPrice)
    .filter((draft): draft is ScrapedProductDraft => Boolean(draft));
  const reachableDrafts = await Promise.all(pricedDrafts.map((draft) => ensureDraftHasReachableImage(draft, source)));
  const products = reachableDrafts
    .filter((draft): draft is ScrapedProductDraft => Boolean(draft))
    .map((draft) => toScrapedProduct(draft, scrapedAt));

  return {
    products,
    result: {
      source: source.id,
      sourceLabel: source.label,
      sourceUrl: source.url,
      count: products.length,
      error: products.length ? undefined : "No product records with valid image and price were found."
    }
  };
}

export async function scrapeProductSources(): Promise<ScrapeRunResult> {
  const scrapedAt = new Date().toISOString();
  const { sources } = await getScrapeSources();
  const sourceRuns = await Promise.all(sources.map((source) => scrapeSource(source, scrapedAt)));

  return {
    products: sourceRuns.flatMap((sourceRun) => sourceRun.products),
    sources: sourceRuns.map((sourceRun) => sourceRun.result),
    scrapedAt
  };
}

export async function scrapeProductSource(sourceId: ScrapeSourceId): Promise<ScrapeRunResult> {
  const scrapedAt = new Date().toISOString();
  const source = await getScrapeSourceById(sourceId);

  if (!source) {
    return {
      products: [],
      sources: [
        {
          source: sourceId,
          sourceLabel: sourceId,
          sourceUrl: "",
          count: 0,
          error: "Unknown scrape source."
        }
      ],
      scrapedAt
    };
  }

  const sourceRun = await scrapeSource(source, scrapedAt);

  return {
    products: sourceRun.products,
    sources: [sourceRun.result],
    scrapedAt
  };
}

function mapDbRow(row: ScrapedProductDbRow): ScrapedProduct | null {
  if (!row.source || !row.source_label || !row.source_url || !row.title || !row.detail_url) {
    return null;
  }

  const id = Number(row.id);
  const numericPrice = Number(row.price);
  const normalizedPrice = normalizeRequiredPrice(Number.isFinite(numericPrice) ? numericPrice : null, row.price_text || "");

  if (!normalizedPrice) {
    return null;
  }

  return {
    id: Number.isFinite(id) ? id : undefined,
    source: row.source,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url,
    imageUrl: getSafeImageUrl(row.image_url, row.source),
    title: row.title,
    description: row.description || row.title,
    price: normalizedPrice.price,
    priceText: normalizedPrice.priceText,
    detailUrl: row.detail_url,
    scrapedAt: row.scraped_at || "",
    raw: normalizeRawData(row.raw)
  };
}

export async function getStoredScrapedProducts(limit = 60): Promise<StoredScrapedProductsResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      products: getValidFallbackScrapedProducts(),
      error: getSupabaseAdminConfigError(),
      usedFallback: true
    };
  }

  const { data, error } = await supabase
    .from("scraped_products")
    .select("id, source, source_label, source_url, image_url, title, description, price, price_text, detail_url, raw, scraped_at")
    .order("scraped_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      products: getValidFallbackScrapedProducts(),
      error: error.message,
      usedFallback: true
    };
  }

  return {
    products: ((data || []) as ScrapedProductDbRow[])
      .map(mapDbRow)
      .filter((product): product is ScrapedProduct => Boolean(product)),
    usedFallback: false
  };
}

export async function saveScrapedProducts(products: ScrapedProduct[]): Promise<SaveScrapedProductsResult> {
  const validProducts = products
    .map(normalizeScrapedProductPrice)
    .filter((product): product is ScrapedProduct => Boolean(product));
  const updatedDetailUrls = new Set(validProducts.map((product) => product.detailUrl));
  fallbackScrapedProducts = [
    ...validProducts,
    ...getValidFallbackScrapedProducts().filter((product) => !updatedDetailUrls.has(product.detailUrl))
  ];

  if (!validProducts.length) {
    return {
      savedCount: 0,
      usedFallback: true
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      savedCount: 0,
      error: getSupabaseAdminConfigError(),
      usedFallback: true
    };
  }

  const payload = validProducts.map((product) => ({
    source: product.source,
    source_label: product.sourceLabel,
    source_url: product.sourceUrl,
    image_url: product.imageUrl,
    title: product.title,
    description: product.description,
    price: product.price,
    price_text: product.priceText,
    detail_url: product.detailUrl,
    raw: product.raw,
    scraped_at: product.scrapedAt,
    updated_at: new Date().toISOString()
  }));
  const { error } = await supabase.from("scraped_products").upsert(payload, {
    onConflict: "detail_url"
  });

  if (error) {
    return {
      savedCount: 0,
      error: error.message,
      usedFallback: true
    };
  }

  return {
    savedCount: validProducts.length,
    usedFallback: false
  };
}

export async function deleteScrapedProducts(detailUrls: string[]): Promise<DeleteScrapedProductResult> {
  const normalizedDetailUrls = Array.from(new Set(detailUrls.map((detailUrl) => detailUrl.trim()).filter(Boolean)));

  if (!normalizedDetailUrls.length) {
    return {
      deletedCount: 0,
      error: "Detail URL is required.",
      usedFallback: true
    };
  }

  const detailUrlSet = new Set(normalizedDetailUrls);
  const fallbackCountBeforeDelete = fallbackScrapedProducts.length;

  fallbackScrapedProducts = fallbackScrapedProducts.filter((product) => !detailUrlSet.has(product.detailUrl));

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      deletedCount: fallbackCountBeforeDelete - fallbackScrapedProducts.length || normalizedDetailUrls.length,
      error: getSupabaseAdminConfigError(),
      usedFallback: true
    };
  }

  const { error } = await supabase.from("scraped_products").delete().in("detail_url", normalizedDetailUrls);

  if (error) {
    return {
      deletedCount: fallbackCountBeforeDelete - fallbackScrapedProducts.length,
      error: error.message,
      usedFallback: true
    };
  }

  return {
    deletedCount: normalizedDetailUrls.length,
    usedFallback: false
  };
}

export async function deleteScrapedProduct(detailUrl: string): Promise<DeleteScrapedProductResult> {
  return deleteScrapedProducts([detailUrl]);
}
