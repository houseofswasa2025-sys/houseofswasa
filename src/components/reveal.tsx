// CSS-only entrance animations (see .reveal / .reveal-group in globals.css).
// Kept as plain server components so revealed content is in the painted HTML
// immediately instead of waiting for client JS to hydrate.

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const style: CSSVars | undefined = delay ? { "--reveal-delay": `${delay}s` } : undefined;
  return (
    <div className={`reveal ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const style: CSSVars = { "--stagger": `${stagger}s` };
  return (
    <div className={`reveal-group ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
