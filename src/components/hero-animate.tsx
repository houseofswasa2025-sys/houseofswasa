// CSS-only hero entrance (see .reveal / .reveal-pop in globals.css), so the
// hero is visible on first paint rather than after hydration.

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export function HeroLogo({ children }: { children: React.ReactNode }) {
  return (
    <div className="reveal-pop mx-auto w-fit">
      <div className="animate-float">{children}</div>
    </div>
  );
}

export function HeroStagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const style: CSSVars = { "--stagger": "0.12s" };
  return (
    <div className={`reveal-group ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

export function HeroItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
