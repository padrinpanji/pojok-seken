import "server-only";
import type { ScrapedProductDraft, ScrapeSource } from "./scraping";

/**
 * Scrapes OLX using Puppeteer headless browser to bypass Akamai Bot Manager
 */
export async function scrapeOlxWithBrowser(
  source: ScrapeSource,
): Promise<{ drafts: ScrapedProductDraft[]; error?: string }> {
  try {
    // Dynamic import to avoid loading Puppeteer until needed
    const puppeteer = await import("puppeteer");

    console.log("[OLX Browser] Launching headless browser...");

    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set realistic viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Set user agent
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      );

      console.log("[OLX Browser] Navigating to:", source.url);

      // Navigate to OLX search page
      await page.goto(source.url, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      console.log("[OLX Browser] Page loaded, waiting for product listings...");

      // Wait for product listings to load
      await page.waitForSelector('[data-aut-id="itemBox"]', { timeout: 30000 });

      console.log("[OLX Browser] Extracting product data...");

      // Extract product data from the page
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-aut-id="itemBox"]');
        const results: any[] = [];

        items.forEach((item) => {
          try {
            // Extract title
            const titleEl = item.querySelector('[data-aut-id="itemTitle"]');
            const title = titleEl?.textContent?.trim() || "";

            // Extract price
            const priceEl = item.querySelector('[data-aut-id="itemPrice"]');
            const priceText = priceEl?.textContent?.trim() || "";

            // Extract image
            const imgEl = item.querySelector("img");
            const imageUrl = imgEl?.src || "";

            // Extract detail URL
            const linkEl = item.querySelector("a");
            const detailUrl = linkEl?.href || "";

            // Extract ad ID from URL
            const idMatch = detailUrl.match(/item\/([^.]+)\.html/);
            const adId = idMatch ? idMatch[1] : "";

            if (title && detailUrl && adId) {
              results.push({
                adId,
                title,
                priceText,
                imageUrl,
                detailUrl,
              });
            }
          } catch (err) {
            console.error("Error extracting item:", err);
          }
        });

        return results;
      });

      console.log(`[OLX Browser] Extracted ${products.length} products`);

      // Convert to ScrapedProductDraft format
      const drafts: ScrapedProductDraft[] = products.map((product) => {
        // Parse price from text like "Rp 20.000.000"
        const priceMatch = product.priceText.match(/[\d.,]+/);
        const priceString = priceMatch
          ? priceMatch[0].replace(/\./g, "").replace(/,/g, "")
          : null;
        const price = priceString ? parseInt(priceString, 10) : null;

        return {
          source: source.id,
          sourceLabel: source.label,
          sourceUrl: source.url,
          imageUrl: product.imageUrl,
          title: product.title.substring(0, 160),
          description: product.title.substring(0, 320),
          price,
          priceText: product.priceText || "",
          detailUrl: product.detailUrl,
          raw: {
            extractor: "olx-browser",
          },
        };
      });

      return { drafts };
    } finally {
      await browser.close();
      console.log("[OLX Browser] Browser closed");
    }
  } catch (error) {
    console.error("[OLX Browser] Error:", error);
    return {
      drafts: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
