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

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 5.5A5 5 0 1 1 3.2 10M3.5 5.5H1.75M3.5 5.5V3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  const initialDetailActive = !!(minPrice || maxPrice || condition || verified);
  const [open, setOpen] = useState(initialDetailActive);
  const [verifiedState, setVerifiedState] = useState(verified);
  const [advancedResetKey, setAdvancedResetKey] = useState(0);
  const detailActive = advancedResetKey === 0 && initialDetailActive;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = getCleanSearchHref(new FormData(event.currentTarget));
  }

  function handleResetFilters() {
    setAdvancedResetKey((current) => current + 1);
    setVerifiedState(false);
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
          <div className="search-filter-detail-controls">
            <PriceRangeInputs
              key={`price-${advancedResetKey}-${minPrice ?? ""}-${maxPrice ?? ""}`}
              defaultMinPrice={advancedResetKey > 0 ? undefined : minPrice}
              defaultMaxPrice={advancedResetKey > 0 ? undefined : maxPrice}
            />

            <div className="filter-group">
              <span className="filter-detail-label">Kondisi</span>
              <FilterSelect
                key={`condition-${advancedResetKey}`}
                name="condition"
                defaultValue={advancedResetKey > 0 ? "" : condition}
                aria-label="Pilih kondisi"
                data-test-id="search-condition-select"
              >
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
          </div>

          <div className="filter-detail-actions" aria-label="Aksi filter">
            <button className="filter-apply-btn" type="submit" data-test-id="search-apply-filters">
              Terapkan Filter
            </button>
            <button
              type="button"
              className="filter-reset-btn"
              data-test-id="search-reset-filters"
              onClick={handleResetFilters}
            >
              <ResetIcon />
              Reset Filter
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
