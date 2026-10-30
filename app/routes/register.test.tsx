import { http, HttpResponse } from "msw/http";
import { expect, test } from "vitest";

import { renderRoutes } from "~/test/render-routes";
import { worker } from "~/test/worker";
import type { Route } from "./+types/register";
import Register, { meta } from "./register";

function renderRegisterRoute() {
  return renderRoutes(
    [
      {
        path: "/register",
        Component: Register,
        meta: (args) => meta(args as Route.MetaArgs),
      },
      { path: "/", Component: () => <p>Home page</p> },
    ],
    "/register",
  );
}

test("titles the page", async () => {
  await renderRegisterRoute();

  await expect.poll(() => document.title).toBe("Register");
});

test("goes to the home page after signing up", async () => {
  worker.use(
    http.post("*/rpc/signup", () =>
      HttpResponse.json({ token: "access-token" }, { status: 201 }),
    ),
  );
  const screen = await renderRegisterRoute();

  await screen.getByLabelText(/^Username/).fill("alice");
  await screen.getByLabelText(/^Password/).fill("correct horse");
  await screen.getByLabelText(/^Confirm password/).fill("correct horse");
  await screen.getByRole("button", { name: "Sign up" }).click();

  await expect.element(screen.getByText("Home page")).toBeVisible();
});
