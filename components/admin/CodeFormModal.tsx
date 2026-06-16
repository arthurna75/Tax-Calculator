"use client";

import { useState } from "react";
import { createCode, updateCode, type TaxCode, type TaxCodeInput } from "@/lib/tax/codes";

interface Props {
  initial?: TaxCode;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: TaxCodeInput = {
  code: "", name: "", category: "deduction", description: "",
  rate: null, limit_amount: null, sort_order: 0,
};

export default function CodeFormModal({ initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<TaxCodeInput>(initial ? { ...initial } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (initial) await updateCode(initial.id, form);
      else await createCode(form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{initial ? "코드 수정" : "코드 추가"}</h2>

        <label>코드<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></label>
        <label>이름<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>
          분류
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TaxCodeInput["category"] })}>
            <option value="income">income</option>
            <option value="deduction">deduction</option>
            <option value="credit">credit</option>
            <option value="tax">tax</option>
          </select>
        </label>
        <label>설명<input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label>공제율<input type="number" step="0.01" value={form.rate ?? ""} onChange={(e) => setForm({ ...form, rate: e.target.value ? parseFloat(e.target.value) : null })} /></label>
        <label>한도금액<input type="number" value={form.limit_amount ?? ""} onChange={(e) => setForm({ ...form, limit_amount: e.target.value ? parseFloat(e.target.value) : null })} /></label>
        <label>정렬순서<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></label>

        {error && <p className="login-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>취소</button>
          <button type="submit" disabled={saving}>{saving ? "저장 중..." : "저장"}</button>
        </div>
      </form>
    </div>
  );
}
