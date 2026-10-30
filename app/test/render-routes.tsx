import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoutesStub, Meta, Outlet } from "react-router";
import { render } from "vitest-browser-react";

export function renderRoutes(
  routes: Parameters<typeof createRoutesStub>[0],
  initialPath: string,
) {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <>
          <Meta />
          <Outlet />
        </>
      ),
      children: routes,
    },
  ]);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Stub initialEntries={[initialPath]} />
    </QueryClientProvider>,
  );
}
