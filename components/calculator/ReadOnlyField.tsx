interface Props {
  code: string;
  label: string;
  value: number;
  highlight?: boolean;
}

export default function ReadOnlyField({ code, label, value, highlight }: Props) {
  return (
    <div className="field">
      <label style={highlight ? { color: "var(--blue-dark)", fontWeight: 700 } : undefined}>
        <span className="code-badge">{code}</span> {label}
      </label>
      <input type="text" readOnly value={value.toLocaleString()} />
    </div>
  );
}
