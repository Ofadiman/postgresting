import { http, HttpResponse } from "msw/http";
import { expect, test, vi } from "vitest";

import { worker } from "~/test/worker";
import { renderSignInForm } from "./SignInForm.test-utils";

test("asks for a username and password when submitted empty", async () => {
  const { screen, onSuccess, submit } = await renderSignInForm();

  await submit({ username: "", password: "" });

  await expect
    .element(screen.getByLabelText(/^Username/))
    .toHaveAccessibleDescription("Enter your username.");
  await expect
    .element(screen.getByLabelText(/^Password/))
    .toHaveAccessibleDescription("Enter your password.");
  expect(onSuccess).not.toHaveBeenCalled();
});

test("stores the token and reports success after signing in", async () => {
  let body: unknown;
  worker.use(
    http.post("*/rpc/login", async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ token: "access-token" });
    }),
  );
  const { onSuccess, submit } = await renderSignInForm();

  await submit({ username: "alice", password: "correct horse" });

  await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(body).toEqual({ username: "alice", password: "correct horse" });
  expect(localStorage.getItem("token")).toBe("access-token");
});

test("shows the server message when the credentials are wrong", async () => {
  worker.use(
    http.post("*/rpc/login", () =>
      HttpResponse.json(
        {
          code: "PT401",
          message: "Invalid username or password",
          details: null,
          hint: null,
        },
        { status: 401 },
      ),
    ),
  );
  const { screen, onSuccess, submit } = await renderSignInForm();

  await submit({ username: "alice", password: "wrong password" });

  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Invalid username or password");
  expect(onSuccess).not.toHaveBeenCalled();
  expect(localStorage.getItem("token")).toBeNull();
});

test("hands unexpected server errors to the error boundary", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  worker.use(
    http.post("*/rpc/login", () =>
      HttpResponse.json(
        { code: "XX000", message: "Internal error", details: null, hint: null },
        { status: 500 },
      ),
    ),
  );
  const { screen, submit } = await renderSignInForm();

  await submit({ username: "alice", password: "correct horse" });

  await expect.element(screen.getByText("Something went wrong")).toBeVisible();
});

test("disables the submit button while signing in", async () => {
  let respond = () => {};
  const responded = new Promise<void>((resolve) => {
    respond = resolve;
  });
  worker.use(
    http.post("*/rpc/login", async () => {
      await responded;
      return HttpResponse.json({ token: "access-token" });
    }),
  );
  const { screen, submit } = await renderSignInForm();
  const button = screen.getByRole("button", { name: "Sign in" });

  await submit({ username: "alice", password: "correct horse" });

  await expect.element(button).toBeDisabled();
  respond();
  await expect.element(button).toBeEnabled();
});

test("links to the registration page", async () => {
  const { screen } = await renderSignInForm();

  await expect
    .element(screen.getByRole("link", { name: "Sign up" }))
    .toHaveAttribute("href", "/register");
});
