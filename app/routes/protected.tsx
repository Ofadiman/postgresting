import { decodeJwt } from "jose";
import { href, Outlet, redirect } from "react-router";

function isTokenValid(token: string | null) {
  if (!token) return false;
  try {
    const { exp } = decodeJwt(token);
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function clientLoader() {
  if (!isTokenValid(localStorage.getItem("token"))) {
    throw redirect(href("/sign-in"));
  }
}

export default function Protected() {
  return <Outlet />;
}
