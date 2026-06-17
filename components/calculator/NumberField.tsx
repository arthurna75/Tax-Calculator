"use client";

import { useState } from "react";

interface Props {
  code: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}

export default function NumberField({ code, label, value, onChange, hint }: Props) {
  const [focused, setFocused] = useState(false);

  const displayValue = focused
    ? (value === 0 ? "" : String(value))
    : (value === 0 ? "" : value.toLocaleString("ko-KR"));

  return (
    <div className="field">
      <label>
        <span className="code-badge">{code}</span> {label}
        {hint && <span className="field-hint">{hint}</span>}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder="0"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "");
          onChange(parseInt(digits, 10) || 0);
        }}
      />
    </div>
  );
}
