import { useQueryClient } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createRoutesStub } from "react-router";
import { expect, onTestFinished, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import App, { ErrorBoundary, Layout } from "./root";

function renderErrorBoundary(error: unknown) {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => null,
      ErrorBoundary,
      HydrateFallback: () => null,
      loader: () => {
        throw error;
      },
    },
  ]);

  return render(<Stub />);
}

test("renders the page inside an English document with the route's title", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const doc = document.implementation.createHTMLDocument();
  const root = createRoot(doc);
  onTestFinished(() => root.unmount());
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <Layout>
          <p>Page content</p>
        </Layout>
      ),
      meta: () => [{ title: "Page title" }],
    },
  ]);

  flushSync(() => root.render(<Stub />));

  expect(doc.documentElement.lang).toBe("en");
  expect(doc.title).toBe("Page title");
  expect(doc.body.textContent).toContain("Page content");
});

test("gives routes access to a query client", async () => {
  function Child() {
    useQueryClient();
    return <p>Route content</p>;
  }
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: App,
      children: [{ index: true, Component: Child }],
    },
  ]);

  const screen = await render(<Stub />);

  await expect.element(screen.getByText("Route content")).toBeVisible();
});

test("explains that a page does not exist", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const Stub = createRoutesStub([{ path: "/", ErrorBoundary }]);

  const screen = await render(<Stub initialEntries={["/missing"]} />);

  await expect
    .element(screen.getByRole("heading", { name: "404" }))
    .toBeVisible();
  await expect
    .element(screen.getByText("The requested page could not be found."))
    .toBeVisible();
});

test("shows the status text of other error responses", async () => {
  const screen = await renderErrorBoundary(
    new Response(null, { status: 503, statusText: "Service Unavailable" }),
  );

  await expect
    .element(screen.getByRole("heading", { name: "Error" }))
    .toBeVisible();
  await expect.element(screen.getByText("Service Unavailable")).toBeVisible();
});

test("falls back to a generic message for error responses without status text", async () => {
  const screen = await renderErrorBoundary(new Response(null, { status: 500 }));

  await expect
    .element(screen.getByRole("heading", { name: "Error" }))
    .toBeVisible();
  await expect
    .element(screen.getByText("An unexpected error occurred."))
    .toBeVisible();
});

test("shows the message and stack of thrown errors in development", async () => {
  const error = new Error("Database is down");

  const screen = await renderErrorBoundary(error);

  await expect
    .element(screen.getByRole("heading", { name: "Oops!" }))
    .toBeVisible();
  await expect.element(screen.getByText("Database is down")).toBeVisible();
  expect(screen.container.querySelector("pre code")?.textContent).toBe(
    error.stack,
  );
});

test("hides the details of thrown errors outside development", async () => {
  vi.stubEnv("DEV", false);

  const screen = await renderErrorBoundary(new Error("Database is down"));

  await expect
    .element(screen.getByText("An unexpected error occurred."))
    .toBeVisible();
  expect(screen.container.textContent).not.toContain("Database is down");
  expect(screen.container.querySelector("pre")).toBeNull();
});

test("shows a generic message for thrown values that are not errors", async () => {
  const screen = await renderErrorBoundary("Database is down");

  await expect
    .element(screen.getByRole("heading", { name: "Oops!" }))
    .toBeVisible();
  await expect
    .element(screen.getByText("An unexpected error occurred."))
    .toBeVisible();
});
