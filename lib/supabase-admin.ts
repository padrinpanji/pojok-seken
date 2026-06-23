import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export function getSupabaseAdminConfigError() {
  if (!supabaseUrl) {
    return "NEXT_PUBLIC_SUPABASE_URL is not configured.";
  }

  if (!supabaseServiceRoleKey) {
    return "SUPABASE_SERVICE_ROLE_KEY is not configured.";
  }

  return "";
}

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
