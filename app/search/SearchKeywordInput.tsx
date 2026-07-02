"use client";

import { useState, useRef } from "react";
import { SearchIcon } from "@/components/Icons";

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1a5 5 0 0 1 5 5c0 3.5-5 9-5 9S3 9.5 3 6a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

type Props = {
  defaultValue: string;
  locations: string[];
};

export default function SearchKeywordInput({ defaultValue, locations }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function computeSuggestions(val: string) {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return { list: filteredLocations.slice(0, 10), empty: true };
    if (trimmed.length < 2) return { list: [], empty: false };
    return {
      list: filteredLocations.filter((loc) => loc.toLowerCase().includes(trimmed)).slice(0, 6),
      empty: false,
    };
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    const { list, empty } = computeSuggestions(val);
    setSuggestions(list);
    setIsEmptyState(empty);
  }

  const filteredLocations = locations.filter((loc) => loc.toLowerCase() !== "indonesia");

  function handleFocus() {
    if (!value.trim()) {
      setSuggestions(filteredLocations.slice(0, 10));
      setIsEmptyState(true);
    } else {
      const { list, empty } = computeSuggestions(value);
      setSuggestions(list);
      setIsEmptyState(empty);
    }
  }

  function handleBlur() {
    setTimeout(() => setSuggestions([]), 150);
  }

  function handleSelect(loc: string) {
    setValue(loc);
    setSuggestions([]);
    inputRef.current?.form?.requestSubmit();
  }

  return (
    <div className="search-input-wrap">
      <SearchIcon />
      <input
        ref={inputRef}
        id="search-keyword"
        name="q"
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Cari nama barang, kategori, lokasi..."
        aria-label="Kata kunci pencarian"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-test-id="search-keyword-input"
      />
      {suggestions.length > 0 && (
        <ul className="location-suggestions" role="listbox">
          <li className="location-suggestions-title">
            {isEmptyState ? "Lokasi Populer" : "Hasil Lokasi"}
          </li>
          {suggestions.map((loc) => (
            <li key={loc} role="option" aria-selected={false} onMouseDown={() => handleSelect(loc)}>
              <MapPinIcon />
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
