"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSuperadminSession } from "@/lib/superadmin-auth";
import { createCategory, updateCategory, deleteCategory } from "@/lib/categories-admin";

export async function createCategoryAction(formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const name = String(formData.get("name") ?? "").trim();
    if (!name) redirect("/admin/categories?error=Name+is+required");

    const result = await createCategory(name);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    redirect(result.error ? `/admin/categories?error=${encodeURIComponent(result.error)}` : "/admin/categories?status=created");
}

export async function updateCategoryAction(formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const id = Number(formData.get("id"));
    const name = String(formData.get("name") ?? "").trim();

    if (!id || !name) redirect("/admin/categories?error=Invalid+data");

    const result = await updateCategory(id, name);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    redirect(result.error ? `/admin/categories?error=${encodeURIComponent(result.error)}` : "/admin/categories?status=updated");
}

export async function deleteCategoryAction(formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const id = Number(formData.get("id"));
    if (!id) redirect("/admin/categories?error=Invalid+ID");

    const result = await deleteCategory(id);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    redirect(result.error ? `/admin/categories?error=${encodeURIComponent(result.error)}` : "/admin/categories?status=deleted");
}
