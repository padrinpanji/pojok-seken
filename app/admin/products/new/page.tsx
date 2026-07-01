import type { Metadata } from "next";
import Link from "next/link";
import AdminShell from "@/app/admin/AdminShell";
import ProductFormClient from "@/app/admin/products/ProductFormClient";
import { createProductAction } from "@/app/admin/products/actions";
import { getCategories, getConditions } from "@/data/products";

export const metadata: Metadata = {
    title: "New Product",
    robots: { index: false, follow: false },
};

type NewProductPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
    const params = await searchParams;
    const error = Array.isArray(params?.error) ? params.error[0] : (params?.error ?? "");
    const [categories, conditions] = await Promise.all([getCategories(), getConditions()]);

    return (
        <AdminShell activeItem="products">
            <div className="flex flex-col gap-5">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Products</p>
                    <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950">New product</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        <Link href="/admin/products" className="text-emerald-700 hover:underline">← Back to products</Link>
                    </p>
                </div>
                <ProductFormClient
                    action={createProductAction}
                    categories={categories}
                    conditions={conditions}
                    error={error || undefined}
                />
            </div>
        </AdminShell>
    );
}
