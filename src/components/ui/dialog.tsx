"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { ActionForm, SubmitButton, type FormAction } from "./action-form";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,34rem)] rounded-card border border-border bg-white p-0 text-foreground shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}

/** Botón que abre un diálogo con un formulario conectado a una Server Action. */
export function ActionDialog({
  triggerLabel,
  triggerVariant = "secondary",
  triggerSize = "sm",
  title,
  description,
  action,
  fields,
  submitLabel,
  submitVariant = "primary",
  pendingLabel,
  disabled,
  disabledReason,
  children,
}: {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  title: string;
  description?: string;
  action: FormAction;
  fields?: Record<string, string>;
  submitLabel: string;
  submitVariant?: ButtonVariant;
  pendingLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
      >
        {triggerLabel}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description}>
        {open && (
          <ActionForm action={action} onSuccess={() => setOpen(false)} showSuccess={false}>
            {fields &&
              Object.entries(fields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            {children}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton variant={submitVariant} pendingLabel={pendingLabel ?? "Procesando…"}>
                {submitLabel}
              </SubmitButton>
            </div>
          </ActionForm>
        )}
      </Dialog>
    </>
  );
}
