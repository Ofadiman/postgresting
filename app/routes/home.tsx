import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Postgresting" }];
}

export default function Home() {
  return (
    <Container component="main" sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Typography component="h1" variant="h4">
          Postgresting
        </Typography>
        <Button component={Link} to="/register" variant="contained">
          Sign up
        </Button>
      </Stack>
    </Container>
  );
}
