"use client";

import { useCallback, useEffect, useState } from "react";
import { SyncToProductDialog } from "@/app/admin/scraping/SyncToProductDialog";

function SyncIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

function getSelectedItems(formId: string) {
    return Array.from(
        document.querySelectorAll<HTMLInputElement>(`[data-bulk-delete-checkbox="${formId}"]`),
    )
        .filter((cb) => cb.checked)
        .map((cb) => ({ detailUrl: cb.value, title: cb.dataset.bulkDeleteTitle || cb.value }));
}

export default function BulkSyncScrapedProductsButton({
    formId,
    categories,
    paginationParams,
    sourceId,
    visibleCount,
}: {
    formId: string;
    categories: string[];
    paginationParams: Record<string, string>;
    sourceId: string;
    visibleCount: number;
}) {
    const [selectedCount, setSelectedCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<{ detailUrl: string; title: string }[]>([]);

    const refreshCount = useCallback(() => {
        setSelectedCount(getSelectedItems(formId).length);
    }, [formId]);

    useEffect(() => {
        refreshCount();
        function handleChange(e: Event) {
            if (e.target instanceof HTMLInputElement && e.target.dataset.bulkDeleteCheckbox === formId) {
                refreshCount();
            }
        }
        document.addEventListener("change", handleChange);
        return () => document.removeEventListener("change", handleChange);
    }, [formId, refreshCount, visibleCount]);

    function handleOpen() {
        const items = getSelectedItems(formId);
        if (!items.length) return;
        setSelected(items);
        setOpen(true);
    }

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                disabled={!selectedCount}
                data-test-id={`admin-scraped-products-bulk-sync-${sourceId}`}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <SyncIcon />
                Sync selected
            </button>

            {open && selected.length ? (
                <SyncToProductDialog
                    detailUrls={selected.map((s) => s.detailUrl)}
                    titles={selected.map((s) => s.title)}
                    categories={categories}
                    paginationParams={paginationParams}
                    onClose={() => setOpen(false)}
                    onSuccess={() => { setOpen(false); setSelectedCount(0); }}
                />
            ) : null}
        </>
    );
}
