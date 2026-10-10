"use client";

import { Button } from "./button";
import { Dialog } from "./dialog";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  /** Acción delicada (rechazar, cancelar): el botón va en rojo. */
  danger?: boolean;
};

/** Confirmación antes de ejecutar una acción del panel. */
export function ConfirmDialog({
  open,
  options,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={options.title} description={options.description}>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant={options.danger ? "danger" : "primary"} onClick={onConfirm} autoFocus>
          {options.confirmLabel ?? "Confirmar"}
        </Button>
      </div>
    </Dialog>
  );
}
