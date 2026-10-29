import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useRegisterForm } from "./RegisterForm.hooks";
import type { RegisterFormProps } from "./RegisterForm.types";

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { form, isPending, onSubmit } = useRegisterForm({ onSuccess });
  const { errors } = form.formState;

  return (
    <Stack component="form" noValidate spacing={3} onSubmit={onSubmit}>
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
      <Button type="submit" variant="contained" loading={isPending}>
        Sign up
      </Button>
    </Stack>
  );
}
