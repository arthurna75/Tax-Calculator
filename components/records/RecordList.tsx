import type { SettlementRecord } from "@/lib/tax/settlements";
import RecordCard from "./RecordCard";

export default function RecordList({ records }: { records: SettlementRecord[] }) {
  if (records.length === 0) {
    return <p className="record-empty">저장된 연말정산 기록이 없습니다. 계산기에서 계산 후 저장해보세요.</p>;
  }

  return (
    <div className="record-list">
      {records.map((r) => (
        <RecordCard key={r.id} record={r} />
      ))}
    </div>
  );
}
