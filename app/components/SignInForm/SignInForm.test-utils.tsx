import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

import { SignInForm } from "./SignInForm";
import type { LoginArgs } from "./SignInForm.types";

export async function renderSignInForm() {
  const onSuccess = vi.fn();
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <SignInForm onSuccess={onSuccess} />,
      ErrorBoundary: () => <p>Something went wrong</p>,
    },
  ]);
  const screen = await render(
    <QueryClientProvider client={new QueryClient()}>
      <Stub />
    </QueryClientProvider>,
  );

  async function submit({ username, password }: LoginArgs) {
    await screen.getByLabelText(/^Username/).fill(username);
    await screen.getByLabelText(/^Password/).fill(password);
    await screen.getByRole("button", { name: "Sign in" }).click();
  }

  return { screen, onSuccess, submit };
}
