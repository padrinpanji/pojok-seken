"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import DeleteScrapedProductsDialog from "@/app/admin/scraping/DeleteScrapedProductsDialog";
import { removeBulkScrapedProducts } from "@/app/admin/scraping/actions";

type BulkDeleteScrapedProductsFormProps = {
  currentPage: number;
  formId: string;
  perPage: number;
  sourceId: string;
  visibleCount: number;
};

function getCheckboxes(formId: string) {
  return Array.from(document.querySelectorAll<HTMLInputElement>(`[data-bulk-delete-checkbox="${formId}"]`));
}

function getSelectedListings(formId: string) {
  return getCheckboxes(formId)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => ({
      detailUrl: checkbox.value,
      title: checkbox.dataset.bulkDeleteTitle || checkbox.value
    }))
    .filter((listing) => listing.detailUrl.trim());
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6 18 21H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function BulkDeleteScrapedProductsForm({
  currentPage,
  formId,
  perPage,
  sourceId,
  visibleCount
}: BulkDeleteScrapedProductsFormProps) {
  const allowConfirmedSubmitRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [confirmListings, setConfirmListings] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const refreshSelectedCount = useCallback(() => {
    const checkboxes = getCheckboxes(formId);
    const nextSelectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;

    setSelectedCount(nextSelectedCount);
  }, [formId]);

  useEffect(() => {
    refreshSelectedCount();

    function handleCheckboxChange(event: Event) {
      if (event.target instanceof HTMLInputElement && event.target.dataset.bulkDeleteCheckbox === formId) {
        refreshSelectedCount();
      }
    }

    document.addEventListener("change", handleCheckboxChange);

    return () => {
      document.removeEventListener("change", handleCheckboxChange);
    };
  }, [currentPage, formId, perPage, refreshSelectedCount, visibleCount]);

  useEffect(() => {
    if (!selectAllRef.current) {
      return;
    }

    selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < visibleCount;
  }, [selectedCount, visibleCount]);

  function toggleAll() {
    const checkboxes = getCheckboxes(formId);
    const shouldCheck = selectedCount !== visibleCount;

    checkboxes.forEach((checkbox) => {
      checkbox.checked = shouldCheck;
    });
    refreshSelectedCount();
  }

  function confirmBulkRemove(event: FormEvent<HTMLFormElement>) {
    if (allowConfirmedSubmitRef.current) {
      allowConfirmedSubmitRef.current = false;
      return;
    }

    event.preventDefault();

    const selectedListings = getSelectedListings(formId);

    if (!selectedListings.length) {
      refreshSelectedCount();
      return;
    }

    setConfirmListings(selectedListings.map((listing) => listing.title));
  }

  function submitConfirmedBulkRemove() {
    allowConfirmedSubmitRef.current = true;
    setConfirmListings([]);
    formRef.current?.requestSubmit();
  }

  function closeConfirmDialog() {
    if (allowConfirmedSubmitRef.current) {
      return;
    }

    setConfirmListings([]);
  }

  return (
    <>
      <form
        action={removeBulkScrapedProducts}
        className="flex flex-wrap items-center gap-2"
        data-test-id={`admin-scraped-products-bulk-delete-form-${sourceId}`}
        id={formId}
        onSubmit={confirmBulkRemove}
        ref={formRef}
      >
        <input type="hidden" name="source" value={sourceId} />
        <input type="hidden" name="page" value={currentPage} />
        <input type="hidden" name="perPage" value={perPage} />
        <button
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={!selectedCount}
          data-test-id={`admin-scraped-products-bulk-delete-submit-${sourceId}`}
        >
          <TrashIcon />
          Delete selected
        </button>
        <label
          className={`inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition ${
            visibleCount ? "cursor-pointer hover:border-emerald-300 hover:text-emerald-800" : "cursor-not-allowed opacity-50"
          }`}
          data-test-id={`admin-scraped-products-bulk-delete-toggle-all-${sourceId}`}
        >
          <input
            className="mr-2 h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-800"
            type="checkbox"
            ref={selectAllRef}
            checked={visibleCount > 0 && selectedCount === visibleCount}
            onChange={toggleAll}
            disabled={!visibleCount}
            data-test-id={`admin-scraped-products-bulk-delete-toggle-all-input-${sourceId}`}
          />
          {selectedCount ? `${selectedCount} selected` : "Select page"}
        </label>
      </form>

      {confirmListings.length ? (
        <DeleteScrapedProductsDialog
          listings={confirmListings}
          onCancel={closeConfirmDialog}
          onConfirm={submitConfirmedBulkRemove}
          testId={`admin-scraped-products-bulk-delete-dialog-${sourceId}`}
        />
      ) : null}
    </>
  );
}
