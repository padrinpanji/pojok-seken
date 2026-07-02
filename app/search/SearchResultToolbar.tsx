"use client";

import { getCleanSearchHref, type ProductFilters } from "@/app/search/search-utils";

type Props = {
  filters: ProductFilters;
  resultCount: number;
  title: string;
};

export default function SearchResultToolbar({ filters, resultCount, title }: Props) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = getCleanSearchHref(new FormData(event.currentTarget));
  }

  return (
    <form
      className="result-toolbar"
      action="/search"
      data-test-id="search-result-toolbar"
      onSubmit={handleSubmit}
    >
      {filters.q.map((keyword) => (
        <input key={keyword} type="hidden" name="q" defaultValue={keyword} />
      ))}
      <input type="hidden" name="category" defaultValue={filters.category} />
      <input type="hidden" name="condition" defaultValue={filters.condition} />
      {filters.locations.map((location) => (
        <input key={location} type="hidden" name="location" defaultValue={location} />
      ))}
      <input type="hidden" name="minPrice" defaultValue={filters.minPrice || ""} />
      <input type="hidden" name="maxPrice" defaultValue={filters.maxPrice || ""} />
      <input type="hidden" name="minYear" defaultValue={filters.minYear} />
      {filters.verified ? <input type="hidden" name="verified" defaultValue="true" /> : null}
      <div>
        <p className="eyebrow">{resultCount} produk ditemukan</p>
        <h2>{title}</h2>
      </div>
      <div className="sort-control">
        <label htmlFor="search-sort">Urutkan</label>
        <select
          id="search-sort"
          name="sort"
          defaultValue={filters.sort}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          data-test-id="search-sort-select"
        >
          <option value="default">⚡ Paling Sesuai</option>
          <option value="price-asc">Harga terendah</option>
          <option value="price-desc">Harga tertinggi</option>
          <option value="year-desc">Tahun terbaru</option>
        </select>
      </div>
    </form>
  );
}
