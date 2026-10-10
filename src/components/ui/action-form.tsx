"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/actions";
import { Alert } from "./alert";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { cn } from "./cn";
import { ConfirmDialog, type ConfirmOptions } from "./confirm-dialog";
import { useToast } from "./toaster";

export type FormAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Formulario conectado a una Server Action con el comportamiento estándar del panel:
 * - `confirm`: antes de ejecutar pide confirmación (no hace falta dentro de un ActionDialog, que ya lo es).
 * - Al terminar muestra un aviso de éxito o de error (y el error también debajo del formulario).
 */
export function ActionForm({
  action,
  children,
  className,
  onSuccess,
  showSuccess = true,
  confirm,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  /** Aviso de éxito al terminar (con el mensaje que devuelve la acción). */
  showSuccess?: boolean;
  confirm?: ConfirmOptions;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const [asking, setAsking] = useState<{ submitter: HTMLElement | null } | null>(null);

  // Cada envío devuelve un estado nuevo: un aviso por cada resultado, aunque el mensaje se repita.
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (showSuccess && state.message) toast(state.message, "success");
      onSuccess?.();
    } else {
      toast(state.message, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    // aria-busy: la actualización automática del panel espera a que termine la acción.
    <form
      ref={formRef}
      action={formAction}
      className={cn("space-y-3", className)}
      aria-busy={pending || undefined}
      onSubmit={(event) => {
        if (!confirm || confirmed.current) {
          confirmed.current = false;
          return;
        }
        event.preventDefault();
        setAsking({ submitter: (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null });
      }}
    >
      {children}
      {state && !state.ok && <Alert tone="error">{state.message}</Alert>}
      {confirm && (
        <ConfirmDialog
          open={asking !== null}
          options={confirm}
          onCancel={() => setAsking(null)}
          onConfirm={() => {
            const submitter = asking?.submitter ?? undefined;
            setAsking(null);
            confirmed.current = true;
            formRef.current?.requestSubmit(submitter as HTMLButtonElement | undefined);
          }}
        />
      )}
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

/** Botón que ejecuta una Server Action con campos ocultos: pide confirmación y avisa el resultado. */
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
  confirm,
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
  confirm: ConfirmOptions;
}) {
  return (
    <ActionForm action={action} className={cn("inline-block space-y-2", className)} confirm={confirm}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} size={size} disabled={disabled} title={title} pendingLabel={pendingLabel ?? "Procesando…"}>
        {children}
      </SubmitButton>
    </ActionForm>
  );
}
