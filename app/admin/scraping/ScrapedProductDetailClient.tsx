"use client";

import { useState, useTransition } from "react";
import type { ScrapedProduct } from "@/lib/scraping";
import { updateScrapedProductAction } from "@/app/admin/scraping/actions";

function PencilIcon() {
    return (
        <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

type SectionFields = {
    overview: { title: string; description: string };
    links: { sourceUrl: string; imageUrl: string; detailUrl: string };
};

type EditingSection = keyof SectionFields | null;

function SectionEditButton({
    onClick,
    label,
}: {
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
        >
            <PencilIcon />
        </button>
    );
}

function SectionSaveButton({
    onClick,
    disabled,
}: {
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-xs font-black text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <CheckIcon />
            Save
        </button>
    );
}

function SectionCancelButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
        >
            <XIcon />
        </button>
    );
}

function SectionHeader({
    eyebrow,
    title,
    isEditing,
    isPending,
    onEdit,
    onSave,
    onCancel,
    error,
}: {
    eyebrow?: string;
    title: string;
    isEditing: boolean;
    isPending: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    error?: string;
}) {
    return (
        <div className="mb-4">
            <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                    {eyebrow ? (
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                            {eyebrow}
                        </p>
                    ) : null}
                    <h3 className={`${eyebrow ? "mt-1" : ""} text-base font-black text-slate-950`}>
                        {title}
                    </h3>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    {isEditing ? (
                        <>
                            <SectionSaveButton onClick={onSave} disabled={isPending} />
                            <SectionCancelButton onClick={onCancel} />
                        </>
                    ) : (
                        <SectionEditButton onClick={onEdit} label={`Edit ${title}`} />
                    )}
                </div>
            </div>
            {error ? (
                <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
            ) : null}
        </div>
    );
}

function inputClass(multiline = false) {
    const base =
        "min-w-0 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
    return multiline ? `${base} py-2` : `${base} h-10`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
            {children}
        </p>
    );
}

// Format a numeric value as IDR currency string
function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

// Parse a currency-formatted string back to a number
function parseCurrencyInput(value: string): number | null {
    const digits = value.replace(/\D/g, "");
    const num = Number(digits);
    return digits && Number.isFinite(num) ? num : null;
}

export function ScrapedProductPricePanel({
    product,
}: {
    product: ScrapedProduct;
}) {
    const initialPrice = product.price != null ? String(product.price) : "";
    const initialPriceText = product.priceText ?? "";

    const [priceRaw, setPriceRaw] = useState(initialPrice);
    const [priceText, setPriceText] = useState(initialPriceText);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string>();
    const [isPending, startTransition] = useTransition();

    // Display value: numeric price formatted as currency, or priceText fallback
    const displayPrice = priceRaw
        ? formatCurrency(Number(priceRaw))
        : priceText || "-";

    function handleEdit() {
        setIsEditing(true);
        setError(undefined);
    }

    function handleCancel() {
        setPriceRaw(initialPrice);
        setPriceText(initialPriceText);
        setIsEditing(false);
        setError(undefined);
    }

    function handlePriceInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = parseCurrencyInput(e.target.value);
        setPriceRaw(raw != null ? String(raw) : "");
        if (raw != null) {
            setPriceText(formatCurrency(raw));
        }
    }

    function handleSave() {
        if (!product.id) return;
        const id = product.id;
        const priceNum = parseCurrencyInput(priceRaw);

        startTransition(async () => {
            const result = await updateScrapedProductAction(id, {
                price: priceNum,
                priceText: priceText.trim() || (priceNum != null ? formatCurrency(priceNum) : ""),
            });

            if (result.error) {
                setError(result.error);
            } else {
                setIsEditing(false);
            }
        });
    }

    return (
        <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                    Price
                </p>
                <div className="flex items-center gap-1.5">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className="inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-xs font-black text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckIcon />
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600 transition hover:border-rose-300 hover:text-rose-600"
                            >
                                <XIcon />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEdit}
                            aria-label="Edit price"
                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600 transition hover:border-emerald-400 hover:text-emerald-800"
                        >
                            <PencilIcon />
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="mt-3 flex flex-col gap-2">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">
                            Amount (Rp)
                        </p>
                        <input
                            className="mt-1 h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 text-sm font-black text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            inputMode="numeric"
                            placeholder="e.g. 6500000"
                            value={priceRaw ? formatCurrency(Number(priceRaw)) : ""}
                            onChange={handlePriceInputChange}
                        />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">
                            Display text
                        </p>
                        <input
                            className="mt-1 h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            placeholder="e.g. Rp 6,5 Juta"
                            value={priceText}
                            onChange={(e) => setPriceText(e.target.value)}
                        />
                    </div>
                    {error ? (
                        <p className="text-xs font-semibold text-rose-600">{error}</p>
                    ) : null}
                </div>
            ) : (
                <>
                    <p className="mt-2 break-words text-2xl font-black leading-8 text-emerald-950">
                        {displayPrice}
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold leading-6 text-emerald-800">
                        {priceText || "No original price text"}
                    </p>
                </>
            )}
        </section>
    );
}

export default function ScrapedProductDetailClient({
    product,
}: {
    product: ScrapedProduct;
}) {
    const [fields, setFields] = useState<SectionFields>({
        overview: {
            title: product.title ?? "",
            description: product.description ?? "",
        },
        links: {
            sourceUrl: product.sourceUrl ?? "",
            imageUrl: product.imageUrl ?? "",
            detailUrl: product.detailUrl ?? "",
        },
    });

    const [editing, setEditing] = useState<EditingSection>(null);
    const [draft, setDraft] = useState<Partial<SectionFields[keyof SectionFields]>>({});
    const [errors, setErrors] = useState<Partial<Record<keyof SectionFields, string>>>({});
    const [isPending, startTransition] = useTransition();

    function startEdit(section: keyof SectionFields) {
        setDraft({ ...fields[section] });
        setEditing(section);
        setErrors((prev) => ({ ...prev, [section]: undefined }));
    }

    function cancelEdit() {
        setEditing(null);
        setDraft({});
    }

    function saveSection(section: keyof SectionFields) {
        if (!product.id) return;
        const id = product.id;

        startTransition(async () => {
            let payload: Parameters<typeof updateScrapedProductAction>[1] = {};

            if (section === "overview") {
                const d = draft as SectionFields["overview"];
                payload = { title: d.title, description: d.description };
            } else if (section === "links") {
                const d = draft as SectionFields["links"];
                payload = { sourceUrl: d.sourceUrl, imageUrl: d.imageUrl, detailUrl: d.detailUrl };
            }

            const result = await updateScrapedProductAction(id, payload);

            if (result.error) {
                setErrors((prev) => ({ ...prev, [section]: result.error }));
            } else {
                setFields((prev) => ({
                    ...prev,
                    [section]: { ...prev[section], ...draft },
                }));
                setEditing(null);
                setDraft({});
            }
        });
    }

    const overviewDraft = draft as SectionFields["overview"];
    const linksDraft = draft as SectionFields["links"];

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-6">
            {/* Product Overview */}
            <section className="min-w-0">
                <SectionHeader
                    eyebrow="Listing Summary"
                    title="Product overview"
                    isEditing={editing === "overview"}
                    isPending={isPending}
                    onEdit={() => startEdit("overview")}
                    onSave={() => saveSection("overview")}
                    onCancel={cancelEdit}
                    error={errors.overview}
                />
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    {editing === "overview" ? (
                        <div className="flex flex-col gap-3">
                            <div>
                                <FieldLabel>Title</FieldLabel>
                                <input
                                    className={`mt-1 ${inputClass()}`}
                                    value={overviewDraft.title ?? ""}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, title: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <FieldLabel>Description</FieldLabel>
                                <textarea
                                    className={`mt-1 ${inputClass(true)}`}
                                    rows={4}
                                    value={overviewDraft.description ?? ""}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, description: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <FieldLabel>Title</FieldLabel>
                            <p className="mt-2 break-words text-lg font-black leading-7 text-slate-950">
                                {fields.overview.title || "-"}
                            </p>
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <FieldLabel>Description</FieldLabel>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-7 text-slate-700">
                                    {fields.overview.description || "-"}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Source Links */}
            <section className="min-w-0">
                <SectionHeader
                    eyebrow="Navigation"
                    title="Source links"
                    isEditing={editing === "links"}
                    isPending={isPending}
                    onEdit={() => startEdit("links")}
                    onSave={() => saveSection("links")}
                    onCancel={cancelEdit}
                    error={errors.links}
                />
                {editing === "links" ? (
                    <div className="grid gap-3 xl:grid-cols-2">
                        {(
                            [
                                { key: "sourceUrl", label: "Source URL" },
                                { key: "imageUrl", label: "Image URL" },
                            ] as const
                        ).map(({ key, label }) => (
                            <div
                                key={key}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            >
                                <FieldLabel>{label}</FieldLabel>
                                <input
                                    className={`mt-1 ${inputClass()}`}
                                    type="url"
                                    value={linksDraft[key] ?? ""}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, [key]: e.target.value }))
                                    }
                                />
                            </div>
                        ))}
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm xl:col-span-2">
                            <FieldLabel>Detail URL</FieldLabel>
                            <input
                                className={`mt-1 ${inputClass()}`}
                                type="url"
                                value={linksDraft.detailUrl ?? ""}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, detailUrl: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 xl:grid-cols-2">
                        {(
                            [
                                { key: "sourceUrl", label: "Source URL" },
                                { key: "imageUrl", label: "Image URL" },
                            ] as const
                        ).map(({ key, label }) => (
                            <div
                                key={key}
                                className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <FieldLabel>{label}</FieldLabel>
                                    {fields.links[key] ? (
                                        <a
                                            className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
                                            href={fields.links[key]}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open
                                        </a>
                                    ) : null}
                                </div>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 [overflow-wrap:anywhere]">
                                    {fields.links[key] || "-"}
                                </p>
                            </div>
                        ))}
                        <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm xl:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                                <FieldLabel>Detail URL</FieldLabel>
                                {fields.links.detailUrl ? (
                                    <a
                                        className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
                                        href={fields.links.detailUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open
                                    </a>
                                ) : null}
                            </div>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 [overflow-wrap:anywhere]">
                                {fields.links.detailUrl || "-"}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
