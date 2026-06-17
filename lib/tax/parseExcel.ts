import * as XLSX from "xlsx-js-style";
import type { SettlementInput } from "./calculations";

// 국세청 소득정산기초자료 Excel의 정산항목코드 → SettlementInput 키 매핑
const CODE_TO_INPUT: Partial<Record<string, keyof SettlementInput>> = {
  S001: "S001",
  S002: "S002",
  S013: "S013",
  G004: "G004",
  G007: "G007",
  G008: "G008",
  G009: "G009",
  G010: "G010",
  G015: "G015",
  G111: "G111",
  G154: "G154",
  G112: "G112",
  G223: "G223",
  G205: "G205",
  G222: "G222",
  G257: "G257",
  G228: "G228",
  G240: "G240",
  G218: "G218",
  G219: "G219",
  G115: "G115",
  G312: "G312",
  G113: "G113",  // 보장성보험 납입액
  G118: "G118",  // 의료비 (일반)
  G198: "G198",  // 의료비 (난임시술비)
  G199: "G199",  // 의료비 (미숙아·선천성이상아)
  G123: "G123",  // 교육비 지출액
  G326: "G326",  // 기부금 지출액
  G167: "G167",  // 퇴직연금(DC) 납입액
  G202: "G202",  // 연금저축 납입액
  G907: "G907",
  G908: "G908",
};

// 코드 → 한국어 항목명 (업로드 결과 표시용)
export const CODE_NAMES: Readonly<Record<string, string>> = {
  S001: "급여소득",
  S002: "상여소득",
  S013: "자가운전보조금 비과세",
  G004: "부양가족 공제액",
  G007: "경로우대 추가공제",
  G008: "장애인 추가공제",
  G009: "부녀자공제",
  G010: "한부모 추가공제",
  G015: "국민연금보험료",
  G111: "건강보험료",
  G154: "장기요양보험료",
  G112: "고용보험료",
  G223: "신용카드 사용액",
  G205: "현금영수증 사용액",
  G222: "직불·체크카드 사용액",
  G257: "도서·공연·문화 신용카드",
  G228: "전통시장 사용액",
  G240: "대중교통 사용액",
  G218: "벤처투자조합 출자공제",
  G219: "소기업·소상공인 공제부금",
  G115: "장기주택저당차입금 이자상환액",
  G312: "자녀세액공제",
  G113: "보장성보험 납입액",
  G118: "의료비 (일반)",
  G198: "의료비 (난임시술비)",
  G199: "의료비 (미숙아·선천성이상아)",
  G123: "교육비 지출액",
  G326: "기부금 지출액",
  G167: "퇴직연금(DC) 납입액",
  G202: "연금저축 납입액",
  G907: "기납부 소득세",
  G908: "기납부 지방소득세",
};

const KNOWN_CODES = new Set(Object.keys(CODE_TO_INPUT));

export interface MatchedItem { code: string; name: string; value: number; }
export interface UnmatchedItem { code: string; value: number; }

export interface ParseResult {
  input: Partial<SettlementInput>;
  matched: number;
  total: number;
  matchedItems: MatchedItem[];
  unmatchedItems: UnmatchedItem[];
}

// 숫자 파싱 헬퍼
function parseNum(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined || raw === "") return 0;
  if (typeof raw === "number") return raw;
  return Number(raw.replace(/,/g, "")) || 0;
}

// 시트에서 코드/값 열 위치를 감지해 반환 (없으면 null)
function detectColumns(
  rows: (string | number | null)[][]
): { cCol: number; vCol: number; dataStart: number } | null {
  // ── 방법 1: 헤더 텍스트("정산항목코드" / "처리금액") 탐색 ──
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = rows[r] || [];
    let cCol = -1, vCol = -1;
    for (let c = 0; c < row.length; c++) {
      const v = String(row[c] ?? "").trim();
      if (v === "정산항목코드") cCol = c;
      if (v === "처리금액") vCol = c;
    }
    if (cCol >= 0 && vCol >= 0) return { cCol, vCol, dataStart: r + 1 };
  }

  // ── 방법 2: B열(1) = 코드, G열(6) = 처리금액 고정 컬럼 ──
  for (let r = 0; r < rows.length; r++) {
    const code = String((rows[r] || [])[1] ?? "").trim();
    if (KNOWN_CODES.has(code)) return { cCol: 1, vCol: 6, dataStart: r };
  }

  // ── 방법 3: 어느 열이든 알려진 코드 발견 → 오른쪽 숫자열 추론 ──
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      if (!KNOWN_CODES.has(String(row[c] ?? "").trim())) continue;
      for (let vc = c + 1; vc < Math.min(c + 8, row.length); vc++) {
        const cell = row[vc];
        if (
          typeof cell === "number" ||
          (typeof cell === "string" && /^[\d,]+$/.test(cell.trim()))
        ) {
          return { cCol: c, vCol: vc, dataStart: r };
        }
      }
    }
  }

  return null;
}

// 감지된 열로 시트 전체를 파싱
function parseSheet(
  rows: (string | number | null)[][],
  cCol: number,
  vCol: number,
  dataStart: number,
  seenCodes: Set<string>  // 이미 다른 시트에서 처리된 코드는 건너뜀
): { partial: Partial<SettlementInput>; matchedItems: MatchedItem[]; unmatchedItems: UnmatchedItem[] } {
  const partial: Partial<SettlementInput> = {};
  const matchedItems: MatchedItem[] = [];
  const unmatchedItems: UnmatchedItem[] = [];

  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r] || [];
    const code = String(row[cCol] ?? "").trim();
    if (!code) continue;
    if (seenCodes.has(code)) continue;  // 이전 시트에서 이미 처리

    const val = parseNum(row[vCol]);

    const key = CODE_TO_INPUT[code];
    if (key) {
      (partial as Record<string, number>)[key] =
        ((partial as Record<string, number>)[key] ?? 0) + val;
      matchedItems.push({ code, name: CODE_NAMES[code] ?? code, value: val });
    } else {
      unmatchedItems.push({ code, value: val });
    }
    seenCodes.add(code);
  }

  return { partial, matchedItems, unmatchedItems };
}

export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" });

  const accPartial: Partial<SettlementInput> = {};
  const accMatched: MatchedItem[] = [];
  const accUnmatched: UnmatchedItem[] = [];
  const seenCodes = new Set<string>();

  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: null,
    });
    if (!rows.length) continue;

    const cols = detectColumns(rows);
    if (!cols) continue;

    const { partial, matchedItems, unmatchedItems } = parseSheet(
      rows,
      cols.cCol,
      cols.vCol,
      cols.dataStart,
      seenCodes
    );

    // 합산 (첫 번째로 발견된 시트의 값 우선)
    for (const [key, val] of Object.entries(partial)) {
      if (!((key as keyof SettlementInput) in accPartial)) {
        (accPartial as Record<string, number>)[key] = val as number;
      }
    }
    accMatched.push(...matchedItems);
    accUnmatched.push(...unmatchedItems);
  }

  if (accMatched.length === 0 && accUnmatched.length === 0) {
    throw new Error(
      "'정산항목코드' 또는 '처리금액' 열을 찾을 수 없습니다.\n" +
      "• 헤더 행에 '정산항목코드' / '처리금액' 텍스트가 있는지 확인\n" +
      "• 또는 B열에 코드(S001, G112 등), G열에 금액이 있는 형식인지 확인\n" +
      "• DRM(암호화) 보호 파일은 지원하지 않습니다."
    );
  }

  return {
    input: accPartial,
    matched: accMatched.length,
    total: accMatched.length + accUnmatched.length,
    matchedItems: accMatched,
    unmatchedItems: accUnmatched,
  };
}
