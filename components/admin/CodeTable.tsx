"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCode, type TaxCode } from "@/lib/tax/codes";
import CodeFormModal from "./CodeFormModal";

export default function CodeTable({ codes }: { codes: TaxCode[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TaxCode | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleDelete(code: TaxCode) {
    if (!window.confirm(`코드 "${code.code}"를 삭제하시겠습니까?`)) return;
    await deleteCode(code.id);
    router.refresh();
  }

  function handleSaved() {
    setEditing(null);
    setCreating(false);
    router.refresh();
  }

  return (
    <div className="code-table-wrap">
      <div className="code-table-header">
        <h1>연말정산 코드 마스터 관리</h1>
        <button onClick={() => setCreating(true)}>+ 코드 추가</button>
      </div>

      <table className="code-table">
        <thead>
          <tr>
            <th>코드</th><th>이름</th><th>분류</th><th>공제율</th><th>한도</th><th>설명</th><th></th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.category}</td>
              <td>{c.rate != null ? `${(c.rate * 100).toFixed(0)}%` : "-"}</td>
              <td>{c.limit_amount != null ? c.limit_amount.toLocaleString() : "-"}</td>
              <td className="code-table-desc">{c.description}</td>
              <td className="code-table-actions">
                <button onClick={() => setEditing(c)}>수정</button>
                <button onClick={() => handleDelete(c)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(editing || creating) && (
        <CodeFormModal
          initial={editing ?? undefined}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
