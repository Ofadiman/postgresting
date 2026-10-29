import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { PostgrestError } from "@supabase/postgrest-js";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { api } from "~/api";
import type { Database } from "~/database.types";
import type { Route } from "./+types/register";

type SignupArgs = Database["api"]["Functions"]["signup"]["Args"];

type FieldErrors = Partial<Record<keyof SignupArgs, string>>;

function toFieldErrors(error: Error | null): FieldErrors | null {
  if (!(error instanceof PostgrestError)) return null;
  if (error.code !== "PT400" && error.code !== "PT409") return null;
  const text = error.hint || error.message;
  return error.message === "Invalid password" ? { password: text } : { username: text };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Register" }];
}

export default function Register() {
  const navigate = useNavigate();
  const signup = useMutation({
    mutationFn: async (args: SignupArgs) => {
      const { data } = await api.rpc("signup", args).single().throwOnError();
      return data;
    },
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      navigate("/");
    },
    throwOnError: (error) => toFieldErrors(error) === null,
  });
  const errors = toFieldErrors(signup.error);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack
            component="form"
            spacing={3}
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              signup.mutate({
                username: String(formData.get("username") ?? ""),
                password: String(formData.get("password") ?? ""),
              });
            }}
          >
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <TextField
              variant="standard"
              name="username"
              label="Username"
              autoComplete="username"
              required
              error={Boolean(errors?.username)}
              helperText={errors?.username}
            />
            <TextField
              variant="standard"
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              error={Boolean(errors?.password)}
              helperText={errors?.password}
            />
            <Button type="submit" variant="contained" loading={signup.isPending}>
              Sign up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
