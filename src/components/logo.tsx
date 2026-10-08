import Image from "next/image";

const SITE_NAME = "Xpertos";

/**
 * Las dos versiones del logo de Xpertos (SVG en `public/brand`):
 * - `wordmark`: solo XPERTOS, para encabezados y barras.
 * - `full`: logo completo con la casa y el lema "servicios a tu medida".
 * El favicon usa solo la X (`src/app/icon.svg`).
 */
const VARIANTS = {
  wordmark: { src: "/brand/xpertos-wordmark.svg", ratio: 1177 / 255, alt: SITE_NAME },
  full: { src: "/brand/xpertos-logo.svg", ratio: 1214 / 930, alt: `${SITE_NAME}, servicios a tu medida` },
} as const;

export function Logo({
  variant = "wordmark",
  height,
  className,
  priority = false,
}: {
  variant?: keyof typeof VARIANTS;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  const v = VARIANTS[variant];
  return (
    <Image
      src={v.src}
      alt={v.alt}
      width={Math.round(height * v.ratio)}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
