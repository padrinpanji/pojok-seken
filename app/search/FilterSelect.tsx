"use client";

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  name: string;
  defaultValue: string;
  "aria-label": string;
  "data-test-id"?: string;
  children: React.ReactNode;
};

export default function FilterSelect({ name, defaultValue, "aria-label": ariaLabel, "data-test-id": testId, children }: Props) {
  return (
    <div className="filter-select-wrap">
      <select name={name} defaultValue={defaultValue} aria-label={ariaLabel} data-test-id={testId} className="filter-select">
        {children}
      </select>
      <span className="filter-select-chevron" aria-hidden="true">
        <ChevronIcon />
      </span>
    </div>
  );
}
