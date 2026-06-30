"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSuperadminSession } from "@/lib/superadmin-auth";
import {
  deleteScrapedProduct,
  deleteScrapedProducts,
  getScrapeSourceById,
  resetScrapeSourceUrl,
  saveScrapedProducts,
  saveScrapeSourceUrl,
  scrapeProductSource,
  updateScrapedProduct,
} from "@/lib/scraping";

function buildRedirectUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/scraping?${searchParams.toString()}`;
}

function getPaginationParams(formData: FormData, pageFallback?: string) {
  const page = String(formData.get("page") || pageFallback || "");
  const perPage = String(formData.get("perPage") || "");
  const params: Record<string, string> = {};

  if (page) {
    params.page = page;
  }

  if (perPage) {
    params.perPage = perPage;
  }

  return params;
}

export async function scrapeNow(formData: FormData) {
  if (!(await hasSuperadminSession())) {
    redirect("/auth");
  }

  const sourceId = String(formData.get("source") || "");
  const source = await getScrapeSourceById(sourceId);
  const paginationParams = getPaginationParams(formData, "1");

  if (!source) {
    redirect(
      buildRedirectUrl({
        status: "error",
        message: "Sumber scraping tidak valid.",
        ...paginationParams
      })
    );
  }

  let redirectUrl = buildRedirectUrl({
    status: "error",
    message: "Scraping gagal dijalankan.",
    ...paginationParams
  });

  try {
    const scrapeResult = await scrapeProductSource(source.id);
    const saveResult = await saveScrapedProducts(scrapeResult.products);
    const sourceErrors = scrapeResult.sources
      .filter((source) => source.error)
      .map((source) => `${source.sourceLabel}: ${source.error}`)
      .join(" ");
    const message = saveResult.error || sourceErrors || `${source.label} scraping selesai.`;
    const status = scrapeResult.products.length && !saveResult.error ? "success" : "warning";

    revalidatePath("/admin/scraping");

    redirectUrl = buildRedirectUrl({
      status,
      count: String(scrapeResult.products.length),
      saved: String(saveResult.savedCount),
      message,
      source: source.id,
      ...paginationParams
    });
  } catch (error) {
    redirectUrl = buildRedirectUrl({
      status: "error",
      message: error instanceof Error ? error.message : "Scraping gagal dijalankan.",
      ...paginationParams
    });
  }

  redirect(redirectUrl);
}

export async function removeScrapedProduct(formData: FormData) {
  if (!(await hasSuperadminSession())) {
    redirect("/auth");
  }

  const detailUrl = String(formData.get("detailUrl") || "");
  const sourceId = String(formData.get("source") || "");
  const source = await getScrapeSourceById(sourceId);
  const sourceParam: Record<string, string> = source ? { source: source.id } : {};
  const paginationParams = getPaginationParams(formData);

  if (!detailUrl.trim()) {
    redirect(
      buildRedirectUrl({
        status: "error",
        message: "Detail URL tidak valid.",
        ...sourceParam,
        ...paginationParams
      })
    );
  }

  const deleteResult = await deleteScrapedProduct(detailUrl);

  revalidatePath("/admin/scraping");

  redirect(
    buildRedirectUrl({
      status: deleteResult.error ? "warning" : "success",
      message: deleteResult.error || "Listing scraping berhasil dihapus.",
      count: String(deleteResult.deletedCount),
      saved: "0",
      ...sourceParam,
      ...paginationParams
    })
  );
}

export async function removeBulkScrapedProducts(formData: FormData) {
  if (!(await hasSuperadminSession())) {
    redirect("/auth");
  }

  const detailUrls = formData
    .getAll("detailUrls")
    .map((detailUrl) => String(detailUrl))
    .filter((detailUrl) => detailUrl.trim());
  const sourceId = String(formData.get("source") || "");
  const source = await getScrapeSourceById(sourceId);
  const sourceParam: Record<string, string> = source ? { source: source.id } : {};
  const paginationParams = getPaginationParams(formData);

  if (!detailUrls.length) {
    redirect(
      buildRedirectUrl({
        status: "error",
        message: "Pilih minimal satu listing untuk dihapus.",
        ...sourceParam,
        ...paginationParams
      })
    );
  }

  const deleteResult = await deleteScrapedProducts(detailUrls);

  revalidatePath("/admin/scraping");

  redirect(
    buildRedirectUrl({
      status: deleteResult.error ? "warning" : "success",
      message: deleteResult.error || `${deleteResult.deletedCount} listing scraping berhasil dihapus.`,
      count: String(deleteResult.deletedCount),
      saved: "0",
      ...sourceParam,
      ...paginationParams
    })
  );
}

export async function saveScrapeTargetUrl(formData: FormData) {
  if (!(await hasSuperadminSession())) {
    redirect("/auth");
  }

  const sourceId = String(formData.get("source") || "");
  const source = await getScrapeSourceById(sourceId);
  const paginationParams = getPaginationParams(formData, "1");
  const sourceParam: Record<string, string> = source ? { source: source.id } : {};

  if (!source) {
    redirect(
      buildRedirectUrl({
        status: "error",
        message: "Sumber scraping tidak valid.",
        ...paginationParams
      })
    );
  }

  const intent = String(formData.get("intent") || "save");
  const targetUrl = String(formData.get("targetUrl") || "");
  const saveResult =
    intent === "reset" ? await resetScrapeSourceUrl(source.id) : await saveScrapeSourceUrl(source.id, targetUrl);
  const message =
    saveResult.error ||
    (intent === "reset"
      ? `${source.label} target URL kembali ke default.`
      : `${source.label} target URL berhasil disimpan.`);

  revalidatePath("/admin/scraping");

  redirect(
    buildRedirectUrl({
      status: saveResult.error ? "warning" : "success",
      message,
      count: "0",
      saved: "0",
      ...sourceParam,
      ...paginationParams
    })
  );
}

export async function updateScrapedProductAction(
  id: number,
  payload: {
    title?: string;
    description?: string;
    price?: number | null;
    priceText?: string;
    sourceUrl?: string;
    imageUrl?: string;
    detailUrl?: string;
  },
): Promise<{ error?: string }> {
  if (!(await hasSuperadminSession())) {
    return { error: "Unauthorized" };
  }

  const result = await updateScrapedProduct(id, payload);

  if (!result.error) {
    revalidatePath("/admin/scraping");
  }

  return result;
}

export async function syncScrapedProductsAction(
  detailUrls: string[],
  category: string,
  paginationParams: Record<string, string>,
): Promise<{ error?: string }> {
  if (!(await hasSuperadminSession())) {
    return { error: "Unauthorized" };
  }

  if (!detailUrls.length) return { error: "No items selected." };
  if (!category.trim()) return { error: "Category is required." };

  // Import here to avoid circular deps — these are only needed at call time
  const { createProduct, generateSlug } = await import("@/lib/products-admin");
  const { deleteScrapedProducts, getStoredScrapedProducts } = await import("@/lib/scraping");

  const { products: allScraped } = await getStoredScrapedProducts();
  const targets = allScraped.filter((p) => detailUrls.includes(p.detailUrl));

  if (!targets.length) return { error: "Selected items not found in scraped data." };

  const errors: string[] = [];

  for (const scraped of targets) {
    const name = scraped.title || "Untitled";
    const result = await createProduct({
      name,
      slug: generateSlug(name),
      category: category.trim(),
      condition: "Bekas",
      price: scraped.price ?? 0,
      location: "",
      image: scraped.imageUrl || "",
      gallery: scraped.imageUrl ? [scraped.imageUrl] : [],
      year: "",
      seller: scraped.sourceLabel || "",
      description: scraped.description || scraped.title || "",
      highlights: [],
    });

    if (result.error) {
      errors.push(`${name}: ${result.error}`);
    }
  }

  if (errors.length) {
    return { error: errors.join("; ") };
  }

  // Remove synced items from scraped list
  await deleteScrapedProducts(detailUrls);

  revalidatePath("/admin/scraping");
  revalidatePath("/admin/products");

  return {};
}
