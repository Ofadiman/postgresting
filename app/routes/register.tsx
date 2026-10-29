import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { PostgrestError } from "@supabase/postgrest-js";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

import { api } from "~/api";
import type { Database } from "~/database.types";
import type { Route } from "./+types/register";

type SignupArgs = Database["api"]["Functions"]["signup"]["Args"];

const signupSchema = z
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

function toFieldError(error: Error) {
  if (!(error instanceof PostgrestError)) return null;
  if (error.code !== "PT400" && error.code !== "PT409") return null;
  const name: keyof SignupArgs =
    error.message === "Invalid password" ? "password" : "username";
  return { name, message: error.hint || error.message };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Register" }];
}

export default function Register() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", password: "", passwordConfirmation: "" },
  });
  const signup = useMutation({
    mutationFn: async (args: SignupArgs) => {
      const { data } = await api.rpc("signup", args).single().throwOnError();
      return data;
    },
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      navigate("/");
    },
    onError: (error) => {
      const fieldError = toFieldError(error);
      if (fieldError) {
        form.setError(fieldError.name, {
          type: "server",
          message: fieldError.message,
        });
      }
    },
    throwOnError: (error) => toFieldError(error) === null,
  });
  const { errors } = form.formState;

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack
            component="form"
            noValidate
            spacing={3}
            onSubmit={form.handleSubmit(({ username, password }) =>
              signup.mutate({ username, password }),
            )}
          >
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <TextField
              {...form.register("username")}
              variant="standard"
              label="Username"
              autoComplete="username"
              required
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
            />
            <TextField
              {...form.register("password", { deps: ["passwordConfirmation"] })}
              variant="standard"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <TextField
              {...form.register("passwordConfirmation")}
              variant="standard"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              error={Boolean(errors.passwordConfirmation)}
              helperText={errors.passwordConfirmation?.message}
            />
            <Button
              type="submit"
              variant="contained"
              loading={signup.isPending}
            >
              Sign up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
