"use client";

import { useRef, useState } from "react";
import { parseExcelBuffer } from "@/lib/tax/parseExcel";
import type { SettlementInput } from "@/lib/tax/calculations";

interface Props {
  onLoaded: (partial: Partial<SettlementInput>, summary: string) => void;
  onReset: () => void;
}

type Status = { type: "ok" | "err" | "info"; msg: string } | null;

export default function ExcelUpload({ onLoaded, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function processFile(file: File) {
    setFileName(file.name);
    setStatus({ type: "info", msg: "파일을 읽는 중…" });
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const { input, matched, total } = parseExcelBuffer(buf);
      const summary = `${total}개 코드 중 ${matched}개 항목 자동 입력됨`;
      onLoaded(input, summary);
      setStatus({ type: "ok", msg: `✅ 파일 분석 완료! ${summary}` });
    } catch (e) {
      setStatus({ type: "err", msg: "❌ " + (e instanceof Error ? e.message : "파일 읽기 실패") });
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleReset() {
    setFileName(null);
    setStatus(null);
    if (inputRef.current) inputRef.current.value = "";
    onReset();
  }

  return (
    <div className="form-section">
      <h2>국세청 기초자료 파일 업로드</h2>
      <p className="upload-hint">
        소득정산기초자료(.xlsx) 파일을 올리면 아래 항목이 자동으로 채워집니다.
        DRM(암호화) 보호 파일은 지원하지 않습니다.
      </p>

      <label
        className={`upload-dropzone${dragging ? " dragging" : ""}`}
        htmlFor="excelFileInput"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="upload-icon">📑</span>
        <span className="upload-main">
          {fileName ?? "엑셀 파일을 끌어다 놓거나 클릭하여 선택"}
        </span>
        <span className="upload-sub">소득정산기초자료(년도).xlsx · 브라우저 내에서만 처리됩니다</span>
        <input
          ref={inputRef}
          type="file"
          id="excelFileInput"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </label>

      {status && (
        <p className={`upload-status upload-status--${status.type}`}>{status.msg}</p>
      )}

      <div className="upload-actions">
        <button
          className="upload-reset-btn"
          onClick={handleReset}
          disabled={loading}
          type="button"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
