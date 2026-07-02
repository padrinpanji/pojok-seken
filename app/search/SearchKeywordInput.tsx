"use client";

import { useEffect, useRef, useState } from "react";
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
  defaultValue: string[];
  locations: string[];
  selectedLocations: string[];
};

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function SearchKeywordInput({ defaultValue, locations, selectedLocations }: Props) {
  const [value, setValue] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState(defaultValue);
  const [selectedLocationsState, setSelectedLocationsState] = useState(selectedLocations);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const availableLocations = locations.filter(
    (loc) =>
      loc.toLowerCase() !== "indonesia" &&
      !selectedLocationsState.some(
        (selectedLocation) => selectedLocation.toLowerCase() === loc.toLowerCase()
      )
  );

  useEffect(() => {
    setSelectedKeywords(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setSelectedLocationsState(selectedLocations);
  }, [selectedLocations]);

  function addKeyword(keyword: string) {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setSelectedKeywords((current) =>
      current.some((item) => item.toLowerCase() === trimmedKeyword.toLowerCase())
        ? current
        : [...current, trimmedKeyword]
    );
    setValue("");
    setSuggestions([]);
  }

  function computeSuggestions(val: string) {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return { list: availableLocations.slice(0, 10), empty: true };
    if (trimmed.length < 2) return { list: [], empty: false };
    return {
      list: availableLocations.filter((loc) => loc.toLowerCase().includes(trimmed)).slice(0, 6),
      empty: false,
    };
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    if (val.endsWith(",")) {
      addKeyword(val.slice(0, -1));
      return;
    }

    setValue(val);
    const { list, empty } = computeSuggestions(val);
    setSuggestions(list);
    setIsEmptyState(empty);
  }

  function handleFocus() {
    if (!value.trim()) {
      setSuggestions(availableLocations.slice(0, 10));
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
    setSelectedLocationsState((current) =>
      current.some((item) => item.toLowerCase() === loc.toLowerCase()) ? current : [...current, loc]
    );
    setValue("");
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function handleRemove(loc: string) {
    setSelectedLocationsState((current) => current.filter((item) => item !== loc));
  }

  function handleRemoveKeyword(keyword: string) {
    setSelectedKeywords((current) => current.filter((item) => item !== keyword));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || !value.trim()) return;

    event.preventDefault();
    addKeyword(value);
  }

  return (
    <div className="search-input-wrap">
      <SearchIcon />
      {selectedKeywords.map((keyword) => (
        <span key={keyword} className="search-location-chip search-keyword-chip">
          {keyword}
          <input type="hidden" name="q" value={keyword} />
          <button
            type="button"
            aria-label={`Hapus kata kunci ${keyword}`}
            onClick={() => handleRemoveKeyword(keyword)}
          >
            <CloseIcon />
          </button>
        </span>
      ))}
      {selectedLocationsState.map((loc) => (
        <span key={loc} className="search-location-chip">
          <MapPinIcon />
          {loc}
          <input type="hidden" name="location" value={loc} />
          <button type="button" aria-label={`Hapus lokasi ${loc}`} onClick={() => handleRemove(loc)}>
            <CloseIcon />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id="search-keyword"
        className="search-keyword-input"
        name="q"
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
