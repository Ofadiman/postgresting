import { z } from "zod";

import type { LoginArgs } from "./SignInForm.types";

export const signInFormSchema = z.object({
  username: z.string().min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
}) satisfies z.ZodType<LoginArgs>;
