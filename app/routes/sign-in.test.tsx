import { http, HttpResponse } from "msw/http";
import { expect, test } from "vitest";

import { renderRoutes } from "~/test/render-routes";
import { worker } from "~/test/worker";
import type { Route } from "./+types/sign-in";
import SignIn, { meta } from "./sign-in";

function renderSignInRoute() {
  return renderRoutes(
    [
      {
        path: "/sign-in",
        Component: SignIn,
        meta: (args) => meta(args as Route.MetaArgs),
      },
      { path: "/", Component: () => <p>Home page</p> },
    ],
    "/sign-in",
  );
}

test("titles the page", async () => {
  await renderSignInRoute();

  await expect.poll(() => document.title).toBe("Sign in");
});

test("goes to the home page after signing in", async () => {
  worker.use(
    http.post("*/rpc/login", () =>
      HttpResponse.json({ token: "access-token" }),
    ),
  );
  const screen = await renderSignInRoute();

  await screen.getByLabelText(/^Username/).fill("alice");
  await screen.getByLabelText(/^Password/).fill("correct horse");
  await screen.getByRole("button", { name: "Sign in" }).click();

  await expect.element(screen.getByText("Home page")).toBeVisible();
});
