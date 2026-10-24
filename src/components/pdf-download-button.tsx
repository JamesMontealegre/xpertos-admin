"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Descarga el PDF de un documento firmable, generado en el servidor con sus firmas (función contract-pdf): el
 * contrato (firma de Xpertos y la manuscrita del cliente) o el acta de inicio (cliente y experto).
 */
export function PdfDownloadButton({
  body,
  label,
  variant = "primary",
}: {
  body: { contract_id: string } | { start_act_id: string };
  label: string;
  variant?: ButtonVariant;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: invokeError } = await createClient().functions.invoke("contract-pdf", { body });
      if (invokeError) throw new Error("No se pudo generar el PDF.");
      const { filename, base64 } = data as { filename: string; base64: string };
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-red-700">{error}</span>}
      <Button size="sm" variant={variant} onClick={download} disabled={loading}>
        {loading ? "Generando…" : label}
      </Button>
    </span>
  );
}

/** Firma manuscrita guardada (path SVG en su lienzo). */
export function SignatureSvg({ path, width, height }: { path: string; width: number; height: number }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-auto max-w-[220px]" role="img" aria-label="Firma">
      <path d={path} fill="none" stroke="#16193A" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
