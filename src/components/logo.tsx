import Image from "next/image";
const SITE_NAME = "Xpertos";

/** Proporciones (ancho / alto) de los SVG de marca en `public/brand`. */
const RATIO = { horizontal: 4.6194, full: 1214 / 930, mark: 1 } as const;
const SRC = {
  horizontal: "/brand/xpertos-horizontal.svg",
  full: "/brand/xpertos-logo.svg",
  mark: "/brand/xpertos-mark.svg",
} as const;

/**
 * Logo de Xpertos. `horizontal`: casa + XPERTOS (encabezados); `full`: logo completo con el lema
 * "servicios a tu medida"; `mark`: solo la casa.
 */
export function Logo({
  variant = "horizontal",
  height,
  className,
  priority = false,
}: {
  variant?: keyof typeof SRC;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={SRC[variant]}
      alt={variant === "full" ? `${SITE_NAME}, servicios a tu medida` : SITE_NAME}
      width={Math.round(height * RATIO[variant])}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
