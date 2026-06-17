"use client";

import { useState } from "react";
import { getSettlements, type SettlementRecord } from "@/lib/tax/settlements";
import { createClient } from "@/lib/supabase/client";
import type { SettlementInput } from "@/lib/tax/calculations";

interface Props {
  onLoaded: (input: SettlementInput) => void;
  onAuthRequired: () => void;
}

export default function LoadRecordModal({ onLoaded, onAuthRequired }: Props) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { onAuthRequired(); return; }

    setLoading(true);
    try {
      const data = await getSettlements();
      setRecords(data);
      setOpen(true);
    } catch {
      alert("기록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(record: SettlementRecord) {
    onLoaded(record.data);
    setOpen(false);
  }

  return (
    <>
      <button className="load-record-btn" onClick={handleOpen} disabled={loading}>
        {loading ? "불러오는 중..." : "내 기록 불러오기"}
      </button>

      {open && (
        <div className="record-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="record-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="record-modal-header">
              <h3>내 기록 불러오기</h3>
              <button className="record-modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            {records.length === 0 ? (
              <p className="record-modal-empty">저장된 기록이 없습니다.</p>
            ) : (
              <ul className="record-modal-list">
                {records.map((r) => (
                  <li key={r.id} className="record-modal-item" onClick={() => handleSelect(r)}>
                    <span className="record-modal-title">{r.title}</span>
                    <span className="record-modal-meta">
                      {r.tax_year}년 · {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
