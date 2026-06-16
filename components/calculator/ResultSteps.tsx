import type { SettlementResult } from "@/lib/tax/calculations";
import { moneyStr } from "@/lib/tax/calculations";

interface Props {
  result: SettlementResult;
}

function Row({ label, value, final }: { label: string; value: number; final?: boolean }) {
  const color = value < 0 ? "var(--red, #c00000)" : value > 0 ? "var(--blue-dark, #1f4e78)" : undefined;
  return (
    <div className={final ? "result-row result-row-final" : "result-row"}>
      <span>{label}</span>
      <span style={{ color }}>{moneyStr(value)}원</span>
    </div>
  );
}

export default function ResultSteps({ result: r }: Props) {
  return (
    <section className="result-steps">
      <h2>계산 결과</h2>

      <Row label="총급여액 (S030)" value={r.totalSalary} />
      <Row label="근로소득금액 (S301)" value={r.earnedIncome} />
      <Row label="소득공제 합계" value={r.totalDeduction} />
      <Row label="과세표준 (G211)" value={r.taxBase} />
      <Row label="산출세액 (G212)" value={r.calcTax} />
      <Row label="세액공제 합계 (G309)" value={r.totalCredit} />
      <Row label="결정세액 소득세 (G901)" value={r.finalIncomeTax} />
      <Row label="지방소득세 (G902)" value={r.finalLocalTax} />
      <Row label="차감 소득세 (G910)" value={r.diffIncome} final />
      <Row label="차감 지방소득세 (G911)" value={r.diffLocal} final />
      <Row label="총 환급(△)/납부 합계" value={r.totalDiff} final />

      <p className="result-note">
        {r.totalDiff < 0 ? "△ 환급 예상" : r.totalDiff > 0 ? "▼ 추가 납부 예상" : "변동 없음"}
      </p>
    </section>
  );
}
