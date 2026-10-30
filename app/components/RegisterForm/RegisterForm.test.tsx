import { http, HttpResponse } from "msw/http";
import { expect, test, vi } from "vitest";

import { worker } from "~/test/worker";
import { renderRegisterForm } from "./RegisterForm.test-utils";

test("asks for a valid username and password when submitted empty", async () => {
  const { fields, onSuccess, submit } = await renderRegisterForm();

  await submit({ username: "", password: "", passwordConfirmation: "" });

  await expect
    .element(fields.username)
    .toHaveAccessibleDescription(
      "Use 3 to 32 letters, digits, or underscores.",
    );
  await expect
    .element(fields.password)
    .toHaveAccessibleDescription("Use at least 8 characters.");
  expect(onSuccess).not.toHaveBeenCalled();
});

test("rejects usernames with characters other than letters, digits, or underscores", async () => {
  const { fields, submit } = await renderRegisterForm();

  await submit({
    username: "alice!",
    password: "correct horse",
    passwordConfirmation: "correct horse",
  });

  await expect
    .element(fields.username)
    .toHaveAccessibleDescription(
      "Use 3 to 32 letters, digits, or underscores.",
    );
});

test("counts password length in characters rather than UTF-16 code units", async () => {
  const { fields, submit } = await renderRegisterForm();
  const password = "😀".repeat(7);

  await submit({
    username: "alice",
    password,
    passwordConfirmation: password,
  });

  await expect
    .element(fields.password)
    .toHaveAccessibleDescription("Use at least 8 characters.");
});

test("rejects passwords longer than 72 bytes", async () => {
  const { fields, submit } = await renderRegisterForm();
  const password = "€".repeat(25);

  await submit({
    username: "alice",
    password,
    passwordConfirmation: password,
  });

  await expect
    .element(fields.password)
    .toHaveAccessibleDescription("Use at most 72 bytes.");
});

test("rechecks the confirmation when the password changes", async () => {
  const { fields, submit } = await renderRegisterForm();

  await submit({
    username: "alice",
    password: "correct horse",
    passwordConfirmation: "correct horses",
  });

  await expect
    .element(fields.passwordConfirmation)
    .toHaveAccessibleDescription("Passwords don't match.");

  await fields.password.fill("correct horses");

  await expect
    .element(fields.passwordConfirmation)
    .not.toHaveAccessibleDescription("Passwords don't match.");
});

test("signs up without sending the confirmation and stores the token", async () => {
  let body: unknown;
  worker.use(
    http.post("*/rpc/signup", async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ token: "access-token" }, { status: 201 });
    }),
  );
  const { onSuccess, submit } = await renderRegisterForm();

  await submit({
    username: "alice",
    password: "correct horse",
    passwordConfirmation: "correct horse",
  });

  await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(body).toEqual({ username: "alice", password: "correct horse" });
  expect(localStorage.getItem("token")).toBe("access-token");
});

test("shows a taken username under the username field", async () => {
  worker.use(
    http.post("*/rpc/signup", () =>
      HttpResponse.json(
        {
          code: "PT409",
          message: "Username is already taken",
          details: null,
          hint: null,
        },
        { status: 409 },
      ),
    ),
  );
  const { fields, onSuccess, submit } = await renderRegisterForm();

  await submit({
    username: "alice",
    password: "correct horse",
    passwordConfirmation: "correct horse",
  });

  await expect
    .element(fields.username)
    .toHaveAccessibleDescription("Username is already taken");
  expect(onSuccess).not.toHaveBeenCalled();
});

test("shows the server hint under the password field when the server rejects the password", async () => {
  worker.use(
    http.post("*/rpc/signup", () =>
      HttpResponse.json(
        {
          code: "PT400",
          message: "Invalid password",
          details: null,
          hint: "Use at least 8 characters and at most 72 bytes.",
        },
        { status: 400 },
      ),
    ),
  );
  const { fields, submit } = await renderRegisterForm();

  await submit({
    username: "alice",
    password: "correct horse",
    passwordConfirmation: "correct horse",
  });

  await expect
    .element(fields.password)
    .toHaveAccessibleDescription(
      "Use at least 8 characters and at most 72 bytes.",
    );
});

test("hands unexpected server errors to the error boundary", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  worker.use(
    http.post("*/rpc/signup", () =>
      HttpResponse.json(
        { code: "XX000", message: "Internal error", details: null, hint: null },
        { status: 500 },
      ),
    ),
  );
  const { screen, submit } = await renderRegisterForm();

  await submit({
    username: "alice",
    password: "correct horse",
    passwordConfirmation: "correct horse",
  });

  await expect.element(screen.getByText("Something went wrong")).toBeVisible();
});

test("disables the submit button while signing up", async () => {
  let respond = () => {};
  const responded = new Promise<void>((resolve) => {
    respond = resolve;
  });
  worker.use(
    http.post("*/rpc/signup", async () => {
      await responded;
      return HttpResponse.json({ token: "access-token" }, { status: 201 });
    }),
  );
  const { screen, submit } = await renderRegisterForm();
  const button = screen.getByRole("button", { name: "Sign up" });

  await submit({
    username: "alice",
    password: "correct horse",
    passwordConfirmation: "correct horse",
  });

  await expect.element(button).toBeDisabled();
  respond();
  await expect.element(button).toBeEnabled();
});

test("links to the sign-in page", async () => {
  const { screen } = await renderRegisterForm();

  await expect
    .element(screen.getByRole("link", { name: "Sign in" }))
    .toHaveAttribute("href", "/sign-in");
});
