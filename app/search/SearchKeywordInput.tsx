"use client";

import { useState, useRef } from "react";
import { SearchIcon } from "@/components/Icons";

type Props = {
  defaultValue: string;
  locations: string[];
};

export default function SearchKeywordInput({ defaultValue, locations }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function computeSuggestions(val: string) {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return locations.slice(0, 10);
    if (trimmed.length < 2) return [];
    return locations.filter((loc) => loc.toLowerCase().includes(trimmed)).slice(0, 6);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    setSuggestions(computeSuggestions(val));
  }

  function handleFocus() {
    setSuggestions(computeSuggestions(value));
  }

  function handleSelect(loc: string) {
    setValue(loc);
    setSuggestions([]);
    // Submit the form after selection
    inputRef.current?.form?.requestSubmit();
  }

  function handleBlur() {
    setTimeout(() => setSuggestions([]), 150);
  }

  return (
    <div className="search-input-wrap">
      <SearchIcon />
      <input
        ref={inputRef}
        id="search-keyword"
        type="search"
        name="q"
        placeholder="Cari nama barang, kategori, lokasi..."
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        aria-label="Kata kunci pencarian"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-test-id="search-keyword-input"
      />
      {suggestions.length > 0 && (
        <ul className="location-suggestions" role="listbox">
          <li className="location-suggestions-title">Lokasi Populer</li>
          {suggestions.map((loc) => (
            <li
              key={loc}
              role="option"
              aria-selected={false}
              onMouseDown={() => handleSelect(loc)}
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
