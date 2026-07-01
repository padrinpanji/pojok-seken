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
    source_url?: string;
};

type MutationResult = { error?: string; product?: Product };
type DeleteResult = { error?: string };

export function generateSlug(value: string) {
    // Try latin-friendly slug first
    const latinSlug = value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);

    if (latinSlug) return latinSlug;

    // Fallback: keep alphanumeric from original (handles non-latin scripts)
    const fallback = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);

    return fallback || `item-${Date.now()}`;
}

// ─── Lookup / upsert helpers ──────────────────────────────────────────────────

async function resolveCategoryId(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, name: string): Promise<number | null> {
    const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("name", name.trim())
        .maybeSingle();

    if (data?.id) return Number(data.id);

    // Create if missing
    const slug = generateSlug(name);
    if (!slug) return null;
    const { data: created } = await supabase
        .from("categories")
        .insert({ name: name.trim(), slug })
        .select("id")
        .single();

    return created?.id ? Number(created.id) : null;
}

async function resolveConditionId(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, name: string): Promise<number | null> {
    const normalized = name.trim() || "Bekas";

    const { data } = await supabase
        .from("listing_conditions")
        .select("id")
        .ilike("name", normalized)
        .maybeSingle();

    if (data?.id) return Number(data.id);

    // Try a loose match (e.g. "Bekas" matches "Bekas Like New")
    const { data: fallback } = await supabase
        .from("listing_conditions")
        .select("id, name")
        .ilike("name", `%${normalized}%`)
        .limit(1)
        .maybeSingle();

    if (fallback?.id) return Number(fallback.id);

    // Create if totally missing
    const slug = generateSlug(normalized);
    const { data: created } = await supabase
        .from("listing_conditions")
        .insert({ name: normalized, slug })
        .select("id")
        .single();

    return created?.id ? Number(created.id) : null;
}

async function resolveSellerIdByName(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, storeName: string, location: string): Promise<number | null> {
    const name = storeName.trim() || "Unknown Seller";

    const { data } = await supabase
        .from("sellers")
        .select("id")
        .eq("store_name", name)
        .maybeSingle();

    if (data?.id) return Number(data.id);

    // Create seller
    const slug = generateSlug(name) + "-" + Date.now();
    const { data: created } = await supabase
        .from("sellers")
        .insert({ store_name: name, slug, location: location.trim() || "Indonesia" })
        .select("id")
        .single();

    return created?.id ? Number(created.id) : null;
}

async function upsertImages(
    supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
    listingId: number,
    image: string,
    gallery: string[],
) {
    // Delete old images
    await supabase.from("listing_images").delete().eq("listing_id", listingId);

    const urls = gallery.length ? gallery : image ? [image] : [];
    if (!urls.length) return;

    const rows = urls.map((url, i) => ({
        listing_id: listingId,
        url,
        display_order: i,
        is_primary: url === image || i === 0,
    }));

    await supabase.from("listing_images").insert(rows);
}

async function upsertHighlights(
    supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
    listingId: number,
    highlights: string[],
) {
    await supabase.from("listing_highlights").delete().eq("listing_id", listingId);

    if (!highlights.length) return;

    const rows = highlights.map((value, i) => ({
        listing_id: listingId,
        value,
        display_order: i,
    }));

    await supabase.from("listing_highlights").insert(rows);
}

// ─── Public CRUD ──────────────────────────────────────────────────────────────

export async function getAdminProducts(): Promise<{ products: Product[]; error?: string }> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { products: [], error: getSupabaseAdminConfigError() };

    const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, category, condition, price, location, image, gallery, year, seller, description, highlights, source_url")
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
            source_url: (row as { source_url?: string | null }).source_url ?? null,
        })),
    };
}

export async function createProduct(payload: ProductPayload): Promise<MutationResult> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const [categoryId, conditionId, sellerId] = await Promise.all([
        resolveCategoryId(supabase, payload.category),
        resolveConditionId(supabase, payload.condition),
        resolveSellerIdByName(supabase, payload.seller, payload.location),
    ]);

    if (!categoryId) return { error: `Category "${payload.category}" not found and could not be created.` };
    if (!conditionId) return { error: `Condition "${payload.condition}" not found.` };
    if (!sellerId) return { error: `Seller "${payload.seller}" could not be resolved.` };

    // Ensure unique slug
    let slug = payload.slug || generateSlug(payload.name);
    const { data: existing } = await supabase.from("listings").select("id").eq("slug", slug).maybeSingle();
    if (existing) slug = `${slug}-${Date.now()}`;

    const { data: listing, error } = await supabase
        .from("listings")
        .insert({
            slug,
            title: payload.name,
            category_id: categoryId,
            seller_id: sellerId,
            condition_id: conditionId,
            price: payload.price,
            location: payload.location || "Indonesia",
            production_year: payload.year || "",
            description: payload.description || "",
            ...(payload.source_url ? { source_url: payload.source_url } : {}),
        })
        .select("id")
        .single();

    if (error) return { error: error.message };

    const listingId = Number(listing.id);

    await Promise.all([
        upsertImages(supabase, listingId, payload.image, payload.gallery),
        upsertHighlights(supabase, listingId, payload.highlights),
    ]);

    return {};
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>): Promise<MutationResult> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const dbPayload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (payload.name !== undefined) dbPayload.title = payload.name;
    if (payload.slug !== undefined) dbPayload.slug = payload.slug;
    if (payload.price !== undefined) dbPayload.price = payload.price;
    if (payload.location !== undefined) dbPayload.location = payload.location;
    if (payload.year !== undefined) dbPayload.production_year = payload.year;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.source_url !== undefined) dbPayload.source_url = payload.source_url || null;

    if (payload.category !== undefined) {
        const categoryId = await resolveCategoryId(supabase, payload.category);
        if (!categoryId) return { error: `Category "${payload.category}" not found.` };
        dbPayload.category_id = categoryId;
    }

    if (payload.condition !== undefined) {
        const conditionId = await resolveConditionId(supabase, payload.condition);
        if (!conditionId) return { error: `Condition "${payload.condition}" not found.` };
        dbPayload.condition_id = conditionId;
    }

    if (payload.seller !== undefined) {
        const sellerId = await resolveSellerIdByName(supabase, payload.seller, payload.location ?? "");
        if (!sellerId) return { error: `Seller "${payload.seller}" could not be resolved.` };
        dbPayload.seller_id = sellerId;
    }

    const { error } = await supabase.from("listings").update(dbPayload).eq("id", id);
    if (error) return { error: error.message };

    if (payload.image !== undefined || payload.gallery !== undefined) {
        const image = payload.image ?? "";
        const gallery = payload.gallery ?? (image ? [image] : []);
        await upsertImages(supabase, id, image, gallery);
    }

    if (payload.highlights !== undefined) {
        await upsertHighlights(supabase, id, payload.highlights);
    }

    return {};
}

export async function deleteProduct(id: number): Promise<DeleteResult> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { error: getSupabaseAdminConfigError() };

    // Cascade deletes images and highlights via FK
    const { error } = await supabase.from("listings").delete().eq("id", id);
    return error ? { error: error.message } : {};
}
