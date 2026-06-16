"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSettlement, type SettlementRecord } from "@/lib/tax/settlements";
import { moneyStr } from "@/lib/tax/calculations";

export default function RecordCard({ record }: { record: SettlementRecord }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(`"${record.title}" 기록을 삭제하시겠습니까?`)) return;
    await deleteSettlement(record.id);
    router.refresh();
  }

  return (
    <div className="record-card">
      <div className="record-card-main">
        <Link href={`/records/${record.id}`} className="record-card-title">
          {record.title}
        </Link>
        <span className="record-card-year">{record.tax_year}년</span>
      </div>
      <div className="record-card-diff">
        총 환급(△)/납부: <strong>{moneyStr(record.result.totalDiff)}원</strong>
      </div>
      <div className="record-card-actions">
        <Link href={`/records/${record.id}`}>상세보기</Link>
        <button onClick={handleDelete}>삭제</button>
      </div>
    </div>
  );
}
