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
  G113: "G113",  // 보장성보험 납입액
  G115: "G115",
  G312: "G312",
  G118: "G118",  // 의료비 (일반)
  G198: "G198",  // 의료비 (난임시술비)
  G199: "G199",  // 의료비 (미숙아·선천성이상아)
  G123: "G123",  // 교육비 지출액
  G326: "G326",  // 기부금 지출액
  G167: "G167",  // 퇴직연금(DC) 납입액
  G202: "G202",  // 연금저축 납입액
  // G317/G318/G319/G322/G315/G316은 대상금액에서 자동계산되므로 직접 매핑하지 않음
  G907: "G907",
  G908: "G908",
};

export interface ParseResult {
  input: Partial<SettlementInput>;
  matched: number;
  total: number;
}

// 알려진 정산항목코드 집합 (컬럼 자동감지용)
const KNOWN_CODES = new Set(Object.keys(CODE_TO_INPUT));

function extractCodesFromSheet(
  rows: (string | number | null)[][],
  cCol: number,
  vCol: number,
  dataStartRow: number
): { partial: Partial<SettlementInput>; matched: number; total: number } {
  const partial: Partial<SettlementInput> = {};
  let matched = 0;
  let total = 0;

  for (let r = dataStartRow; r < rows.length; r++) {
    const row = rows[r] || [];
    const code = String(row[cCol] ?? "").trim();
    if (!code) continue;

    let rawVal = row[vCol];
    if (rawVal === null || rawVal === undefined || rawVal === "") rawVal = 0;
    if (typeof rawVal === "string") rawVal = Number(rawVal.replace(/,/g, "")) || 0;
    const val = Number(rawVal);

    total++;
    const key = CODE_TO_INPUT[code];
    if (key) {
      (partial as Record<string, number>)[key] =
        ((partial as Record<string, number>)[key] ?? 0) + val;
      matched++;
    }
  }
  return { partial, matched, total };
}

export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" });

  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: null,
    });
    if (!rows.length) continue;

    // ── 방법 1: 헤더 텍스트("정산항목코드" / "처리금액")로 열 탐색 (최초 15행) ──
    let hRow = -1, cCol = -1, vCol = -1;
    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r] || [];
      for (let c = 0; c < row.length; c++) {
        const v = String(row[c] ?? "").trim();
        if (v === "정산항목코드") { cCol = c; hRow = r; }
        if (v === "처리금액")     { vCol = c; }
      }
      if (hRow >= 0 && cCol >= 0 && vCol >= 0) break;
    }

    if (hRow >= 0 && cCol >= 0 && vCol >= 0) {
      const { partial, matched, total } = extractCodesFromSheet(rows, cCol, vCol, hRow + 1);
      if (total > 0) return { input: partial, matched, total };
    }

    // ── 방법 2: B열(index 1) = 코드, G열(index 6) = 처리금액 고정 컬럼 시도 ──
    // 헤더 없이 데이터가 바로 시작하는 경우, 또는 헤더가 다른 텍스트인 경우
    {
      const B_COL = 1; // B열
      const G_COL = 6; // G열
      // B열에 알려진 코드가 있는 첫 행을 데이터 시작점으로 결정
      let dataStart = -1;
      for (let r = 0; r < rows.length; r++) {
        const code = String((rows[r] || [])[B_COL] ?? "").trim();
        if (KNOWN_CODES.has(code)) { dataStart = r; break; }
      }
      if (dataStart >= 0) {
        const { partial, matched, total } = extractCodesFromSheet(rows, B_COL, G_COL, dataStart);
        if (total > 0) return { input: partial, matched, total };
      }
    }

    // ── 방법 3: 어느 열이든 알려진 코드가 있는 열을 코드열로, 오른쪽 수치열을 값열로 추론 ──
    {
      let detectedCCol = -1, detectedVCol = -1, detectedStart = -1;
      outer:
      for (let r = 0; r < Math.min(rows.length, 20); r++) {
        const row = rows[r] || [];
        for (let c = 0; c < row.length; c++) {
          const code = String(row[c] ?? "").trim();
          if (!KNOWN_CODES.has(code)) continue;
          // 코드열 발견 → 같은 행에서 오른쪽에 숫자인 열 탐색
          for (let vc = c + 1; vc < Math.min(c + 8, row.length); vc++) {
            const candidate = row[vc];
            if (typeof candidate === "number" || (typeof candidate === "string" && /^[\d,]+$/.test(candidate.trim()))) {
              detectedCCol = c;
              detectedVCol = vc;
              detectedStart = r;
              break outer;
            }
          }
        }
      }
      if (detectedCCol >= 0 && detectedVCol >= 0) {
        const { partial, matched, total } = extractCodesFromSheet(rows, detectedCCol, detectedVCol, detectedStart);
        if (total > 0) return { input: partial, matched, total };
      }
    }
  }

  throw new Error(
    "'정산항목코드' 또는 '처리금액' 열을 찾을 수 없습니다.\n" +
    "• 헤더 행에 '정산항목코드' / '처리금액' 텍스트가 있는지 확인\n" +
    "• 또는 B열에 코드(S001, G112 등), G열에 금액이 있는 형식인지 확인\n" +
    "• DRM(암호화) 보호 파일은 지원하지 않습니다."
  );
}
