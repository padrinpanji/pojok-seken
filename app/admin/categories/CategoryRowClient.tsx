"use client";

import { useState } from "react";
import { updateCategoryAction, deleteCategoryAction } from "@/app/admin/categories/actions";
import type { Category } from "@/lib/categories-admin";

export default function CategoryRowClient({ category }: { category: Category }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);

    if (isEditing) {
        return (
            <tr>
                <td className="px-4 py-3 text-sm text-slate-400">{category.id}</td>
                <td className="px-4 py-3" colSpan={2}>
                    <form action={async (fd) => { await updateCategoryAction(fd); setIsEditing(false); }}
                        className="flex items-center gap-2">
                        <input type="hidden" name="id" value={category.id} />
                        <input
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                            className="h-9 flex-1 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                        <button type="submit"
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-800 px-4 text-xs font-black text-white transition hover:bg-emerald-900">
                            Save
                        </button>
                        <button type="button" onClick={() => { setName(category.name); setIsEditing(false); }}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-rose-300 hover:text-rose-600">
                            Cancel
                        </button>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td className="px-4 py-3 text-sm text-slate-400">{category.id}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-800">{category.name}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setIsEditing(true)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
                        Edit
                    </button>
                    <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={category.id} />
                        <button type="submit"
                            className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                            onClick={(e) => { if (!confirm(`Delete "${category.name}"?`)) e.preventDefault(); }}>
                            Delete
                        </button>
                    </form>
                </div>
            </td>
        </tr>
    );
}
