"use client";

import { Button } from "@/components/ui/button";

/** Abre el diálogo de impresión del navegador, donde se elige "Guardar como PDF". */
export function PrintButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button onClick={() => window.print()} disabled={disabled} title={disabled ? "El contrato de inicio se habilita al confirmar el pago" : undefined}>
      Descargar PDF
    </Button>
  );
}
