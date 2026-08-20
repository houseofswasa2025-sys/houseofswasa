"use client";

import { useState } from "react";

const POPULAR_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

type Props = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
};

export function EmailInput({ id, name, value, onChange, required, className }: Props) {
  const [open, setOpen] = useState(false);

  const atIndex = value.indexOf("@");
  const local = atIndex === -1 ? value : value.slice(0, atIndex);
  const domainQuery = atIndex === -1 ? "" : value.slice(atIndex + 1);

  const suggestions =
    local.length === 0
      ? []
      : atIndex === -1
        ? POPULAR_DOMAINS.map((d) => `${local}@${d}`)
        : POPULAR_DOMAINS.filter((d) => d !== domainQuery && d.startsWith(domainQuery)).map(
            (d) => `${local}@${d}`
          );

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="email"
        required={required}
        autoComplete="email"
        inputMode="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gold-light bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-ivory"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
