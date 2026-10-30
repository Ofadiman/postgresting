import { expect, test } from "vitest";

import { renderRoutes } from "~/test/render-routes";
import type { Route } from "./+types/home";
import Home, { meta } from "./home";

function renderHomeRoute() {
  return renderRoutes(
    [
      {
        path: "/",
        Component: Home,
        meta: (args) => meta(args as Route.MetaArgs),
      },
      { path: "/sign-in", Component: () => <p>Sign-in page</p> },
    ],
    "/",
  );
}

test("titles the page", async () => {
  await renderHomeRoute();

  await expect.poll(() => document.title).toBe("Postgresting");
});

test("signs out by removing the token and returning to sign-in", async () => {
  localStorage.setItem("token", "access-token");
  const screen = await renderHomeRoute();

  await screen.getByRole("button", { name: "Sign out" }).click();

  await expect.element(screen.getByText("Sign-in page")).toBeVisible();
  expect(localStorage.getItem("token")).toBeNull();
});
