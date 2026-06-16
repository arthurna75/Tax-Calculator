"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSettlement, deleteSettlement } from "@/lib/tax/settlements";
import { downloadSettlementExcel } from "@/lib/tax/excelExport";
import type { SettlementRecord } from "@/lib/tax/settlements";

export default function RecordDetailActions({ record }: { record: SettlementRecord }) {
  const router = useRouter();
  const [title, setTitle] = useState(record.title);
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    if (title === record.title) return;
    setSaving(true);
    await updateSettlement(record.id, { title });
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("이 기록을 삭제하시겠습니까?")) return;
    await deleteSettlement(record.id);
    router.push("/records");
  }

  return (
    <div className="record-detail-actions">
      <label className="record-title-edit">
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleRename} disabled={saving} />
      </label>
      <button onClick={() => downloadSettlementExcel(record.result)}>Excel 다운로드 (9시트)</button>
      <button onClick={handleDelete} className="record-delete-btn">기록 삭제</button>
    </div>
  );
}
