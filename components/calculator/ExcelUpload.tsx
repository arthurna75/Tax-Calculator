"use client";

import { useRef, useState } from "react";
import { parseExcelBuffer, type MatchedItem, type UnmatchedItem } from "@/lib/tax/parseExcel";
import type { SettlementInput } from "@/lib/tax/calculations";

interface Props {
  onLoaded: (partial: Partial<SettlementInput>) => void;
  onReset: () => void;
}

type Status = { type: "ok" | "err" | "info"; msg: string } | null;

export default function ExcelUpload({ onLoaded, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchedItems, setMatchedItems] = useState<MatchedItem[]>([]);
  const [unmatchedItems, setUnmatchedItems] = useState<UnmatchedItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);

  async function processFile(file: File) {
    setFileName(file.name);
    setStatus({ type: "info", msg: "파일을 읽는 중…" });
    setLoading(true);
    setMatchedItems([]);
    setUnmatchedItems([]);
    setShowDetail(false);
    try {
      const buf = await file.arrayBuffer();
      const result = parseExcelBuffer(buf);
      setMatchedItems(result.matchedItems);
      setUnmatchedItems(result.unmatchedItems);
      onLoaded(result.input);
      setStatus({
        type: "ok",
        msg: `✅ 파일 분석 완료 — ${result.total}개 코드 중 ${result.matched}개 항목 자동 입력됨`,
      });
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
    setMatchedItems([]);
    setUnmatchedItems([]);
    setShowDetail(false);
    if (inputRef.current) inputRef.current.value = "";
    onReset();
  }

  const hasResult = matchedItems.length > 0 || unmatchedItems.length > 0;

  return (
    <div className="form-section upload-section">
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

      {hasResult && (
        <div className="upload-detail">
          <button
            className="upload-detail-toggle"
            onClick={() => setShowDetail((v) => !v)}
            type="button"
          >
            {showDetail ? "▲ 상세 내역 닫기" : `▼ 상세 내역 보기 (반영 ${matchedItems.length}건 · 미반영 ${unmatchedItems.length}건)`}
          </button>

          {showDetail && (
            <div className="upload-detail-body">
              {matchedItems.length > 0 && (
                <>
                  <p className="upload-detail-section-title">반영된 항목</p>
                  <table className="upload-detail-table">
                    <thead>
                      <tr><th>코드</th><th>항목명</th><th>금액</th></tr>
                    </thead>
                    <tbody>
                      {matchedItems.map((item) => (
                        <tr key={item.code} className="upload-detail-row--matched">
                          <td>{item.code}</td>
                          <td>{item.name}</td>
                          <td className="upload-detail-amount">{item.value.toLocaleString("ko-KR")}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {unmatchedItems.length > 0 && (
                <>
                  <p className="upload-detail-section-title upload-detail-section-title--pending">
                    반영예정 항목 ({unmatchedItems.length}건)
                  </p>
                  <table className="upload-detail-table upload-detail-table--pending">
                    <thead>
                      <tr><th>코드</th><th>항목명</th><th>금액</th></tr>
                    </thead>
                    <tbody>
                      {unmatchedItems.map((item) => (
                        <tr key={item.code} className="upload-detail-row--pending">
                          <td>{item.code}</td>
                          <td className="upload-detail-pending-label">반영예정</td>
                          <td className="upload-detail-amount">{item.value.toLocaleString("ko-KR")}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
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
