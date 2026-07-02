"use client";

import { deleteProductAction } from "@/app/admin/products/actions";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
    return (
        <form action={deleteProductAction}>
            <input type="hidden" name="id" value={id} />
            <button
                type="submit"
                className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                onClick={(e) => {
                    if (!confirm(`Delete "${name}"?`)) e.preventDefault();
                }}
            >
                Delete
            </button>
        </form>
    );
}
