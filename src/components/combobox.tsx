"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export function Combobox({ name, value, onChange, options, required, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // If the current value doesn't match any preset (a custom value someone
  // typed before, or the field is empty), fall back to the full list rather
  // than showing nothing - the dropdown should always have something to show.
  const matches = options.filter((o) => o.toLowerCase().includes(value.toLowerCase()));
  const suggestions = matches.length > 0 ? matches : options;

  return (
    <div className="relative" ref={ref}>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        className={`${className ?? ""} pr-9`}
      />
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gold-light bg-white shadow-lg">
          {suggestions.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-ivory"
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
