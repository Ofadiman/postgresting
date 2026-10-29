import type { Database } from "~/database.types";

export type RegisterFormProps = {
  onSuccess: () => void;
};

export type SignupArgs = Database["api"]["Functions"]["signup"]["Args"];
