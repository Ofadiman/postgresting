import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useSignInForm } from "./SignInForm.hooks";
import type { SignInFormProps } from "./SignInForm.types";

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { form, isPending, onSubmit } = useSignInForm({ onSuccess });
  const { errors } = form.formState;

  return (
    <Stack component="form" noValidate spacing={3} onSubmit={onSubmit}>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
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
        {...form.register("password")}
        variant="standard"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <Button type="submit" variant="contained" loading={isPending}>
        Sign in
      </Button>
    </Stack>
  );
}
