import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { api } from "~/api";
import { registerFormSchema } from "./RegisterForm.schema";
import type { RegisterFormProps, SignupArgs } from "./RegisterForm.types";
import { toFieldError } from "./RegisterForm.utils";

export function useRegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: "", password: "", passwordConfirmation: "" },
  });
  const signup = useMutation({
    mutationFn: async (args: SignupArgs) => {
      const { data } = await api.rpc("signup", args).single().throwOnError();
      return data;
    },
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      onSuccess();
    },
    onError: (error) => {
      const fieldError = toFieldError(error);
      if (fieldError) {
        form.setError(fieldError.name, {
          type: "server",
          message: fieldError.message,
        });
      }
    },
    throwOnError: (error) => toFieldError(error) === null,
  });
  const onSubmit = form.handleSubmit(({ username, password }) =>
    signup.mutate({ username, password }),
  );

  return { form, isPending: signup.isPending, onSubmit };
}
