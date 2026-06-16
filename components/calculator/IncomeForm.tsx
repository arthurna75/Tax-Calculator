"use client";

import type { SettlementInput, SettlementResult } from "@/lib/tax/calculations";
import NumberField from "./NumberField";
import ReadOnlyField from "./ReadOnlyField";

interface Props {
  input: SettlementInput;
  result: SettlementResult;
  onChange: (patch: Partial<SettlementInput>) => void;
}

export default function IncomeForm({ input, result, onChange }: Props) {
  return (
    <section className="form-section">
      <h2>1. 소득 입력</h2>
      <NumberField code="S001" label="급여소득" value={input.S001} onChange={(v) => onChange({ S001: v })} />
      <NumberField code="S002" label="상여소득" value={input.S002} onChange={(v) => onChange({ S002: v })} />
      <NumberField code="S013" label="자가운전보조금 비과세" value={input.S013} onChange={(v) => onChange({ S013: v })} />
      <ReadOnlyField code="S030" label="총급여액 (자동계산)" value={result.totalSalary} highlight />
      <ReadOnlyField code="G001" label="근로소득공제 (자동계산)" value={result.laborDed} />
      <ReadOnlyField code="S301" label="근로소득금액 (자동계산)" value={result.earnedIncome} highlight />
    </section>
  );
}
