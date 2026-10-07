"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/actions";
import { Alert } from "./alert";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { cn } from "./cn";

export type FormAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

export function ActionForm({
  action,
  children,
  className,
  onSuccess,
  showSuccess = true,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  showSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);

  useEffect(() => {
    if (state?.ok) onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      {children}
      {state && !state.ok && <Alert tone="error">{state.message}</Alert>}
      {showSuccess && state?.ok && state.message && <Alert tone="success">{state.message}</Alert>}
    </form>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  variant = "primary",
  size = "md",
  className,
  disabled,
  title,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  title?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || pending}
      title={title}
      name={name}
      value={value}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

/** Botón que ejecuta una Server Action con campos ocultos; muestra el error debajo. */
export function ActionButton({
  action,
  fields,
  children,
  variant = "secondary",
  size = "sm",
  disabled,
  title,
  pendingLabel,
  className,
}: {
  action: FormAction;
  fields: Record<string, string>;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  title?: string;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <ActionForm action={action} className={cn("inline-block space-y-2", className)} showSuccess={false}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} size={size} disabled={disabled} title={title} pendingLabel={pendingLabel ?? "Procesando…"}>
        {children}
      </SubmitButton>
    </ActionForm>
  );
}
