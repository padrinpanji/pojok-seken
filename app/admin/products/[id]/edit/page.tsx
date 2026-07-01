import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/app/admin/AdminShell";
import ProductFormClient from "@/app/admin/products/ProductFormClient";
import { updateProductAction } from "@/app/admin/products/actions";
import { getCategories, getConditions } from "@/data/products";
import { getAdminProducts } from "@/lib/products-admin";

export const metadata: Metadata = {
    title: "Edit Product",
    robots: { index: false, follow: false },
};

type EditProductPageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
    const { id: idParam } = await params;
    const queryParams = await searchParams;
    const error = Array.isArray(queryParams?.error) ? queryParams.error[0] : (queryParams?.error ?? "");

    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) notFound();

    const [{ products }, categories, conditions] = await Promise.all([
        getAdminProducts(),
        getCategories(),
        getConditions(),
    ]);

    const product = products.find((p) => p.id === id);
    if (!product) notFound();

    // Bind the id into the action
    const action = updateProductAction.bind(null, id);

    return (
        <AdminShell activeItem="products">
            <div className="flex flex-col gap-5">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Products</p>
                    <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950">Edit product</h1>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                        <Link href="/admin/products" className="text-emerald-700 hover:underline">← Back to products</Link>
                        <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-700"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            See Preview
                        </Link>
                    </div>
                </div>
                <ProductFormClient
                    product={product}
                    action={action}
                    categories={categories}
                    conditions={conditions}
                    error={error || undefined}
                />
            </div>
        </AdminShell>
    );
}
