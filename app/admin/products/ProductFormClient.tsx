"use client";

import { useRef, useState } from "react";
import type { Product } from "@/data/products";

function formatCurrencyDisplay(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("id-ID").format(Number(digits));
}

export default function ProductFormClient({
    product,
    action,
    categories,
    conditions,
    error,
}: {
    product?: Product;
    action: (formData: FormData) => Promise<void>;
    categories: string[];
    conditions: string[];
    error?: string;
}) {
    const [priceDisplay, setPriceDisplay] = useState(
        product?.price ? formatCurrencyDisplay(String(product.price)) : "",
    );
    const [slug, setSlug] = useState(product?.slug ?? "");
    const [nameValue, setNameValue] = useState(product?.name ?? "");
    const [imagePreview, setImagePreview] = useState(product?.image ?? "");
    const [category, setCategory] = useState(product?.category ?? "");
    const [condition, setCondition] = useState(product?.condition ?? "");
    const nameRef = useRef<HTMLInputElement>(null);

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value;
        setNameValue(name);
        if (!product) {
            setSlug(
                name
                    .toLowerCase()
                    .trim()
                    .normalize("NFKD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                    .slice(0, 120),
            );
        }
    }

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPriceDisplay(formatCurrencyDisplay(e.target.value));
    }

    const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
    const labelClass = "block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500";
    const textareaClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

    return (
        <form action={action} className="flex flex-col gap-6">
            {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                    {error}
                </div>
            ) : null}

            <div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
                {/* Name — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-name">Name</label>
                    <input ref={nameRef} id="pf-name" name="name" required className={`mt-1 ${inputClass}`}
                        value={nameValue} onChange={handleNameChange} placeholder="Product name" />
                </div>

                {/* Slug — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-slug">Slug</label>
                    <input id="pf-slug" name="slug" className={`mt-1 ${inputClass} font-mono`}
                        value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated-from-name" />
                </div>

                {/* Category */}
                <div>
                    <label className={labelClass} htmlFor="pf-category">Category</label>
                    <select id="pf-category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}
                        className={`mt-1 ${inputClass} cursor-pointer`}>
                        <option value="">— Select —</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Condition */}
                <div>
                    <label className={labelClass} htmlFor="pf-condition">Condition</label>
                    <select id="pf-condition" name="condition" value={condition} onChange={(e) => setCondition(e.target.value)}
                        className={`mt-1 ${inputClass} cursor-pointer`}>
                        <option value="">— Select —</option>
                        {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Price */}
                <div>
                    <label className={labelClass} htmlFor="pf-price">Price (Rp)</label>
                    <input id="pf-price" name="price" required inputMode="numeric"
                        className={`mt-1 ${inputClass}`} value={priceDisplay}
                        onChange={handlePriceChange} placeholder="e.g. 500.000" />
                </div>

                {/* Year */}
                <div>
                    <label className={labelClass} htmlFor="pf-year">Year</label>
                    <input id="pf-year" name="year" className={`mt-1 ${inputClass}`}
                        defaultValue={product?.year} placeholder="e.g. 2022" />
                </div>

                {/* Location */}
                <div>
                    <label className={labelClass} htmlFor="pf-location">Location</label>
                    <input id="pf-location" name="location" required className={`mt-1 ${inputClass}`}
                        defaultValue={product?.location} placeholder="e.g. Jakarta" />
                </div>

                {/* Seller */}
                <div>
                    <label className={labelClass} htmlFor="pf-seller">Seller</label>
                    <input id="pf-seller" name="seller" required className={`mt-1 ${inputClass}`}
                        defaultValue={product?.seller} placeholder="Seller name" />
                </div>

                {/* Image — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-image">Image URL</label>
                    <input id="pf-image" name="image" type="url" className={`mt-1 ${inputClass}`}
                        value={imagePreview} onChange={(e) => setImagePreview(e.target.value)}
                        placeholder="https://..." />
                    {imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-32 rounded-lg border border-slate-200 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : null}
                </div>

                {/* Gallery — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-gallery">Gallery URLs (one per line)</label>
                    <textarea id="pf-gallery" name="gallery" rows={3} className={`mt-1 ${textareaClass}`}
                        defaultValue={product?.gallery?.join("\n")} placeholder={"https://image1.jpg\nhttps://image2.jpg"} />
                </div>

                {/* Description — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-description">Description</label>
                    <textarea id="pf-description" name="description" rows={4} className={`mt-1 ${textareaClass}`}
                        defaultValue={product?.description} placeholder="Product description..." />
                </div>

                {/* Highlights — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-highlights">Highlights (one per line)</label>
                    <textarea id="pf-highlights" name="highlights" rows={3} className={`mt-1 ${textareaClass}`}
                        defaultValue={product?.highlights?.join("\n")} placeholder={"Good condition\nOriginal box included"} />
                </div>

                {/* Source URL — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className={labelClass} htmlFor="pf-source-url">Source URL <span className="font-medium normal-case text-slate-400">(original listing)</span></label>
                    <input id="pf-source-url" name="source_url" type="url" className={`mt-1 ${inputClass}`}
                        defaultValue={product?.source_url ?? ""} placeholder="https://..." />
                </div>

                {/* Verified toggle — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input type="hidden" name="is_verified" value="false" />
                        <input
                            id="pf-is-verified"
                            name="is_verified"
                            type="checkbox"
                            value="true"
                            defaultChecked={product?.is_verified ?? false}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-emerald-700"
                        />
                        <span className="text-sm font-black text-slate-700">
                            Unit Terverifikasi
                            <span className="ml-1.5 text-xs font-medium text-slate-400">tampilkan badge verifikasi di halaman produk</span>
                        </span>
                    </label>
                </div>

                {/* Featured toggle — full width */}
                <div className="sm:col-span-2 xl:col-span-4">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input type="hidden" name="is_featured" value="false" />
                        <input
                            id="pf-is-featured"
                            name="is_featured"
                            type="checkbox"
                            value="true"
                            defaultChecked={product?.is_featured ?? false}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-emerald-700"
                        />
                        <span className="text-sm font-black text-slate-700">
                            Produk Utama (Hero)
                            <span className="ml-1.5 text-xs font-medium text-slate-400">tampilkan di hero homepage sebagai produk unggulan</span>
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button type="submit"
                    className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-emerald-800 px-6 text-sm font-black text-white transition hover:bg-emerald-900">
                    {product ? "Save changes" : "Create product"}
                </button>
                <a href="/admin/products"
                    className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
                    Cancel
                </a>
            </div>
        </form>
    );
}
