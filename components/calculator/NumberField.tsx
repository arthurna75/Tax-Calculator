"use client";

interface Props {
  code: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}

export default function NumberField({ code, label, value, onChange, hint }: Props) {
  return (
    <div className="field">
      <label>
        <span className="code-badge">{code}</span> {label}
        {hint && <span className="field-hint">{hint}</span>}
      </label>
      <input
        type="number"
        min={0}
        value={value || ""}
        placeholder="0"
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}
