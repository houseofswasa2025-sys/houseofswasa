"use client";

import { useState } from "react";

type Props = {
  name?: string;
  presets: string[];
  value: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
  addPlaceholder?: string;
};

export function ChipGroup({ name, presets, value, onChange, multi = true, addPlaceholder = "Add new..." }: Props) {
  const [input, setInput] = useState("");
  const allOptions = [...presets, ...value.filter((v) => !presets.includes(v))];

  function toggle(opt: string) {
    if (multi) {
      onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    } else {
      onChange(value[0] === opt ? [] : [opt]);
    }
  }

  function addCustom() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (multi) {
      if (!value.includes(trimmed)) onChange([...value, trimmed]);
    } else {
      onChange([trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      {name && value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <div className="flex flex-wrap gap-2">
        {allOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              value.includes(opt)
                ? "border-maroon bg-maroon text-white"
                : "border-gold-light text-foreground/70 hover:border-maroon"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={addPlaceholder}
          className="w-full max-w-xs rounded-lg border border-gold-light px-3 py-1.5 text-xs outline-none focus:border-maroon"
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-lg border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon/5"
        >
          Add
        </button>
      </div>
    </div>
  );
}
