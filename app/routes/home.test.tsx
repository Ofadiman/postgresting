import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import Home from "./home";

test("signs out by removing the token and returning to sign-in", async () => {
  localStorage.setItem("token", "access-token");
  const Stub = createRoutesStub([
    { path: "/", Component: Home },
    { path: "/sign-in", Component: () => <p>Sign-in page</p> },
  ]);
  const screen = await render(<Stub />);

  await screen.getByRole("button", { name: "Sign out" }).click();

  await expect.element(screen.getByText("Sign-in page")).toBeVisible();
  expect(localStorage.getItem("token")).toBeNull();
});
