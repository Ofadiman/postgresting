import type { Database } from "~/database.types";

export type SignInFormProps = {
  onSuccess: () => void;
};

export type LoginArgs = Database["api"]["Functions"]["login"]["Args"];
