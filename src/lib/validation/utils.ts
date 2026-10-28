import type { ActionState } from "@/types/actions";
import type { ZodError } from "zod";

export function fieldErrorsFrom(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

export function validationFailure(error: ZodError): ActionState {
  return {
    ok: false,
    message: "Please correct the highlighted fields and try again.",
    fieldErrors: fieldErrorsFrom(error),
  };
}

export function errorState(message: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { ok: false, message, fieldErrors };
}

export function successState(message: string): ActionState {
  return { ok: true, message };
}

export function firstFieldError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string {
  return errors?.[field]?.[0] ?? "";
}
