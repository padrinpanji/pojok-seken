"use client";

import { useState } from "react";
import FloatInput from "@/app/search/FloatInput";

function formatDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

function parseDigits(display: string) {
  return display.replace(/\D/g, "");
}

type Props = {
  defaultMinPrice?: number;
  defaultMaxPrice?: number;
};

export default function PriceRangeInputs({ defaultMinPrice, defaultMaxPrice }: Props) {
  const [minDisplay, setMinDisplay] = useState(defaultMinPrice ? formatDisplay(String(defaultMinPrice)) : "");
  const [maxDisplay, setMaxDisplay] = useState(defaultMaxPrice ? formatDisplay(String(defaultMaxPrice)) : "");

  const minDigits = parseDigits(minDisplay);
  const maxDigits = parseDigits(maxDisplay);

  return (
    <div className="price-range-group">
      <span className="filter-detail-label">Rentang Harga (Rp)</span>
      {minDigits ? <input type="hidden" name="minPrice" value={minDigits} /> : null}
      {maxDigits ? <input type="hidden" name="maxPrice" value={maxDigits} /> : null}
      <div className="price-range-inputs">
        <FloatInput
          label="Min e.g. 500.000"
          value={minDisplay}
          onChange={(e) => setMinDisplay(formatDisplay(e.target.value))}
          inputMode="numeric"
          data-test-id="search-min-price-input"
        />
        <span className="price-range-sep">—</span>
        <FloatInput
          label="Max e.g. 20.000.000"
          value={maxDisplay}
          onChange={(e) => setMaxDisplay(formatDisplay(e.target.value))}
          inputMode="numeric"
          data-test-id="search-max-price-input"
        />
      </div>
    </div>
  );
}
