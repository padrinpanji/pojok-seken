import "server-only";
import { createSupabaseAdminClient, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { generateSlug } from "@/lib/products-admin";

export type Category = {
    id: number;
    name: string;
};

type MutationResult = { error?: string };

export async function getAdminCategories(): Promise<{ categories: Category[]; error?: string }> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { categories: [], error: getSupabaseAdminConfigError() };

    const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("id", { ascending: true });

    if (error) return { categories: [], error: error.message };

    return {
        categories: (data ?? [])
            .filter((row) => row.name)
            .map((row) => ({ id: Number(row.id), name: String(row.name) })),
    };
}

export async function createCategory(name: string): Promise<MutationResult> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const slug = generateSlug(name);
    const { error } = await supabase.from("categories").insert({ name: name.trim(), slug });

    return error ? { error: error.message } : {};
}

export async function updateCategory(id: number, name: string): Promise<MutationResult> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const slug = generateSlug(name);
    const { error } = await supabase
        .from("categories")
        .update({ name: name.trim(), slug })
        .eq("id", id);

    return error ? { error: error.message } : {};
}

export async function deleteCategory(id: number): Promise<MutationResult> {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return { error: getSupabaseAdminConfigError() };

    const { error } = await supabase.from("categories").delete().eq("id", id);

    return error ? { error: error.message } : {};
}
