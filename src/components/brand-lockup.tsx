import Image from "next/image";

type BrandLockupProps = {
  kicker: string;
  title: string;
  tagline: string;
  compact?: boolean;
  className?: string;
};

export function BrandLockup({ kicker, title, tagline, compact = false, className }: BrandLockupProps) {
  const classes = ["brand-lockup", compact ? "brand-lockup--compact" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const altText = `${title}. ${tagline}`;

  return (
    <div className={classes} aria-label={`${kicker}. ${altText}`}>
      <Image
        className="brand-lockup__logo"
        src="/branding/domestiq-logo.svg"
        alt={altText}
        width={900}
        height={360}
        priority
      />
      <span className="brand-lockup__sr-only">{kicker}</span>
    </div>
  );
}