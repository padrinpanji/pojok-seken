"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ProductFiltersProps = {
    categories: string[];
    conditions: string[];
};

export default function ProductFilters({ categories, conditions }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const q = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "";
    const condition = searchParams.get("condition") ?? "";

    const update = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            // Reset to page 1 on filter change
            params.delete("status");
            router.push(`/admin/products?${params.toString()}`);
        },
        [router, searchParams],
    );

    const hasFilters = q || category || condition;

    const inputClass =
        "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
                <svg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
                </svg>
                <input
                    type="search"
                    placeholder="Search products..."
                    defaultValue={q}
                    onChange={(e) => update("q", e.target.value)}
                    className={`${inputClass} pl-8 w-52`}
                    aria-label="Search products"
                />
            </div>

            {/* Category filter */}
            <select
                value={category}
                onChange={(e) => update("category", e.target.value)}
                className={`${inputClass} cursor-pointer`}
                aria-label="Filter by category"
            >
                <option value="">All categories</option>
                {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {/* Condition filter */}
            <select
                value={condition}
                onChange={(e) => update("condition", e.target.value)}
                className={`${inputClass} cursor-pointer`}
                aria-label="Filter by condition"
            >
                <option value="">All conditions</option>
                {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {/* Clear */}
            {hasFilters ? (
                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                >
                    Clear
                </button>
            ) : null}
        </div>
    );
}
