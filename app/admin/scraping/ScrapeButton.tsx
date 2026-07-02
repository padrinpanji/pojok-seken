"use client";

import { useFormStatus } from "react-dom";

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

export default function ScrapeButton({ sourceLabel, sourceId }: { sourceLabel: string; sourceId: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      type="submit"
      disabled={pending}
      data-test-id={`admin-scrape-now-button-${sourceId}`}
    >
      <RefreshIcon className={pending ? "animate-spin" : ""} />
      {pending ? "Scraping..." : `Scrap ${sourceLabel}`}
    </button>
  );
}
