import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { href, useNavigate } from "react-router";

import { RegisterForm } from "~/components/RegisterForm/RegisterForm";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Register" }];
}

export default function Register() {
  const navigate = useNavigate();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <RegisterForm onSuccess={() => navigate(href("/"))} />
        </CardContent>
      </Card>
    </Box>
  );
}
