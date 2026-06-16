import Link from "next/link";
import { getSettlements } from "@/lib/tax/settlements";
import RecordList from "@/components/records/RecordList";

export default async function RecordsPage() {
  const records = await getSettlements();

  return (
    <div className="records-page">
      <div className="records-header">
        <h1>내 연말정산 기록</h1>
        <Link href="/calculator" className="records-new-link">+ 계산기에서 새로 계산하기</Link>
      </div>
      <RecordList records={records} />
    </div>
  );
}
