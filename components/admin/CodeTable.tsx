"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCode, type TaxCode } from "@/lib/tax/codes";
import CodeFormModal from "./CodeFormModal";

interface Props {
  codes: TaxCode[];
  isAdmin: boolean;
}

function AdminOnly({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <span
        className="admin-only-trigger"
        onClick={() => setShow(true)}
      >
        {children}
      </span>
      {show && (
        <div className="modal-backdrop" onClick={() => setShow(false)}>
          <div className="modal-card admin-only-modal" onClick={(e) => e.stopPropagation()}>
            <p className="admin-only-icon">🔒</p>
            <h2>관리자 접근 권한</h2>
            <p>이 기능은 관리자만 사용할 수 있습니다.</p>
            <div className="modal-actions">
              <button onClick={() => setShow(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CodeTable({ codes, isAdmin }: Props) {
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
        <h1>연말정산 코드 마스터</h1>
        <AdminOnly isAdmin={isAdmin}>
          <button onClick={() => isAdmin && setCreating(true)}>+ 코드 추가</button>
        </AdminOnly>
      </div>

      {!isAdmin && (
        <p className="admin-readonly-notice">조회만 가능합니다. 추가·수정·삭제는 관리자만 사용할 수 있습니다.</p>
      )}

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
                <AdminOnly isAdmin={isAdmin}>
                  <button onClick={() => isAdmin && setEditing(c)}>수정</button>
                </AdminOnly>
                <AdminOnly isAdmin={isAdmin}>
                  <button onClick={() => isAdmin && handleDelete(c)}>삭제</button>
                </AdminOnly>
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
