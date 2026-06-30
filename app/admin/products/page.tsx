import type { Metadata } from "next";
import Link from "next/link";
import AdminShell from "@/app/admin/AdminShell";
import DeleteProductButton from "@/app/admin/products/DeleteProductButton";
import { getAdminProducts } from "@/lib/products-admin";
import { formatPrice } from "@/data/products";

export const metadata: Metadata = {
    title: "Admin Products",
    robots: { index: false, follow: false },
};

type ProductsPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getAlertClass(status: string) {
    if (status === "created" || status === "updated" || status === "deleted") {
        return "border-emerald-200 bg-emerald-50 text-emerald-950";
    }
    return "border-rose-200 bg-rose-50 text-rose-950";
}

function getAlertMessage(status: string, error: string) {
    if (error) return error;
    if (status === "created") return "Product created successfully.";
    if (status === "updated") return "Product updated successfully.";
    if (status === "deleted") return "Product deleted.";
    return "";
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;
    const status = Array.isArray(params?.status) ? params.status[0] : (params?.status ?? "");
    const error = Array.isArray(params?.error) ? params.error[0] : (params?.error ?? "");
    const alertMessage = getAlertMessage(status, error);

    const { products, error: loadError } = await getAdminProducts();

    return (
        <AdminShell activeItem="products">
            <div className="flex max-w-7xl flex-col gap-5">
                {/* Header */}
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Catalog</p>
                            <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950">Products</h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">{products.length} products</p>
                        </div>
                        <Link
                            href="/admin/products/new"
                            className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-800 px-5 text-sm font-black text-white transition hover:bg-emerald-900"
                        >
                            + New product
                        </Link>
                    </div>
                </section>

                {/* Alert */}
                {alertMessage ? (
                    <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${getAlertClass(status || (error ? "error" : ""))}`}>
                        {alertMessage}
                    </div>
                ) : null}

                {loadError ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
                        {loadError}
                    </div>
                ) : null}

                {/* Table */}
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full divide-y divide-slate-200 text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Image</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Category</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Condition</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Price</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Seller</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {products.length ? products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-12 w-12 rounded-lg border border-slate-200 object-cover bg-slate-100"
                                                onError={undefined}
                                            />
                                        </td>
                                        <td className="max-w-60 px-4 py-3">
                                            <p className="truncate text-sm font-black text-slate-950">{product.name}</p>
                                            <p className="mt-0.5 truncate text-xs font-medium text-slate-400">{product.slug}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{product.category}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-black ${product.condition === "Baru" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                                                {product.condition}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-black text-emerald-800 whitespace-nowrap">{formatPrice(product.price)}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{product.seller}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
                                                >
                                                    Edit
                                                </Link>
                                                <DeleteProductButton id={product.id} name={product.name} />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                                            No products yet. <Link href="/admin/products/new" className="text-emerald-700 underline">Create one</Link>.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminShell>
    );
}
