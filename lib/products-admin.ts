import "server-only";
import { createSupabaseAdminClient, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import type { Product } from "@/data/products";

export type ProductPayload = {
    name: string;
    slug: string;
    category: string;
    condition: string;
    price: number;
    location: string;
    image: string;
    gallery: string[];
    year: string;
    seller: string;
    description: string;
    highlights: string[];
};

type ProductMutationResult = {
    error?: string;
    product?: Product;
};

type DeleteProductResult = {
    error?: string;
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
}

export function generateSlug(name: string) {
    return slugify(name);
}

export async function createProduct(payload: ProductPayload): Promise<ProductMutationResult> {
    const supabase = createSupabaseAdminClient();

    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const { data, error } = await supabase
        .from("products")
        .insert({
            name: payload.name,
            slug: payload.slug,
            category: payload.category,
            condition: payload.condition,
            price: payload.price,
            location: payload.location,
            image: payload.image,
            gallery: payload.gallery,
            year: payload.year,
            seller: payload.seller,
            description: payload.description,
            highlights: payload.highlights,
        })
        .select()
        .single();

    if (error) return { error: error.message };

    return { product: data as unknown as Product };
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>): Promise<ProductMutationResult> {
    const supabase = createSupabaseAdminClient();

    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const dbPayload: Record<string, unknown> = {};
    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.slug !== undefined) dbPayload.slug = payload.slug;
    if (payload.category !== undefined) dbPayload.category = payload.category;
    if (payload.condition !== undefined) dbPayload.condition = payload.condition;
    if (payload.price !== undefined) dbPayload.price = payload.price;
    if (payload.location !== undefined) dbPayload.location = payload.location;
    if (payload.image !== undefined) dbPayload.image = payload.image;
    if (payload.gallery !== undefined) dbPayload.gallery = payload.gallery;
    if (payload.year !== undefined) dbPayload.year = payload.year;
    if (payload.seller !== undefined) dbPayload.seller = payload.seller;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.highlights !== undefined) dbPayload.highlights = payload.highlights;

    const { data, error } = await supabase
        .from("products")
        .update(dbPayload)
        .eq("id", id)
        .select()
        .single();

    if (error) return { error: error.message };

    return { product: data as unknown as Product };
}

export async function deleteProduct(id: number): Promise<DeleteProductResult> {
    const supabase = createSupabaseAdminClient();

    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) return { error: error.message };

    return {};
}

export async function getAdminProducts(): Promise<{ products: Product[]; error?: string }> {
    const supabase = createSupabaseAdminClient();

    if (!supabase) return { products: [], error: getSupabaseAdminConfigError() };

    const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, category, condition, price, location, image, gallery, year, seller, description, highlights")
        .order("id", { ascending: false });

    if (error) return { products: [], error: error.message };

    return {
        products: (data ?? []).map((row) => ({
            id: Number(row.id),
            slug: row.slug ?? "",
            name: row.name ?? "",
            category: row.category ?? "",
            condition: row.condition ?? "",
            price: Number(row.price) || 0,
            location: row.location ?? "",
            image: row.image || "/logo-pojok-seken.svg",
            gallery: Array.isArray(row.gallery) ? row.gallery : [],
            year: String(row.year ?? ""),
            seller: row.seller ?? "",
            description: row.description ?? "",
            highlights: Array.isArray(row.highlights) ? row.highlights : [],
        })),
    };
}
