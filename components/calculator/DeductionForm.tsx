"use client";

import type { SettlementInput, SettlementResult } from "@/lib/tax/calculations";
import NumberField from "./NumberField";
import ReadOnlyField from "./ReadOnlyField";

interface Props {
  input: SettlementInput;
  result: SettlementResult;
  onChange: (patch: Partial<SettlementInput>) => void;
}

export default function DeductionForm({ input, result, onChange }: Props) {
  const socialInsTotal = result.pension + result.insurDed;
  const etcTotal = result.venture + result.smallbiz + result.mtgInt;

  return (
    <section className="form-section">
      <h2>2. 소득공제 입력</h2>

      <h3>인적공제</h3>
      <ReadOnlyField code="G002" label="본인공제" value={result.selfDed} />
      <NumberField code="G004" label="부양가족 공제액" value={input.G004} onChange={(v) => onChange({ G004: v })} />
      <NumberField code="G007" label="경로우대 추가공제" value={input.G007} onChange={(v) => onChange({ G007: v })} />
      <NumberField code="G008" label="장애인 추가공제" value={input.G008} onChange={(v) => onChange({ G008: v })} />
      <NumberField code="G009" label="부녀자공제" value={input.G009} onChange={(v) => onChange({ G009: v })} />
      <NumberField code="G010" label="한부모 추가공제" value={input.G010} onChange={(v) => onChange({ G010: v })} />
      <ReadOnlyField code="G014" label="인적공제 합계 (자동계산)" value={result.personalDed} highlight />

      <h3>사회보험료공제</h3>
      <NumberField code="G015" label="국민연금보험료" value={input.G015} onChange={(v) => onChange({ G015: v })} />
      <NumberField code="G111" label="건강보험료" value={input.G111} onChange={(v) => onChange({ G111: v })} />
      <NumberField code="G154" label="장기요양보험료" value={input.G154} onChange={(v) => onChange({ G154: v })} />
      <NumberField code="G112" label="고용보험료" value={input.G112} onChange={(v) => onChange({ G112: v })} />
      <ReadOnlyField code="G136" label="사회보험료공제 합계 (자동계산)" value={socialInsTotal} highlight />

      <h3>신용카드 등 사용액</h3>
      <NumberField code="G223" label="신용카드 사용액" value={input.G223} onChange={(v) => onChange({ G223: v })} />
      <NumberField code="G205" label="현금영수증 사용액" value={input.G205} onChange={(v) => onChange({ G205: v })} />
      <NumberField code="G222" label="직불·체크카드 사용액" value={input.G222} onChange={(v) => onChange({ G222: v })} />
      <NumberField code="G257" label="도서·공연·문화 신용카드" value={input.G257} onChange={(v) => onChange({ G257: v })} />
      <NumberField code="G228" label="전통시장 사용액" value={input.G228} onChange={(v) => onChange({ G228: v })} />
      <NumberField code="G240" label="대중교통 사용액" value={input.G240} onChange={(v) => onChange({ G240: v })} />
      <ReadOnlyField code="G225" label="신용카드 공제액 합계 (자동계산)" value={result.card.total} highlight />

      <h3>기타 소득공제</h3>
      <NumberField code="G218" label="벤처투자조합 출자공제" value={input.G218} onChange={(v) => onChange({ G218: v })} />
      <NumberField code="G219" label="소기업·소상공인 공제부금" value={input.G219} onChange={(v) => onChange({ G219: v })} />
      <NumberField code="G115" label="장기주택저당차입금 이자상환액" value={input.G115} onChange={(v) => onChange({ G115: v })} />
      <ReadOnlyField code="G210" label="기타소득공제 합계 (자동계산)" value={etcTotal} highlight />

      <ReadOnlyField code="G211" label="과세표준 (자동계산)" value={result.taxBase} highlight />
    </section>
  );
}
