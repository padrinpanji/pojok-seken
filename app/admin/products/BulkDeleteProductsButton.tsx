"use client";

import { useEffect, useRef, useState } from "react";
import { bulkDeleteProductsAction } from "@/app/admin/products/actions";

type Props = {
    allIds: number[];
};

function TrashIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M19 6 18 21H6L5 6M10 11v6M14 11v6" />
        </svg>
    );
}

export default function BulkDeleteProductsButton({ allIds }: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [confirming, setConfirming] = useState(false);

    // Listen to checkbox changes from the table rows
    useEffect(() => {
        function onChange(e: Event) {
            const target = e.target as HTMLInputElement;
            if (target.dataset.bulkId === undefined) return;
            const id = Number(target.dataset.bulkId);
            setSelected((prev) => {
                const next = new Set(prev);
                if (target.checked) next.add(id); else next.delete(id);
                return next;
            });
        }
        document.addEventListener("change", onChange);
        return () => document.removeEventListener("change", onChange);
    }, []);

    // Sync indeterminate state
    useEffect(() => {
        if (!selectAllRef.current) return;
        selectAllRef.current.indeterminate = selected.size > 0 && selected.size < allIds.length;
        selectAllRef.current.checked = allIds.length > 0 && selected.size === allIds.length;
    }, [selected, allIds.length]);

    function toggleAll() {
        const shouldSelectAll = selected.size !== allIds.length;
        // Update all row checkboxes
        document.querySelectorAll<HTMLInputElement>("[data-bulk-id]").forEach((cb) => {
            cb.checked = shouldSelectAll;
        });
        setSelected(shouldSelectAll ? new Set(allIds) : new Set());
    }

    function handleDelete() {
        if (!selected.size) return;
        setConfirming(true);
    }

    function confirmDelete() {
        setConfirming(false);
        formRef.current?.requestSubmit();
    }

    const labelClass = "inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800";

    return (
        <>
            <div className="flex items-center gap-2">
                <label className={labelClass}>
                    <input
                        ref={selectAllRef}
                        type="checkbox"
                        className="mr-2 h-4 w-4 cursor-pointer rounded border-slate-300 accent-emerald-700"
                        onChange={toggleAll}
                        disabled={!allIds.length}
                        aria-label="Select all"
                    />
                    {selected.size > 0 ? `${selected.size} selected` : "Select all"}
                </label>

                {selected.size > 0 && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                    >
                        <TrashIcon />
                        Delete {selected.size}
                    </button>
                )}
            </div>

            {/* Hidden form for submission */}
            <form ref={formRef} action={bulkDeleteProductsAction} className="hidden">
                {Array.from(selected).map((id) => (
                    <input key={id} type="hidden" name="ids" value={id} />
                ))}
            </form>

            {/* Confirm dialog */}
            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-rose-700">Confirm delete</p>
                            <h2 className="mt-1 text-base font-black text-slate-950">Delete {selected.size} product{selected.size > 1 ? "s" : ""}?</h2>
                        </div>
                        <p className="px-5 py-4 text-sm font-medium text-slate-600">
                            This will permanently delete {selected.size} product{selected.size > 1 ? "s" : ""} and all associated images and highlights. This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-sm font-black text-white transition hover:bg-rose-800"
                            >
                                <TrashIcon />
                                Yes, delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
