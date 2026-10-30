import { UnsecuredJWT } from "jose";
import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import Protected, { clientLoader } from "./protected";

function renderProtectedRoute() {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Protected,
      loader: clientLoader,
      HydrateFallback: () => null,
      children: [{ index: true, Component: () => <p>Home page</p> }],
    },
    { path: "/sign-in", Component: () => <p>Sign-in page</p> },
  ]);
  return render(<Stub />);
}

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

test("redirects to sign-in when there is no token", async () => {
  const screen = await renderProtectedRoute();

  await expect.element(screen.getByText("Sign-in page")).toBeVisible();
});

test.each([
  {
    scenario: "has expired",
    token: new UnsecuredJWT({}).setExpirationTime(nowInSeconds() - 60).encode(),
  },
  { scenario: "has no expiry", token: new UnsecuredJWT({}).encode() },
  { scenario: "is not a JWT", token: "not-a-jwt" },
])("redirects to sign-in when the token $scenario", async ({ token }) => {
  localStorage.setItem("token", token);

  const screen = await renderProtectedRoute();

  await expect.element(screen.getByText("Sign-in page")).toBeVisible();
});

test("renders the page when the token has not expired", async () => {
  localStorage.setItem(
    "token",
    new UnsecuredJWT({}).setExpirationTime("1h").encode(),
  );

  const screen = await renderProtectedRoute();

  await expect.element(screen.getByText("Home page")).toBeVisible();
});
