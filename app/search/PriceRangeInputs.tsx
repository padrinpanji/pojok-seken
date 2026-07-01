"use client";

import { useState } from "react";

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
        <div className="filter-group">
            <label>Rentang harga</label>
            {/* Only submit hidden inputs when there's an actual value */}
            {minDigits ? <input type="hidden" name="minPrice" value={minDigits} /> : null}
            {maxDigits ? <input type="hidden" name="maxPrice" value={maxDigits} /> : null}
            <input
                type="text"
                inputMode="numeric"
                placeholder="Min (Rp)"
                value={minDisplay}
                onChange={(e) => setMinDisplay(formatDisplay(e.target.value))}
                data-test-id="search-min-price-input"
                autoComplete="off"
            />
            <input
                type="text"
                inputMode="numeric"
                placeholder="Maks (Rp)"
                value={maxDisplay}
                onChange={(e) => setMaxDisplay(formatDisplay(e.target.value))}
                data-test-id="search-max-price-input"
                autoComplete="off"
            />
        </div>
    );
}
