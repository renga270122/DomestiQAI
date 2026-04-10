import { useId } from "react";

type BrandLockupProps = {
  kicker: string;
  title: string;
  tagline: string;
  compact?: boolean;
  className?: string;
};

type BrandMarkProps = {
  className?: string;
};

function BrandMark({ className }: BrandMarkProps) {
  const gradientId = useId();

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={gradientId} x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F5DB5" />
          <stop offset="1" stopColor="#FF9D2E" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="18" fill={`url(#${gradientId})`} />
      <path
        d="M24 25.5C24 20.8 27.8 17 32.5 17H40C42.8 17 45 19.2 45 22V29.5C45 34.2 41.2 38 36.5 38H29C26.2 38 24 35.8 24 33V25.5Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M20 36.5C20 33.5 22.5 31 25.5 31H33C34.9 31 36.5 32.6 36.5 34.5V42C36.5 45 34 47.5 31 47.5H23.5C21.6 47.5 20 45.9 20 44V36.5Z"
        fill="#143048"
        fillOpacity="0.9"
      />
      <path
        d="M41.5 20L42.8 23.2L46 24.5L42.8 25.8L41.5 29L40.2 25.8L37 24.5L40.2 23.2L41.5 20Z"
        fill="#FFF4DE"
      />
    </svg>
  );
}

export function BrandLockup({ kicker, title, tagline, compact = false, className }: BrandLockupProps) {
  const classes = ["brand-lockup", compact ? "brand-lockup--compact" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <BrandMark className="brand-lockup__mark" />
      <div className="brand-lockup__copy">
        <span className="brand-lockup__kicker">{kicker}</span>
        <strong className="brand-lockup__title">{title}</strong>
        <p className="brand-lockup__tagline">{tagline}</p>
      </div>
    </div>
  );
}