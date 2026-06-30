import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "@/app/admin/AdminShell";
import BodyScrollLock from "@/app/admin/scraping/BodyScrollLock";
import BulkDeleteScrapedProductsForm from "@/app/admin/scraping/BulkDeleteScrapedProductsForm";
import RemoveScrapedProductForm from "@/app/admin/scraping/RemoveScrapedProductForm";
import ScrapedProductImage from "@/app/admin/scraping/ScrapedProductImage";
import { saveScrapeTargetUrl, scrapeNow } from "@/app/admin/scraping/actions";
import ScrapeButton from "@/app/admin/scraping/ScrapeButton";
import { formatPrice } from "@/data/products";
import {
  getScrapeSources,
  getStoredScrapedProducts,
  SCRAPE_SOURCES,
  type ScrapedProduct,
  type ScrapeSource,
} from "@/lib/scraping";

export const metadata: Metadata = {
  title: "Admin Scraping",
  robots: {
    index: false,
    follow: false,
  },
};

type ScrapingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ScrapeSourceView = ScrapeSource;

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function getPositiveInteger(value: string, fallback: number) {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function getPageSize(value: string) {
  const parsedValue = getPositiveInteger(value, DEFAULT_PAGE_SIZE);

  return PAGE_SIZE_OPTIONS.includes(parsedValue)
    ? parsedValue
    : DEFAULT_PAGE_SIZE;
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

function isScrapeSourceId(value: string): value is ScrapeSourceView["id"] {
  return SCRAPE_SOURCES.some((source) => source.id === value);
}

function getAlertClass(status: string) {
  if (status === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (status === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-950";
}

function formatScrapedPrice(product: ScrapedProduct) {
  if (product.price && product.price > 0) {
    return formatPrice(product.price);
  }

  if (product.priceText && !/\bgratis\b/i.test(product.priceText)) {
    return product.priceText;
  }

  return "-";
}

function formatScrapedAt(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getProductKey(product: ScrapedProduct, index: number) {
  return product.id ? String(product.id) : String(index);
}

function getPaginationHref(sourceId: string, page: number, perPage: number) {
  const params = new URLSearchParams({
    source: sourceId,
    page: String(page),
    perPage: String(perPage),
  });

  return `/admin/scraping?${params.toString()}`;
}

function getDetailHref(
  sourceId: string,
  product: ScrapedProduct,
  index: number,
  page: number,
  perPage: number,
) {
  const params = new URLSearchParams({
    source: sourceId,
    page: String(page),
    perPage: String(perPage),
    detail: getProductKey(product, index),
  });

  return `/admin/scraping?${params.toString()}`;
}

function getCloseDetailHref(sourceId: string, page: number, perPage: number) {
  return getPaginationHref(sourceId, page, perPage);
}

function formatFieldValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function DetailField({
  label,
  testId,
  value,
}: {
  label: string;
  testId: string;
  value: string | number | null | undefined;
}) {
  return (
    <div
      className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
      data-test-id={testId}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">
        {formatFieldValue(value)}
      </p>
    </div>
  );
}

function DetailLinkField({
  href,
  label,
  testId,
}: {
  href: string;
  label: string;
  testId: string;
}) {
  return (
    <div
      className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
      data-test-id={testId}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        {href ? (
          <a
            className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
            href={href}
            target="_blank"
            rel="noreferrer"
            data-test-id={`${testId}-open`}
          >
            Open
          </a>
        ) : null}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 [overflow-wrap:anywhere]">
        {href || "-"}
      </p>
    </div>
  );
}

function DetailSection({
  children,
  eyebrow,
  testId,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  testId: string;
  title: string;
}) {
  return (
    <section className="min-w-0" data-test-id={testId}>
      {eyebrow ? (
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h3
        className={`${eyebrow ? "mt-1" : ""} text-base font-black text-slate-950`}
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 0 1-15.2 6.5" />
      <path d="M3 12A9 9 0 0 1 18.2 5.5" />
      <path d="M18 2v4h-4" />
      <path d="M6 22v-4h4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SourceScrapeCard({
  perPage,
  source,
  products,
}: {
  perPage: number;
  source: ScrapeSourceView;
  products: ScrapedProduct[];
}) {
  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
      data-test-id={`admin-scraping-source-card-${source.id}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-black text-slate-950">
            {source.label}
          </h2>
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${
              source.isCustomUrl
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
            data-test-id={`admin-scraping-source-url-mode-${source.id}`}
          >
            {source.isCustomUrl ? "Custom URL" : "Default URL"}
          </span>
        </div>
        <a
          className="mt-2 block cursor-pointer break-all text-sm font-semibold leading-5 text-slate-500 hover:text-emerald-700"
          href={source.url}
          target="_blank"
          rel="noreferrer"
          data-test-id={`admin-scraping-source-url-${source.id}`}
        >
          {source.url}
        </a>
      </div>

      <form
        action={saveScrapeTargetUrl}
        className="rounded-lg border border-slate-200 bg-white p-3"
        data-test-id={`admin-scraping-source-url-form-${source.id}`}
      >
        <input type="hidden" name="source" value={source.id} />
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="perPage" value={perPage} />
        <label
          className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500"
          htmlFor={`admin-scraping-source-target-url-${source.id}`}
        >
          Target URL
        </label>
        <div className="mt-2 flex flex-col gap-2 lg:flex-row">
          <input
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            data-test-id={`admin-scraping-source-target-url-input-${source.id}`}
            defaultValue={source.url}
            id={`admin-scraping-source-target-url-${source.id}`}
            name="targetUrl"
            placeholder={source.defaultUrl}
            required
            type="url"
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
              data-test-id={`admin-scraping-source-target-url-save-${source.id}`}
              name="intent"
              type="submit"
              value="save"
            >
              Save URL
            </button>
            {source.isCustomUrl ? (
              <button
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
                data-test-id={`admin-scraping-source-target-url-reset-${source.id}`}
                formNoValidate
                name="intent"
                type="submit"
                value="reset"
              >
                Use default
              </button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 break-all text-xs font-semibold leading-5 text-slate-500">
          Default: {source.defaultUrl}
        </p>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span
          className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700"
          data-test-id={`admin-scraping-source-count-${source.id}`}
        >
          {products.length} rows
        </span>
        <form
          action={scrapeNow}
          data-test-id={`admin-scrape-form-${source.id}`}
        >
          <input type="hidden" name="source" value={source.id} />
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="perPage" value={perPage} />
          <ScrapeButton sourceLabel={source.label} sourceId={source.id} />
        </form>
      </div>
    </section>
  );
}

function ScrapedProductsTable({
  currentPage,
  pageStart,
  perPage,
  source,
  totalPages,
  totalProducts,
  products,
}: {
  currentPage: number;
  pageStart: number;
  perPage: number;
  source: ScrapeSourceView;
  totalPages: number;
  totalProducts: number;
  products: ScrapedProduct[];
}) {
  const visibleStart = totalProducts ? pageStart + 1 : 0;
  const visibleEnd = totalProducts
    ? Math.min(pageStart + products.length, totalProducts)
    : 0;
  const previousPage = Math.max(currentPage - 1, 1);
  const nextPage = Math.min(currentPage + 1, totalPages);
  const pageNumbers = getVisiblePageNumbers(currentPage, totalPages);
  const bulkDeleteFormId = `admin-scraped-products-bulk-delete-form-${source.id}`;

  return (
    <section
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      data-test-id={`admin-scraped-products-table-section-${source.id}`}
    >
      <div className="flex flex-col gap-4 border-solid border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Scraped Data
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-950">
            {source.label} Product Table
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <p
            className="text-sm font-bold text-slate-500"
            data-test-id={`admin-scraped-products-count-${source.id}`}
          >
            {totalProducts
              ? `${visibleStart}-${visibleEnd} of ${totalProducts} products`
              : "0 products"}
          </p>
          <BulkDeleteScrapedProductsForm
            currentPage={currentPage}
            formId={bulkDeleteFormId}
            perPage={perPage}
            sourceId={source.id}
            visibleCount={products.length}
          />
          <form
            className="flex flex-wrap items-center gap-2"
            method="get"
            data-test-id={`admin-scraped-products-page-size-form-${source.id}`}
          >
            <input type="hidden" name="source" value={source.id} />
            <input type="hidden" name="page" value="1" />
            <label
              className="text-xs font-black uppercase tracking-[0.12em] text-slate-500"
              htmlFor={`admin-scraped-products-page-size-${source.id}`}
            >
              Per page
            </label>
            <select
              className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              defaultValue={perPage}
              id={`admin-scraped-products-page-size-${source.id}`}
              name="perPage"
              data-test-id={`admin-scraped-products-page-size-select-${source.id}`}
            >
              {PAGE_SIZE_OPTIONS.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <button
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
              type="submit"
              data-test-id={`admin-scraped-products-page-size-submit-${source.id}`}
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      <div
        className="overflow-x-auto"
        data-test-id={`admin-scraped-products-table-wrap-${source.id}`}
      >
        <table
          className="min-w-[1220px] divide-y divide-slate-200 text-left"
          data-test-id={`admin-scraped-products-table-${source.id}`}
        >
          <thead className="bg-slate-50">
            <tr>
              <th className="w-12 px-4 py-3" scope="col">
                <span className="sr-only">Select listing</span>
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Image
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Product
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Price
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Image URL
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Detail URL
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Scraped
              </th>
              <th
                className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.length ? (
              products.map((product, index) => {
                const absoluteIndex = pageStart + index;
                const productKey = getProductKey(product, absoluteIndex);

                return (
                  <tr
                    key={`${product.detailUrl}-${productKey}`}
                    data-test-id={`admin-scraped-product-row-${source.id}-${productKey}`}
                  >
                    <td className="px-4 py-4 align-top">
                      <input
                        aria-label={`Select ${product.title}`}
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-800"
                        data-bulk-delete-checkbox={bulkDeleteFormId}
                        data-bulk-delete-title={product.title}
                        data-test-id={`admin-scraped-product-select-${source.id}-${productKey}`}
                        form={bulkDeleteFormId}
                        name="detailUrls"
                        type="checkbox"
                        value={product.detailUrl}
                      />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <ScrapedProductImage
                        className="h-14 w-14 rounded-md border border-slate-200 object-cover"
                        src={product.imageUrl}
                        alt={product.title}
                        loading="lazy"
                        testId={`admin-scraped-product-image-${source.id}-${productKey}`}
                      />
                    </td>
                    <td className="max-w-72 px-4 py-4 align-top">
                      <a
                        className="block cursor-pointer overflow-hidden break-words text-sm font-black leading-5 text-slate-950 transition [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] hover:text-emerald-700 hover:underline"
                        href={product.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-test-id={`admin-scraped-product-title-link-${source.id}-${productKey}`}
                      >
                        {product.title}
                      </a>
                      <p className="mt-1 overflow-hidden break-words text-xs font-medium leading-5 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                        {product.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top text-sm font-black text-emerald-800">
                      {formatScrapedPrice(product)}
                    </td>
                    <td className="max-w-64 px-4 py-4 align-top">
                      <a
                        className="block cursor-pointer break-all text-xs font-semibold leading-5 text-slate-600 hover:text-emerald-700"
                        href={product.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-test-id={`admin-scraped-product-image-url-${source.id}-${productKey}`}
                      >
                        {product.imageUrl}
                      </a>
                    </td>
                    <td className="max-w-72 px-4 py-4 align-top">
                      <a
                        className="block cursor-pointer break-all text-xs font-semibold leading-5 text-slate-600 hover:text-emerald-700"
                        href={product.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-test-id={`admin-scraped-product-detail-url-${source.id}-${productKey}`}
                      >
                        {product.detailUrl}
                      </a>
                    </td>
                    <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">
                      {formatScrapedAt(product.scrapedAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <a
                          className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
                          href={getDetailHref(
                            source.id,
                            product,
                            absoluteIndex,
                            currentPage,
                            perPage,
                          )}
                          data-test-id={`admin-scraped-product-view-${source.id}-${productKey}`}
                        >
                          <EyeIcon />
                          View
                        </a>
                        <RemoveScrapedProductForm
                          currentPage={currentPage}
                          detailUrl={product.detailUrl}
                          perPage={perPage}
                          productKey={productKey}
                          sourceId={source.id}
                          title={product.title}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm font-semibold text-slate-500"
                  colSpan={8}
                >
                  Belum ada data scraping dari {source.label}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex flex-col gap-3 border-solid border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        data-test-id={`admin-scraped-products-pagination-${source.id}`}
      >
        <p
          className="text-sm font-semibold text-slate-500"
          data-test-id={`admin-scraped-products-page-status-${source.id}`}
        >
          Page {currentPage} of {totalPages}
        </p>
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label={`${source.label} product table pagination`}
          data-test-id={`admin-scraped-products-pagination-nav-${source.id}`}
        >
          {currentPage > 1 ? (
            <a
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
              href={getPaginationHref(source.id, previousPage, perPage)}
              data-test-id={`admin-scraped-products-pagination-prev-${source.id}`}
            >
              Previous
            </a>
          ) : (
            <span
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-400"
              aria-disabled="true"
              data-test-id={`admin-scraped-products-pagination-prev-disabled-${source.id}`}
            >
              Previous
            </span>
          )}

          {pageNumbers.map((pageNumber, index) => {
            const previousPageNumber = pageNumbers[index - 1];
            const showGap = previousPageNumber
              ? pageNumber - previousPageNumber > 1
              : false;

            return (
              <span className="flex items-center gap-2" key={pageNumber}>
                {showGap ? (
                  <span
                    className="px-1 text-xs font-black text-slate-400"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                ) : null}
                {pageNumber === currentPage ? (
                  <span
                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-emerald-800 px-3 text-xs font-black text-white"
                    aria-current="page"
                    data-test-id={`admin-scraped-products-pagination-page-current-${source.id}-${pageNumber}`}
                  >
                    {pageNumber}
                  </span>
                ) : (
                  <a
                    className="inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
                    href={getPaginationHref(source.id, pageNumber, perPage)}
                    data-test-id={`admin-scraped-products-pagination-page-${source.id}-${pageNumber}`}
                  >
                    {pageNumber}
                  </a>
                )}
              </span>
            );
          })}

          {currentPage < totalPages ? (
            <a
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
              href={getPaginationHref(source.id, nextPage, perPage)}
              data-test-id={`admin-scraped-products-pagination-next-${source.id}`}
            >
              Next
            </a>
          ) : (
            <span
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-400"
              aria-disabled="true"
              data-test-id={`admin-scraped-products-pagination-next-disabled-${source.id}`}
            >
              Next
            </span>
          )}
        </nav>
      </div>
    </section>
  );
}

function ProductDetailModal({
  currentPage,
  perPage,
  source,
  product,
}: {
  currentPage: number;
  perPage: number;
  source: ScrapeSourceView;
  product: ScrapedProduct;
}) {
  const rawEntries = Object.entries(product.raw);
  const closeHref = getCloseDetailHref(source.id, currentPage, perPage);
  const scrapedAt = formatScrapedAt(product.scrapedAt);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-50"
      data-test-id={`admin-scraped-product-detail-popup-${source.id}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scraped-product-detail-title"
    >
      <BodyScrollLock />
      <div className="flex h-screen flex-col">
        <header
          className="shrink-0 border-solid border-b border-slate-200 bg-white shadow-sm"
          data-test-id={`admin-scraped-product-detail-header-${source.id}`}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                Scraped Product Detail
              </p>
              <h2
                id="scraped-product-detail-title"
                className="mt-1 break-words text-xl font-black leading-7 text-slate-950 md:text-2xl md:leading-8"
              >
                {product.title}
              </h2>
              <div
                className="mt-3 flex flex-wrap gap-2"
                data-test-id={`admin-scraped-product-detail-badges-${source.id}`}
              >
                <span className="inline-flex min-h-8 items-center rounded-lg bg-emerald-50 px-3 text-xs font-black text-emerald-800">
                  {source.label}
                </span>
                <span className="inline-flex min-h-8 items-center rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-700">
                  Scraped {scrapedAt}
                </span>
                <span className="inline-flex min-h-8 items-center rounded-lg bg-amber-50 px-3 text-xs font-black text-amber-800">
                  {formatScrapedPrice(product)}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <a
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-emerald-800 px-4 text-sm font-black text-white transition hover:bg-emerald-900"
                href={product.detailUrl}
                target="_blank"
                rel="noreferrer"
                data-test-id={`admin-scraped-product-detail-open-page-${source.id}`}
              >
                Open detail page
              </a>
              <a
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
                href={closeHref}
                aria-label="Close detail popup"
                data-test-id={`admin-scraped-product-detail-close-${source.id}`}
              >
                Close
              </a>
            </div>
          </div>
        </header>

        <div
          className="min-h-0 flex-1 overflow-y-auto"
          data-test-id={`admin-scraped-product-detail-body-${source.id}`}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-start">
            <aside
              className="flex w-full flex-col gap-4 lg:sticky lg:top-5 lg:w-80 lg:shrink-0 xl:w-96"
              data-test-id={`admin-scraped-product-detail-side-panel-${source.id}`}
            >
              <section
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                data-test-id={`admin-scraped-product-detail-image-panel-${source.id}`}
              >
                <ScrapedProductImage
                  className="aspect-[4/3] w-full bg-slate-100 object-cover"
                  src={product.imageUrl}
                  alt={product.title}
                  testId={`admin-scraped-product-detail-image-${source.id}`}
                />
              </section>

              <section
                className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm"
                data-test-id={`admin-scraped-product-detail-price-panel-${source.id}`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                  Price
                </p>
                <p className="mt-2 break-words text-2xl font-black leading-8 text-emerald-950">
                  {formatScrapedPrice(product)}
                </p>
                <p className="mt-2 break-words text-sm font-semibold leading-6 text-emerald-800">
                  {product.priceText || "No original price text"}
                </p>
              </section>

              <section
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                data-test-id={`admin-scraped-product-detail-source-panel-${source.id}`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Source Snapshot
                </p>
                <dl className="mt-3 grid gap-3">
                  <div>
                    <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                      Source
                    </dt>
                    <dd className="mt-1 break-words text-sm font-bold text-slate-800">
                      {product.sourceLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                      Scraped At
                    </dt>
                    <dd className="mt-1 break-words text-sm font-bold text-slate-800">
                      {scrapedAt}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                      Record ID
                    </dt>
                    <dd className="mt-1 break-words text-sm font-bold text-slate-800">
                      {formatFieldValue(product.id)}
                    </dd>
                  </div>
                </dl>
              </section>
            </aside>

            <main
              className="flex min-w-0 flex-1 flex-col gap-6"
              data-test-id={`admin-scraped-product-detail-main-${source.id}`}
            >
              <DetailSection
                eyebrow="Listing Summary"
                testId={`admin-scraped-product-detail-overview-section-${source.id}`}
                title="Product overview"
              >
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Title
                  </p>
                  <p className="mt-2 break-words text-lg font-black leading-7 text-slate-950">
                    {product.title}
                  </p>
                  <div
                    className="mt-4 border-solid border-t border-slate-100 pt-4"
                    data-test-id={`admin-scraped-product-detail-description-${source.id}`}
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Description
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-7 text-slate-700">
                      {product.description || "-"}
                    </p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection
                eyebrow="Normalized Fields"
                testId={`admin-scraped-product-detail-fields-section-${source.id}`}
                title="Scraped product data"
              >
                <div
                  className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3"
                  data-test-id={`admin-scraped-product-detail-fields-${source.id}`}
                >
                  <DetailField
                    label="Record ID"
                    testId={`admin-scraped-product-detail-id-${source.id}`}
                    value={product.id}
                  />
                  <DetailField
                    label="Source Key"
                    testId={`admin-scraped-product-detail-source-key-${source.id}`}
                    value={product.source}
                  />
                  <DetailField
                    label="Source Label"
                    testId={`admin-scraped-product-detail-source-label-${source.id}`}
                    value={product.sourceLabel}
                  />
                  <DetailField
                    label="Scraped At"
                    testId={`admin-scraped-product-detail-scraped-at-${source.id}`}
                    value={scrapedAt}
                  />
                  <DetailField
                    label="Numeric Price"
                    testId={`admin-scraped-product-detail-price-${source.id}`}
                    value={product.price}
                  />
                  <DetailField
                    label="Price Text"
                    testId={`admin-scraped-product-detail-price-text-${source.id}`}
                    value={product.priceText}
                  />
                </div>
              </DetailSection>

              <DetailSection
                eyebrow="Navigation"
                testId={`admin-scraped-product-detail-links-section-${source.id}`}
                title="Source links"
              >
                <div className="grid gap-3 xl:grid-cols-2">
                  <DetailLinkField
                    href={product.sourceUrl}
                    label="Source URL"
                    testId={`admin-scraped-product-detail-source-url-${source.id}`}
                  />
                  <DetailLinkField
                    href={product.imageUrl}
                    label="Image URL"
                    testId={`admin-scraped-product-detail-image-url-${source.id}`}
                  />
                  <div className="xl:col-span-2">
                    <DetailLinkField
                      href={product.detailUrl}
                      label="Detail URL"
                      testId={`admin-scraped-product-detail-page-url-${source.id}`}
                    />
                  </div>
                </div>
              </DetailSection>

              <DetailSection
                eyebrow="Diagnostics"
                testId={`admin-scraped-product-detail-raw-${source.id}`}
                title="Raw scraper metadata"
              >
                {rawEntries.length ? (
                  <dl className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {rawEntries.map(([key, value]) => (
                      <div
                        className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                        key={key}
                        data-test-id={`admin-scraped-product-detail-raw-${source.id}-${key}`}
                      >
                        <dt className="break-words text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                          {key}
                        </dt>
                        <dd className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">
                          {formatFieldValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
                    -
                  </p>
                )}
              </DetailSection>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ScrapingPage({
  searchParams,
}: ScrapingPageProps) {
  const params = await searchParams;
  const status = getSingleParam(params?.status);
  const message = getSingleParam(params?.message);
  const count = getSingleParam(params?.count);
  const saved = getSingleParam(params?.saved);
  const requestedSource = getSingleParam(params?.source);
  const requestedDetail = getSingleParam(params?.detail);
  const requestedPage = getSingleParam(params?.page);
  const requestedPerPage = getSingleParam(params?.perPage);
  const scrapeSourcesResult = await getScrapeSources();
  const storedResult = await getStoredScrapedProducts();
  const productsBySource = scrapeSourcesResult.sources.map((source) => ({
    source,
    products: storedResult.products.filter(
      (product) => product.source === source.id,
    ),
  }));
  const activeSourceId = isScrapeSourceId(requestedSource)
    ? requestedSource
    : scrapeSourcesResult.sources[0]?.id;
  const activeSourceGroup =
    productsBySource.find(({ source }) => source.id === activeSourceId) ||
    productsBySource[0];
  const perPage = getPageSize(requestedPerPage);
  const totalProducts = activeSourceGroup.products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / perPage));
  const requestedPageNumber = getPositiveInteger(requestedPage, 1);
  const currentPage = Math.min(requestedPageNumber, totalPages);
  const pageStart = (currentPage - 1) * perPage;
  const paginatedProducts = activeSourceGroup.products.slice(
    pageStart,
    pageStart + perPage,
  );
  const selectedProduct = activeSourceGroup.products.find(
    (product, index) => getProductKey(product, index) === requestedDetail,
  );

  return (
    <AdminShell activeItem="scraping">
      <div
        className="flex max-w-7xl flex-col gap-5"
        data-test-id="admin-scraping-page"
      >
        <section
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          data-test-id="admin-scraping-toolbar"
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
              Catalog Scraping
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-950">
              Scraped Product Candidates
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Pilih tab sumber, jalankan scraping, lalu tinjau kandidat produk
              di tabel sumber tersebut.
            </p>
          </div>
        </section>

        {status ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-semibold ${getAlertClass(status)}`}
            data-test-id="admin-scraping-status"
            role="status"
          >
            {message || "Scraping selesai."}
            {count ? ` Total: ${count}.` : ""}
            {saved ? ` Saved: ${saved}.` : ""}
          </div>
        ) : null}

        {storedResult.error ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
            data-test-id="admin-scraping-storage-status"
            role="status"
          >
            {storedResult.error}
            {storedResult.usedFallback
              ? " Showing local fallback data when available."
              : ""}
          </div>
        ) : null}

        {scrapeSourcesResult.error ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
            data-test-id="admin-scraping-source-url-status"
            role="status"
          >
            {scrapeSourcesResult.error}
            {scrapeSourcesResult.usedFallback
              ? " Target URL settings are using defaults or local fallback."
              : ""}
          </div>
        ) : null}

        <section
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          data-test-id="admin-scraping-tab-group"
        >
          <div className="border-solid border-b border-slate-200 bg-slate-50 px-3 py-3">
            <nav
              className="flex flex-wrap gap-2"
              aria-label="Scraping source tabs"
              data-test-id="admin-scraping-tabs"
            >
              {productsBySource.map(({ source, products }) => {
                const active = source.id === activeSourceGroup.source.id;

                return (
                  <a
                    className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-black transition ${
                      active
                        ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                    }`}
                    href={getPaginationHref(source.id, 1, perPage)}
                    key={source.id}
                    data-test-id={`admin-scraping-tab-${source.id}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{source.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                        active
                          ? "bg-white/18 text-white"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {products.length}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div
            className="p-5"
            data-test-id={`admin-scraping-tab-panel-${activeSourceGroup.source.id}`}
          >
            <SourceScrapeCard
              perPage={perPage}
              products={activeSourceGroup.products}
              source={activeSourceGroup.source}
            />
          </div>
        </section>

        <ScrapedProductsTable
          currentPage={currentPage}
          pageStart={pageStart}
          perPage={perPage}
          products={paginatedProducts}
          source={activeSourceGroup.source}
          totalPages={totalPages}
          totalProducts={totalProducts}
        />

        {selectedProduct ? (
          <ProductDetailModal
            currentPage={currentPage}
            perPage={perPage}
            product={selectedProduct}
            source={activeSourceGroup.source}
          />
        ) : null}
      </div>
    </AdminShell>
  );
}
