"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import DeleteScrapedProductsDialog from "@/app/admin/scraping/DeleteScrapedProductsDialog";
import { removeScrapedProduct } from "@/app/admin/scraping/actions";

type RemoveScrapedProductFormProps = {
  currentPage: number;
  detailUrl: string;
  perPage: number;
  productKey: string;
  sourceId: string;
  title: string;
};

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

export default function RemoveScrapedProductForm({
  currentPage,
  detailUrl,
  perPage,
  productKey,
  sourceId,
  title
}: RemoveScrapedProductFormProps) {
  const allowConfirmedSubmitRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function confirmRemove(event: FormEvent<HTMLFormElement>) {
    if (allowConfirmedSubmitRef.current) {
      allowConfirmedSubmitRef.current = false;
      return;
    }

    event.preventDefault();
    setIsConfirmOpen(true);
  }

  function submitConfirmedRemove() {
    allowConfirmedSubmitRef.current = true;
    setIsConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  function closeConfirmDialog() {
    if (allowConfirmedSubmitRef.current) {
      return;
    }

    setIsConfirmOpen(false);
  }

  return (
    <>
      <form
        action={removeScrapedProduct}
        onSubmit={confirmRemove}
        ref={formRef}
        data-test-id={`admin-scraped-product-remove-form-${sourceId}-${productKey}`}
      >
        <input type="hidden" name="source" value={sourceId} />
        <input type="hidden" name="page" value={currentPage} />
        <input type="hidden" name="perPage" value={perPage} />
        <input type="hidden" name="detailUrl" value={detailUrl} />
        <button
          className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          type="submit"
          data-test-id={`admin-scraped-product-remove-${sourceId}-${productKey}`}
        >
          <TrashIcon />
          Remove
        </button>
      </form>

      {isConfirmOpen ? (
        <DeleteScrapedProductsDialog
          listings={[title]}
          onCancel={closeConfirmDialog}
          onConfirm={submitConfirmedRemove}
          testId={`admin-scraped-product-remove-dialog-${sourceId}-${productKey}`}
        />
      ) : null}
    </>
  );
}
