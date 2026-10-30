import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { api } from "~/api";
import { signInFormSchema } from "./SignInForm.schema";
import type { LoginArgs, SignInFormProps } from "./SignInForm.types";
import { toFormError } from "./SignInForm.utils";

export function useSignInForm({ onSuccess }: SignInFormProps) {
  const form = useForm({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { username: "", password: "" },
  });
  const login = useMutation({
    mutationFn: async (args: LoginArgs) => {
      const { data } = await api.rpc("login", args).single().throwOnError();
      return data;
    },
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      onSuccess();
    },
    onError: (error) => {
      const formError = toFormError(error);
      if (formError) {
        form.setError("root", { type: "server", message: formError.message });
      }
    },
    throwOnError: (error) => toFormError(error) === null,
  });
  const onSubmit = form.handleSubmit((values) => login.mutate(values));

  return { form, isPending: login.isPending, onSubmit };
}
