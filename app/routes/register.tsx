import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Form, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/register";

type ApiError = {
  message: string;
  hint: string | null;
};

type FieldErrors = Partial<Record<"username" | "password", string>>;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Register" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const response = await fetch("http://127.0.0.1:25000/rpc/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const { token } = (await response.json()) as { token: string };
    localStorage.setItem("token", token);
    return redirect("/");
  }

  if (response.status === 400 || response.status === 409) {
    const { message, hint } = (await response.json()) as ApiError;
    const text = hint ?? message;
    const errors: FieldErrors =
      message === "Invalid password" ? { password: text } : { username: text };
    return { username, errors };
  }

  throw new Error(`Sign-up request failed with status ${response.status}`);
}

export default function Register({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const errors = actionData?.errors;

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack component={Form} method="post" spacing={3}>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <TextField
              variant="standard"
              name="username"
              label="Username"
              autoComplete="username"
              defaultValue={actionData?.username}
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
            <Button
              type="submit"
              variant="contained"
              loading={navigation.state === "submitting"}
            >
              Sign up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
