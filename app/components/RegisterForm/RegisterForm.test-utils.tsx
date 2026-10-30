import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import { render } from "vitest-browser-react";
import type { z } from "zod";

import { RegisterForm } from "./RegisterForm";
import type { registerFormSchema } from "./RegisterForm.schema";

export async function renderRegisterForm() {
  const onSuccess = vi.fn();
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <RegisterForm onSuccess={onSuccess} />,
      ErrorBoundary: () => <p>Something went wrong</p>,
    },
  ]);
  const screen = await render(
    <QueryClientProvider client={new QueryClient()}>
      <Stub />
    </QueryClientProvider>,
  );
  const fields = {
    username: screen.getByLabelText(/^Username/),
    password: screen.getByLabelText(/^Password/),
    passwordConfirmation: screen.getByLabelText(/^Confirm password/),
  };

  async function submit(values: z.input<typeof registerFormSchema>) {
    await fields.username.fill(values.username);
    await fields.password.fill(values.password);
    await fields.passwordConfirmation.fill(values.passwordConfirmation);
    await screen.getByRole("button", { name: "Sign up" }).click();
  }

  return { screen, fields, onSuccess, submit };
}
