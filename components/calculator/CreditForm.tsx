"use client";

import type { SettlementInput, SettlementResult } from "@/lib/tax/calculations";
import NumberField from "./NumberField";
import ReadOnlyField from "./ReadOnlyField";

interface Props {
  input: SettlementInput;
  result: SettlementResult;
  onChange: (patch: Partial<SettlementInput>) => void;
}

export default function CreditForm({ input, result, onChange }: Props) {
  return (
    <section className="form-section">
      <h2>3. 세액공제 입력</h2>
      <ReadOnlyField code="G304" label="근로소득세액공제 (자동계산)" value={result.laborCredit} />
      <NumberField code="G312" label="자녀세액공제" value={input.G312} onChange={(v) => onChange({ G312: v })} />
      <NumberField code="G317" label="보장성보험료 세액공제" value={input.G317} onChange={(v) => onChange({ G317: v })} />
      <NumberField code="G319" label="교육비 세액공제" value={input.G319} onChange={(v) => onChange({ G319: v })} />
      <NumberField code="G322" label="기부금 세액공제" value={input.G322} onChange={(v) => onChange({ G322: v })} />
      <NumberField code="G315" label="퇴직연금(DC형) 세액공제" value={input.G315} onChange={(v) => onChange({ G315: v })} />
      <NumberField code="G316" label="연금저축 세액공제" value={input.G316} onChange={(v) => onChange({ G316: v })} />
      <NumberField code="G318" label="의료비 세액공제" value={input.G318} onChange={(v) => onChange({ G318: v })} />
      <ReadOnlyField code="G309" label="세액공제 합계 (자동계산)" value={result.totalCredit} highlight />

      <h3>기납부세액</h3>
      <NumberField code="G907" label="기납부 소득세" value={input.G907} onChange={(v) => onChange({ G907: v })} />
      <NumberField code="G908" label="기납부 지방소득세" value={input.G908} onChange={(v) => onChange({ G908: v })} />
    </section>
  );
}
