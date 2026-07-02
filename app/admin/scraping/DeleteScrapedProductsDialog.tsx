"use client";

import { useEffect, useRef } from "react";
import BodyScrollLock from "@/app/admin/scraping/BodyScrollLock";

type DeleteScrapedProductsDialogProps = {
  listings: string[];
  onCancel: () => void;
  onConfirm: () => void;
  testId: string;
};

export default function DeleteScrapedProductsDialog({
  listings,
  onCancel,
  onConfirm,
  testId
}: DeleteScrapedProductsDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `${testId}-title`;

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 px-4 py-5 sm:items-center sm:py-8"
      data-test-id={`${testId}-overlay`}
    >
      <BodyScrollLock />
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
        data-test-id={testId}
        role="dialog"
      >
        <div className="border-solid border-b border-slate-200 px-5 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-rose-700">Confirm delete</p>
          <h2 id={titleId} className="mt-1 text-xl font-black leading-7 text-slate-950">
            Delete {listings.length} scraped listing{listings.length === 1 ? "" : "s"}?
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Review the selected listing title{listings.length === 1 ? "" : "s"} before removing the data.
          </p>
        </div>

        <div className="px-5 py-4">
          <div
            className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50"
            data-test-id={`${testId}-listing-list`}
          >
            <ul className="divide-y divide-slate-200">
              {listings.map((listing, index) => (
                <li
                  className="flex gap-3 px-4 py-3"
                  data-test-id={`${testId}-listing-${index + 1}`}
                  key={`${listing}-${index}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-slate-500 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="min-w-0 break-words text-sm font-bold leading-6 text-slate-800">{listing}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-solid border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            data-test-id={`${testId}-cancel`}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-rose-700 px-4 text-sm font-black text-white transition hover:bg-rose-800"
            data-test-id={`${testId}-confirm`}
            onClick={onConfirm}
            type="button"
          >
            Delete listing{listings.length === 1 ? "" : "s"}
          </button>
        </div>
      </section>
    </div>
  );
}
