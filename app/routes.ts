import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/protected.tsx", [index("routes/home.tsx")]),
  route("register", "routes/register.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
] satisfies RouteConfig;
