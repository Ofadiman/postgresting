import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useNavigate } from "react-router";

import { SignInForm } from "~/components/SignInForm/SignInForm";
import type { Route } from "./+types/sign-in";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign in" }];
}

export default function SignIn() {
  const navigate = useNavigate();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <SignInForm onSuccess={() => navigate("/")} />
        </CardContent>
      </Card>
    </Box>
  );
}
