"use client";

import { cn } from "./cn";
import { fieldClasses } from "./input";

const cop = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/**
 * Campo de moneda (COP): muestra el valor con separador de miles mientras se escribe ("2.500.000") y
 * envía en el formulario solo los dígitos (input oculto con `name`).
 */
export function MoneyInput({
  id,
  name,
  value,
  onChange,
  placeholder = "0",
  required,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  name: string;
  /** Solo dígitos ("2500000") o vacío. */
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const shown = value ? cop.format(Number(value)) : "";
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        className={cn(fieldClasses, "pl-7 tabular-nums")}
        value={shown}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
