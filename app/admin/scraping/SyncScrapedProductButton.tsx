"use client";

import { useState } from "react";
import { SyncToProductDialog } from "@/app/admin/scraping/SyncToProductDialog";

function SyncIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

export default function SyncScrapedProductButton({
    detailUrl,
    title,
    categories,
    paginationParams,
}: {
    detailUrl: string;
    title: string;
    categories: string[];
    paginationParams: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
                <SyncIcon />
                Sync
            </button>

            {open ? (
                <SyncToProductDialog
                    detailUrls={[detailUrl]}
                    titles={[title]}
                    categories={categories}
                    paginationParams={paginationParams}
                    onClose={() => setOpen(false)}
                    onSuccess={() => setOpen(false)}
                />
            ) : null}
        </>
    );
}
