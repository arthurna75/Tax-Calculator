"use client";

import type { SettlementInput, SettlementResult } from "@/lib/tax/calculations";
import NumberField from "./NumberField";
import ReadOnlyField from "./ReadOnlyField";

interface Props {
  input: SettlementInput;
  result: SettlementResult;
  onChange: (patch: Partial<SettlementInput>) => void;
}

// 대상금액 → 세액공제금액 쌍을 한 행으로 보여주는 헬퍼
function CreditPair({
  baseCode, baseLabel, baseValue, onBaseChange,
  creditCode, creditLabel, creditValue,
  hint,
}: {
  baseCode: string; baseLabel: string; baseValue: number; onBaseChange: (v: number) => void;
  creditCode: string; creditLabel: string; creditValue: number;
  hint?: string;
}) {
  return (
    <div className="credit-pair">
      <div className="credit-pair-base">
        <NumberField code={baseCode} label={baseLabel} value={baseValue} onChange={onBaseChange} hint={hint} />
      </div>
      <div className="credit-pair-arrow">→</div>
      <div className="credit-pair-result">
        <ReadOnlyField code={creditCode} label={creditLabel} value={creditValue} highlight />
      </div>
    </div>
  );
}

export default function CreditForm({ input, result, onChange }: Props) {
  return (
    <section className="form-section">
      <h2>3. 세액공제 입력</h2>

      <ReadOnlyField code="G304" label="근로소득세액공제 (자동계산)" value={result.laborCredit} />

      <h3>자녀세액공제</h3>
      <NumberField
        code="G312"
        label="자녀세액공제 (1명 15만, 2명 35만, 3명~ 1인당 30만 추가)"
        value={input.G312}
        onChange={(v) => onChange({ G312: v })}
      />

      <h3>보험료·의료비·교육비·기부금</h3>
      <CreditPair
        baseCode="G113" baseLabel="보장성보험 납입액"
        baseValue={input.G113} onBaseChange={(v) => onChange({ G113: v })}
        creditCode="G317" creditLabel="보장성보험 세액공제 (납입액×12%, 한도 12만)"
        creditValue={result.insCredit}
        hint="납입액 한도 100만원 · 공제율 12%"
      />
      <CreditPair
        baseCode="medBase" baseLabel="의료비 지출액"
        baseValue={input.medBase} onBaseChange={(v) => onChange({ medBase: v })}
        creditCode="G318" creditLabel="의료비 세액공제 ((지출액 - 총급여×3%)×15%)"
        creditValue={result.medCredit}
        hint="총급여의 3% 초과분부터 적용"
      />
      <CreditPair
        baseCode="eduBase" baseLabel="교육비 지출액"
        baseValue={input.eduBase} onBaseChange={(v) => onChange({ eduBase: v })}
        creditCode="G319" creditLabel="교육비 세액공제 (지출액×15%)"
        creditValue={result.eduCredit}
        hint="본인 전액, 부양가족 1인당 한도 있음"
      />
      <CreditPair
        baseCode="donBase" baseLabel="기부금 지출액"
        baseValue={input.donBase} onBaseChange={(v) => onChange({ donBase: v })}
        creditCode="G322" creditLabel="기부금 세액공제 (1천만 이하 15%, 초과 30%)"
        creditValue={result.donCredit}
      />

      <h3>연금·퇴직연금</h3>
      <CreditPair
        baseCode="penBase" baseLabel="연금저축 납입액"
        baseValue={input.penBase} onBaseChange={(v) => onChange({ penBase: v })}
        creditCode="G316" creditLabel="연금저축 세액공제 (총급여 5,500만 이하 15%, 초과 12%)"
        creditValue={result.penCredit}
        hint="납입액 한도 600만원, 퇴직연금 합산 900만원"
      />
      <CreditPair
        baseCode="retBase" baseLabel="퇴직연금(DC) 추가납입액"
        baseValue={input.retBase} onBaseChange={(v) => onChange({ retBase: v })}
        creditCode="G315" creditLabel="퇴직연금 세액공제 (연금저축과 합산 900만 한도)"
        creditValue={result.retCredit}
        hint="연금저축과 합산 900만원 한도"
      />

      <ReadOnlyField code="G309" label="세액공제 합계 (자동계산)" value={result.totalCredit} highlight />

      <h3>기납부세액</h3>
      <NumberField code="G907" label="기납부 소득세" value={input.G907} onChange={(v) => onChange({ G907: v })} />
      <NumberField code="G908" label="기납부 지방소득세" value={input.G908} onChange={(v) => onChange({ G908: v })} />
    </section>
  );
}
