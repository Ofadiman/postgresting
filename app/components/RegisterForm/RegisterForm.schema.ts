import { z } from "zod";

import type { SignupArgs } from "./RegisterForm.types";

export const registerFormSchema = z
  .object({
    username: z
      .string()
      .regex(
        /^[A-Za-z0-9_]{3,32}$/,
        "Use 3 to 32 letters, digits, or underscores.",
      ),
    password: z
      .string()
      .refine((value) => [...value].length >= 8, "Use at least 8 characters.")
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        "Use at most 72 bytes.",
      ),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    error: "Passwords don't match.",
    path: ["passwordConfirmation"],
  }) satisfies z.ZodType<SignupArgs>;
