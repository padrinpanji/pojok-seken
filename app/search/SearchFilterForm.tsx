"use client";

import { useState } from "react";
import SearchKeywordInput from "@/app/search/SearchKeywordInput";
import PriceRangeInputs from "@/app/search/PriceRangeInputs";
import FilterSelect from "@/app/search/FilterSelect";
import { getCleanSearchHref } from "@/app/search/search-utils";

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  q: string[];
  category: string;
  condition: string;
  locations: string[];
  sort: string;
  minPrice?: number;
  maxPrice?: number;
  minYear: string;
  verified: boolean;
  activeFilterCount: number;
  categories: string[];
  conditions: string[];
  years: string[];
  availableLocations: string[];
};

export default function SearchFilterForm({
  q, category, condition, locations: selectedLocations, sort,
  minPrice, maxPrice, minYear, verified,
  activeFilterCount, categories, conditions, years, availableLocations,
}: Props) {
  const detailActive = !!(minPrice || maxPrice || condition || verified);
  const [open, setOpen] = useState(detailActive);
  const [verifiedState, setVerifiedState] = useState(verified);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = getCleanSearchHref(new FormData(event.currentTarget));
  }

  return (
    <form
      className="search-filter-card"
      action="/search"
      data-test-id="search-filter-form"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="minYear" value={minYear} />

      {/* Row 1 */}
      <div className="search-filter-row">
        <FilterSelect name="category" defaultValue={category} aria-label="Pilih kategori" data-test-id="search-category-select">
          <option value="">Semua Kategori</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </FilterSelect>
        <SearchKeywordInput
          defaultValue={q}
          locations={availableLocations}
          selectedLocations={selectedLocations}
        />

        <button className="button search-submit-btn" type="submit" data-test-id="search-submit">
          Cari
        </button>

        <button
          type="button"
          className={`filter-detail-btn${open ? " active" : ""}${detailActive ? " has-active" : ""}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <FilterIcon />
          Filter Lanjutan
          {detailActive && !open ? <span className="filter-badge">{[minPrice, maxPrice, condition, verified ? "v" : ""].filter(Boolean).length}</span> : null}
        </button>
      </div>

      {/* Row 2 — expandable */}
      <div className={`search-filter-detail${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="search-filter-detail-inner">
          <PriceRangeInputs
            key={`${minPrice ?? ""}-${maxPrice ?? ""}`}
            defaultMinPrice={minPrice}
            defaultMaxPrice={maxPrice}
          />

          <div className="filter-group">
            <span className="filter-detail-label">Kondisi</span>
            <FilterSelect name="condition" defaultValue={condition} aria-label="Pilih kondisi" data-test-id="search-condition-select">
              <option value="">Semua Kondisi</option>
              {conditions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </FilterSelect>
          </div>

          <div className="filter-toggle-group">
            <button
              type="button"
              role="switch"
              aria-checked={verifiedState}
              className={`toggle-switch${verifiedState ? " on" : ""}`}
              onClick={() => setVerifiedState((v) => !v)}
            >
              <span className="toggle-thumb" />
            </button>
            {verifiedState && <input type="hidden" name="verified" value="true" />}
            <div>
              <span className="toggle-label">Iklan Terverifikasi</span>
            </div>
          </div>

          <div className="filter-detail-actions">
            {activeFilterCount > 0 && (
              <a href="/search" className="filter-reset-btn" data-test-id="search-reset-filters">
                <TrashIcon />
                Atur Ulang
              </a>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
