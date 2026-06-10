export function AudioIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      className="icon-button__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h3.8L13 18V6L7.8 10H4z" />
      {muted ? (
        <path d="M16 8l4 8M20 8l-4 8" />
      ) : (
        <>
          <path d="M16.5 9.5a4.5 4.5 0 0 1 0 5" />
          <path d="M19 7a8 8 0 0 1 0 10" />
        </>
      )}
    </svg>
  );
}
