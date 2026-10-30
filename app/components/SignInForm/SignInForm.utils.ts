import { PostgrestError } from "@supabase/postgrest-js";

export function toFormError(error: Error) {
  if (!(error instanceof PostgrestError)) return null;
  if (error.code !== "PT401") return null;
  return { message: error.message };
}
