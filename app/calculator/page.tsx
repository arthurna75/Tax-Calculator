"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calcSettlement, type SettlementInput } from "@/lib/tax/calculations";
import { downloadSettlementExcel } from "@/lib/tax/excelExport";
import { createSettlement } from "@/lib/tax/settlements";
import IncomeForm from "@/components/calculator/IncomeForm";
import DeductionForm from "@/components/calculator/DeductionForm";
import CreditForm from "@/components/calculator/CreditForm";
import ResultSteps from "@/components/calculator/ResultSteps";
import ExcelUpload from "@/components/calculator/ExcelUpload";

const DEFAULT_INPUT: SettlementInput = {
  S001: 0, S002: 0, S013: 0, nontaxEtc: 0,
  G004: 0, G007: 0, G008: 0, G009: 0, G010: 0,
  G015: 0, G111: 0, G154: 0, G112: 0,
  G223: 0, G205: 0, G222: 0, G257: 0, G228: 0, G240: 0,
  G218: 0, G219: 0, housingLoan: 0, G115: 0,
  G312: 0,
  G113: 0, medBase: 0, eduBase: 0, donBase: 0, retBase: 0, penBase: 0,
  G907: 0, G908: 0,
};

export default function CalculatorPage() {
  const router = useRouter();
  const [input, setInput] = useState<SettlementInput>(DEFAULT_INPUT);
  const [saving, setSaving] = useState(false);

  const result = useMemo(() => calcSettlement(input), [input]);

  function patch(p: Partial<SettlementInput>) {
    setInput((prev) => ({ ...prev, ...p }));
  }

  function handleExcelLoaded(partial: Partial<SettlementInput>) {
    setInput({ ...DEFAULT_INPUT, ...partial });
  }

  function handleReset() {
    setInput(DEFAULT_INPUT);
  }

  async function handleSave() {
    const title = window.prompt("저장할 기록의 제목을 입력하세요.", "2025년 연말정산");
    if (!title) return;
    setSaving(true);
    try {
      const { id } = await createSettlement(title, 2025, input, result);
      router.push(`/records/${id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="calculator-page">
      <div className="calculator-forms">
        <ExcelUpload onLoaded={handleExcelLoaded} onReset={handleReset} />
        <IncomeForm input={input} result={result} onChange={patch} />
        <DeductionForm input={input} result={result} onChange={patch} />
        <CreditForm input={input} result={result} onChange={patch} />
      </div>

      <div className="calculator-result">
        <ResultSteps result={result} />
        <div className="calculator-actions">
          <button onClick={() => downloadSettlementExcel(result)}>Excel 다운로드 (9시트)</button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "내 기록으로 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
