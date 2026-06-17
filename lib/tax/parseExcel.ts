import * as XLSX from "xlsx-js-style";
import type { SettlementInput } from "./calculations";

// 정산항목코드 → SettlementInput 키 매핑
const CODE_TO_INPUT: Partial<Record<string, keyof SettlementInput>> = {
  S001: "S001", S002: "S002", S013: "S013",
  G004: "G004", G007: "G007", G008: "G008", G009: "G009", G010: "G010",
  G015: "G015", G111: "G111", G154: "G154", G112: "G112",
  G223: "G223", G205: "G205", G222: "G222", G257: "G257", G228: "G228", G240: "G240",
  G218: "G218", G219: "G219", G115: "G115",
  G312: "G312",
  G113: "G113",   // 보장성보험 납입액
  G118: "G118",   // 기타의료비
  G198: "G198",   // 본인 의료비
  G199: "G199",   // 65세이상 의료비
  G123: "G123",   // 교육비공제계
  G326: "G326",   // 기부금
  G167: "G167",   // 퇴직연금(DC)
  G202: "G202",   // 연금저축
  G907: "G907",   // 기납부 소득세
  G908: "G908",   // 기납부 지방소득세
};

// 코드 → 한국어 항목명 (Excel 정산항목 열이 없을 때 폴백)
export const CODE_NAMES: Readonly<Record<string, string>> = {
  S001: "급여소득",           S002: "상여소득",           S013: "자가운전비과세",
  G004: "부양가족공제",       G007: "경로우대공제",       G008: "장애인공제",
  G009: "부녀자공제",         G010: "한부모공제",
  G015: "국민연금보험료",     G111: "건강보험료",         G154: "장기요양보험료",
  G112: "고용보험료",
  G223: "신용카드 사용",      G205: "현금영수증",         G222: "직불·선불카드 사용",
  G257: "문화체육 신용카드",  G228: "전통시장 사용",      G240: "대중교통 사용",
  G218: "투자조합 출자공제",  G219: "소기업·소상공인 공제부금",
  G115: "장기주택저당차입금 이자상환액",
  G312: "자녀세액공제",
  G113: "보장성보험 납입액",
  G118: "기타의료비",         G198: "본인 의료비",        G199: "65세이상 의료비",
  G123: "교육비공제계",       G326: "기부금",
  G167: "퇴직연금(DC) 납입액", G202: "연금저축 납입액",
  G907: "기납부 소득세",      G908: "기납부 지방소득세",
};

const KNOWN_CODES = new Set(Object.keys(CODE_TO_INPUT));

export interface MatchedItem   { code: string; name: string; value: number; }
export interface UnmatchedItem { code: string; excelName: string; value: number; }

export interface ParseResult {
  input: Partial<SettlementInput>;
  matched: number;
  total: number;
  matchedItems: MatchedItem[];
  unmatchedItems: UnmatchedItem[];
}

function parseNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  return Number(String(v).replace(/,/g, "")) || 0;
}

interface ColumnLayout {
  cCol: number;    // 정산항목코드 열
  vCol: number;    // 처리금액 열 (primary)
  natCol: number;  // 국세청자료 열 (fallback when 처리금액=0)
  etcCol: number;  // 그밖의자료 열 (fallback)
  nameCol: number; // 정산항목 열 (item name)
  dataStart: number;
}

// 헤더에서 열 구조 감지
function detectColumns(rows: (string | number | null)[][]): ColumnLayout | null {
  // ── 방법 1: 헤더 텍스트("정산항목코드" / "처리금액") 탐색 ──
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = rows[r] || [];
    let cCol = -1, vCol = -1, natCol = -1, etcCol = -1, nameCol = -1;
    for (let c = 0; c < row.length; c++) {
      const v = String(row[c] ?? "").trim();
      if (v === "정산항목코드") cCol = c;
      else if (v === "처리금액")   vCol = c;
      else if (v === "국세청자료") natCol = c;
      else if (v === "그밖의 자료" || v === "그밖의자료") etcCol = c;
      else if (v === "정산항목")   nameCol = c;
    }
    if (cCol >= 0 && vCol >= 0) {
      return { cCol, vCol, natCol, etcCol, nameCol, dataStart: r + 1 };
    }
  }

  // ── 방법 2: B열(1) = 코드, G열(6) = 처리금액 고정 컬럼 ──
  for (let r = 0; r < rows.length; r++) {
    const code = String((rows[r] || [])[1] ?? "").trim();
    if (KNOWN_CODES.has(code)) {
      return { cCol: 1, vCol: 6, natCol: 5, etcCol: 4, nameCol: 2, dataStart: r };
    }
  }

  // ── 방법 3: 알려진 코드가 있는 열 동적 추론 ──
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      if (!KNOWN_CODES.has(String(row[c] ?? "").trim())) continue;
      for (let vc = c + 1; vc < Math.min(c + 8, row.length); vc++) {
        const cell = row[vc];
        if (typeof cell === "number" || (typeof cell === "string" && /^[\d,]+$/.test(cell.trim()))) {
          return { cCol: c, vCol: vc, natCol: -1, etcCol: -1, nameCol: c + 1, dataStart: r };
        }
      }
    }
  }

  return null;
}

function parseSheet(
  rows: (string | number | null)[][],
  layout: ColumnLayout
): { partial: Partial<SettlementInput>; matchedItems: MatchedItem[]; unmatchedItems: UnmatchedItem[] } {
  const { cCol, vCol, natCol, etcCol, nameCol, dataStart } = layout;
  const partial: Partial<SettlementInput> = {};
  const matchedItems: MatchedItem[] = [];
  const unmatchedItems: UnmatchedItem[] = [];

  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r] || [];
    const code = String(row[cCol] ?? "").trim();
    if (!code) continue;

    // 처리금액이 0이면 국세청자료+그밖의자료 합산을 폴백으로 사용
    const primary   = parseNum(row[vCol]);
    const national  = natCol >= 0 ? parseNum(row[natCol]) : 0;
    const etc       = etcCol >= 0 ? parseNum(row[etcCol]) : 0;
    const val       = primary !== 0 ? primary : (national + etc);

    const excelName = nameCol >= 0 ? String(row[nameCol] ?? "").trim() : "";

    const key = CODE_TO_INPUT[code];
    if (key) {
      (partial as Record<string, number>)[key] =
        ((partial as Record<string, number>)[key] ?? 0) + val;
      matchedItems.push({
        code,
        name: excelName || CODE_NAMES[code] || code,
        value: val,
      });
    } else {
      unmatchedItems.push({ code, excelName: excelName || code, value: val });
    }
  }

  return { partial, matchedItems, unmatchedItems };
}

export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" });

  // 첫 번째 유효한 시트만 처리 (시트간 중복 방지)
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1, defval: null,
    });
    if (!rows.length) continue;

    const layout = detectColumns(rows);
    if (!layout) continue;

    const { partial, matchedItems, unmatchedItems } = parseSheet(rows, layout);

    // 유효 데이터가 있는 첫 시트에서 반환
    if (matchedItems.length > 0 || unmatchedItems.length > 0) {
      return {
        input: partial,
        matched: matchedItems.length,
        total: matchedItems.length + unmatchedItems.length,
        matchedItems,
        unmatchedItems,
      };
    }
  }

  throw new Error(
    "'정산항목코드' 또는 '처리금액' 열을 찾을 수 없습니다.\n" +
    "• 헤더 행에 '정산항목코드' / '처리금액' 텍스트가 있는지 확인\n" +
    "• 또는 B열에 코드(S001, G112 등), G열에 금액이 있는 형식인지 확인\n" +
    "• DRM(암호화) 보호 파일은 지원하지 않습니다."
  );
}
