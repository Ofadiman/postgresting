import { createCookie } from "react-router";

export const tokenCookie = createCookie("token", {
  httpOnly: true,
  maxAge: 60 * 60,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});
