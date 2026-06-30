import type { Metadata } from "next";
import AdminShell from "@/app/admin/AdminShell";
import CategoryRowClient from "@/app/admin/categories/CategoryRowClient";
import { createCategoryAction } from "@/app/admin/categories/actions";
import { getAdminCategories } from "@/lib/categories-admin";

export const metadata: Metadata = {
    title: "Admin Categories",
    robots: { index: false, follow: false },
};

type CategoriesPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
    const params = await searchParams;
    const status = Array.isArray(params?.status) ? params.status[0] : (params?.status ?? "");
    const error = Array.isArray(params?.error) ? params.error[0] : (params?.error ?? "");

    const { categories, error: loadError } = await getAdminCategories();

    return (
        <AdminShell activeItem="categories">
            <div className="flex max-w-2xl flex-col gap-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Catalog</p>
                    <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950">Categories</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">{categories.length} categories</p>
                </section>

                {(status || error) ? (
                    <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
                        {error || (status === "created" ? "Category created." : status === "updated" ? "Category updated." : "Category deleted.")}
                    </div>
                ) : null}

                {loadError ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">{loadError}</div>
                ) : null}

                {/* Add new */}
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 mb-3">Add category</p>
                    <form action={createCategoryAction} className="flex gap-2">
                        <input
                            name="name"
                            required
                            placeholder="Category name"
                            className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                        <button type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-800 px-5 text-sm font-black text-white transition hover:bg-emerald-900">
                            Add
                        </button>
                    </form>
                </section>

                {/* Table */}
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="w-16 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">ID</th>
                                <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Name</th>
                                <th className="w-36 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {categories.length ? categories.map((category) => (
                                <CategoryRowClient key={category.id} category={category} />
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                                        No categories yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </div>
        </AdminShell>
    );
}
