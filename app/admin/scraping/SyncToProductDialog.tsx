"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { syncScrapedProductsAction } from "@/app/admin/scraping/actions";

function ArrowUpIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

type SyncToProductDialogProps = {
    detailUrls: string[];
    titles: string[];
    categories: string[];
    defaultSeller?: string;
    paginationParams: Record<string, string>;
    onClose: () => void;
    onSuccess: () => void;
};

export function SyncToProductDialog({
    detailUrls,
    titles,
    categories,
    defaultSeller,
    paginationParams,
    onClose,
    onSuccess,
}: SyncToProductDialogProps) {
    const [category, setCategory] = useState(categories[0] ?? "");
    const [customCategory, setCustomCategory] = useState("");
    const [useCustom, setUseCustom] = useState(false);
    const [seller, setSeller] = useState(defaultSeller ?? "");
    const [error, setError] = useState<string>();
    const [isPending, startTransition] = useTransition();
    const dialogRef = useRef<HTMLDivElement>(null);

    const finalCategory = useCustom ? customCategory.trim() : category;

    // Close on backdrop click
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    function handleSync() {
        if (!finalCategory) { setError("Please select or enter a category."); return; }
        setError(undefined);

        startTransition(async () => {
            const result = await syncScrapedProductsAction(detailUrls, finalCategory, seller.trim(), paginationParams);
            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        });
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div ref={dialogRef} className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="sync-dialog-title">
                <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Sync to Products</p>
                    <h2 id="sync-dialog-title" className="mt-1 text-base font-black text-slate-950">
                        {detailUrls.length === 1 ? "Sync 1 item" : `Sync ${detailUrls.length} items`}
                    </h2>
                </div>

                <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Item list preview */}
                    <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        {titles.slice(0, 10).map((title, i) => (
                            <p key={i} className="truncate py-0.5 text-xs font-semibold text-slate-600">{title}</p>
                        ))}
                        {titles.length > 10 && (
                            <p className="py-0.5 text-xs font-semibold text-slate-400">+{titles.length - 10} more...</p>
                        )}
                    </div>

                    {/* Category selector */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">Category</p>
                        {!useCustom ? (
                            <div className="flex gap-2">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="h-10 flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">— Select category —</option>
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button type="button" onClick={() => setUseCustom(true)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700">
                                    New
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="New category name"
                                    className="h-10 flex-1 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                                <button type="button" onClick={() => setUseCustom(false)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 transition hover:border-rose-300 hover:text-rose-600">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Seller name */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">
                            Seller name <span className="font-medium normal-case text-slate-400">(optional — uses scraped seller or source label)</span>
                        </p>
                        <input
                            value={seller}
                            onChange={(e) => setSeller(e.target.value)}
                            placeholder="e.g. Taufik"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}

                    <p className="text-xs font-medium text-slate-500">
                        Items will be added to <span className="font-black text-slate-700">Products</span> and removed from Scraping.
                    </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                    <button type="button" onClick={onClose}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSync} disabled={isPending || !finalCategory}
                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-black text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
                        <ArrowUpIcon />
                        {isPending ? "Syncing..." : "Sync to products"}
                    </button>
                </div>
            </div>
        </div>
    );
}
