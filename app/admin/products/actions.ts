"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSuperadminSession } from "@/lib/superadmin-auth";
import { createProduct, updateProduct, deleteProduct, bulkDeleteProducts, generateSlug, type ProductPayload } from "@/lib/products-admin";

function parsePrice(value: string): number {
    const digits = value.replace(/\D/g, "");
    return Number(digits) || 0;
}

function parseLines(value: string): string[] {
    return value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

function parseUrls(value: string): string[] {
    return value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

function buildPayload(formData: FormData): ProductPayload {
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim() || generateSlug(name);

    return {
        name,
        slug,
        category: String(formData.get("category") ?? "").trim(),
        condition: String(formData.get("condition") ?? "").trim(),
        price: parsePrice(String(formData.get("price") ?? "")),
        location: String(formData.get("location") ?? "").trim(),
        image: String(formData.get("image") ?? "").trim(),
        gallery: parseUrls(String(formData.get("gallery") ?? "")),
        year: String(formData.get("year") ?? "").trim(),
        seller: String(formData.get("seller") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        highlights: parseLines(String(formData.get("highlights") ?? "")),
        source_url: String(formData.get("source_url") ?? "").trim() || undefined,
        is_verified: formData.getAll("is_verified").includes("true"),
        is_featured: formData.getAll("is_featured").includes("true"),
    };
}

export async function createProductAction(formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const payload = buildPayload(formData);

    if (!payload.name || !payload.category || !payload.condition || !payload.price) {
        redirect("/admin/products/new?error=required");
    }

    const result = await createProduct(payload);

    if (result.error) {
        const params = new URLSearchParams({ error: result.error });
        redirect(`/admin/products/new?${params.toString()}`);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect("/admin/products?status=created");
}

export async function updateProductAction(id: number, formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const payload = buildPayload(formData);
    const result = await updateProduct(id, payload);

    if (result.error) {
        const params = new URLSearchParams({ error: result.error });
        redirect(`/admin/products/${id}/edit?${params.toString()}`);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect("/admin/products?status=updated");
}

export async function deleteProductAction(formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const id = Number(formData.get("id"));

    if (!id) redirect("/admin/products?error=invalid");

    const result = await deleteProduct(id);

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect(result.error ? `/admin/products?error=${encodeURIComponent(result.error)}` : "/admin/products?status=deleted");
}

export async function bulkDeleteProductsAction(formData: FormData) {
    if (!(await hasSuperadminSession())) redirect("/auth");

    const ids = formData
        .getAll("ids")
        .map((v) => Number(v))
        .filter((n) => n > 0);

    if (!ids.length) redirect("/admin/products?error=No+items+selected");

    const result = await bulkDeleteProducts(ids);

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect(
        result.error
            ? `/admin/products?error=${encodeURIComponent(result.error)}`
            : `/admin/products?status=deleted&count=${result.deletedCount}`,
    );
}
