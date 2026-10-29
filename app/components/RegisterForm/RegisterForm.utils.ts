import { PostgrestError } from "@supabase/postgrest-js";

import type { SignupArgs } from "./RegisterForm.types";

export function toFieldError(error: Error) {
  if (!(error instanceof PostgrestError)) return null;
  if (error.code !== "PT400" && error.code !== "PT409") return null;
  const name: keyof SignupArgs =
    error.message === "Invalid password" ? "password" : "username";
  return { name, message: error.hint || error.message };
}
