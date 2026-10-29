import { PostgrestClient } from "@supabase/postgrest-js";

import type { Database } from "./database.types";

export const api = new PostgrestClient<Database>("http://127.0.0.1:25000", {
  schema: "api",
});
