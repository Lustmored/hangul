interface BrandWordmarkProps {
  className?: string;
}

export function BrandWordmark({ className = '' }: BrandWordmarkProps) {
  return (
    <img
      className={`brand-wordmark ${className}`.trim()}
      src="/wordmark.png"
      alt="Hangul Rush"
      width={2172}
      height={724}
      loading="eager"
      decoding="async"
    />
  );
}
