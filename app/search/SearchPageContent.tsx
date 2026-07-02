import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { SearchIcon, ShieldIcon } from "@/components/Icons";
import { formatPrice, siteConfig, type Product } from "@/data/products";
import SearchFilterForm from "@/app/search/SearchFilterForm";
import SearchResultToolbar from "@/app/search/SearchResultToolbar";
import {
  filterProducts,
  getActiveFilterCount,
  getProductFacets,
  sortProducts,
  type ProductFilters,
} from "@/app/search/search-utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
  testId?: string;
};

type Props = {
  categories: string[];
  productList: Product[];
  filters: ProductFilters;
  schema: {
    name: string;
    url: string;
    about: string;
  };
  breadcrumbs: BreadcrumbItem[];
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    showTrustCard?: boolean;
  };
  resultsTitle: string;
  emptyState: {
    title: string;
    description: string;
    actionLabel: string;
  };
  infoDescription?: string;
  showSort?: boolean;
};

function SearchBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="breadcrumb">
      {items.map((item, index) => [
        index > 0 ? <span key={`${item.label}-separator`}>/</span> : null,
        item.href ? (
          <Link key={item.label} href={item.href} data-test-id={item.testId}>
            {item.label}
          </Link>
        ) : (
          <span key={item.label}>{item.label}</span>
        ),
      ])}
    </div>
  );
}

function SearchHero({ hero }: Pick<Props, "hero">) {
  return (
    <section className="search-hero" data-test-id="search-hero">
      <div className="container search-hero-inner">
        <div>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>
        </div>
        {hero.showTrustCard ? (
          <div className="search-hero-card" data-test-id="search-hero-card">
            <ShieldIcon />
            <strong>COD dulu, cek barang langsung</strong>
            <p>Prioritaskan penjual lokal dan detail kondisi yang transparan.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ResultToolbar({
  filters,
  resultCount,
  title,
  showSort,
}: {
  filters: ProductFilters;
  resultCount: number;
  title: string;
  showSort?: boolean;
}) {
  if (!showSort) {
    return (
      <div className="result-toolbar">
        <div>
          <p className="eyebrow">{resultCount} produk ditemukan</p>
          <h2>{title}</h2>
        </div>
      </div>
    );
  }

  return <SearchResultToolbar filters={filters} resultCount={resultCount} title={title} />;
}

export default function SearchPageContent({
  categories,
  productList,
  filters,
  schema,
  breadcrumbs,
  hero,
  resultsTitle,
  emptyState,
  infoDescription,
  showSort = false,
}: Props) {
  const sortedProducts = sortProducts(filterProducts({ ...filters, productList }), filters.sort);
  const { conditions, locations, years, minimumProductPrice } = getProductFacets(productList);
  const activeFilterCount = getActiveFilterCount(filters);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    ...schema,
    url: `${siteConfig.url}${schema.url}`,
  };

  return (
    <>
      <SchemaScript data={collectionSchema} />
      <section className="search-topbar" data-test-id="search-breadcrumbs">
        <div className="container search-topbar-inner">
          <SearchBreadcrumbs items={breadcrumbs} />
          <div className="active-count" data-test-id="search-active-count">
            <span />
            <strong>{productList.length}</strong> iklan aktif hari ini
          </div>
        </div>
      </section>

      <SearchHero hero={hero} />

      <main className="search-page section" data-test-id="search-page">
        <div className="container">
          <div className="search-shell" data-test-id="search-shell">
            <SearchFilterForm
              {...filters}
              activeFilterCount={activeFilterCount}
              categories={categories}
              conditions={conditions}
              years={years}
              availableLocations={locations}
            />

            <div className="search-layout">
              <aside className="search-ads-slot" aria-label="Iklan" data-test-id="search-ads-slot">
                <div className="ads-placeholder p-2 text-center">
                  <span>Search Sidebar Ads Slot Available</span>
                </div>
              </aside>

              <section className="search-results" data-test-id="search-results">
                <ResultToolbar
                  filters={filters}
                  resultCount={sortedProducts.length}
                  title={resultsTitle}
                  showSort={showSort}
                />

                {sortedProducts.length > 0 ? (
                  <div className="grid search-grid" data-test-id="search-product-grid">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" data-test-id="search-empty-state">
                    <SearchIcon />
                    <h3>{emptyState.title}</h3>
                    <p>{emptyState.description}</p>
                    <Link className="button" href="/search" data-test-id="search-empty-reset">
                      {emptyState.actionLabel}
                    </Link>
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="search-info" data-test-id="search-info-block">
            <div>
              <p className="eyebrow">Belanja lebih cerdas</p>
              <h2>Pojok Seken membantu kamu membandingkan barang bekas dengan cepat.</h2>
            </div>
            {infoDescription ? <p>{infoDescription}</p> : null}
            <div className="info-stats">
              <span>harga mulai {formatPrice(minimumProductPrice)}</span>
              <span>{categories.length} kategori</span>
              <span>{locations.length} lokasi</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
