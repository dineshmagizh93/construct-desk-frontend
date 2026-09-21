/** ConstructDesk's icon mark — a simple isometric block. Uses currentColor at varying
 * opacities for the three faces so it drops cleanly into any existing icon badge. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3 L20 7.5 L12 12 L4 7.5 Z" fill="currentColor" />
      <path d="M4 7.5 L12 12 L12 21 L4 16.5 Z" fill="currentColor" opacity="0.55" />
      <path d="M20 7.5 L12 12 L12 21 L20 16.5 Z" fill="currentColor" opacity="0.8" />
    </svg>
  )
}
