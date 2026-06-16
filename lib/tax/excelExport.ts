// 연말정산_통합계산기.html의 buildOutput() Excel 9시트 생성 로직을 TypeScript로 이식
import * as XLSX from "xlsx-js-style";
import type { SettlementResult } from "./calculations";

type CellStyle = Record<string, unknown>;
// xlsx-js-style은 워크시트를 plain object로 다루므로 any로 취급한다.
type WS = Record<string, unknown> & { [addr: string]: unknown };

const FONT_KR = "맑은 고딕";

function S(opts: {
  size?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fill?: string;
  align?: Record<string, unknown>;
  fmt?: string;
  border?: boolean;
}): CellStyle {
  const s: Record<string, unknown> = {};
  const font: Record<string, unknown> = { name: FONT_KR, sz: opts.size || 11 };
  if (opts.bold) font.bold = true;
  if (opts.italic) font.italic = true;
  if (opts.color) font.color = { rgb: opts.color };
  s.font = font;
  if (opts.fill) s.fill = { patternType: "solid", fgColor: { rgb: opts.fill } };
  if (opts.align) s.alignment = { ...opts.align, wrapText: true };
  if (opts.fmt) s.numFmt = opts.fmt;
  if (opts.border) {
    const t = { style: "thin", color: { rgb: "BFBFBF" } };
    s.border = { top: t, bottom: t, left: t, right: t };
  }
  return s;
}

const TITLE_STYLE = S({ bold: true, size: 16, color: "FFFFFF", fill: "1F4E78", align: { horizontal: "center", vertical: "center" } });
const STEP_STYLE = S({ bold: true, size: 12, color: "FFFFFF", fill: "2E75B6", align: { horizontal: "center", vertical: "center" } });
const HEAD_STYLE = S({ bold: true, size: 11, color: "FFFFFF", fill: "305496", align: { horizontal: "center", vertical: "center" }, border: true });
const SUB_FILL = "D9E1F2";
const RES_FILL = "FFF2CC";
const FIN_FILL = "FCE4D6";
const ALC = { horizontal: "center", vertical: "center" };
const ALL = { horizontal: "left", vertical: "center", indent: 1 };
const ALR = { horizontal: "right", vertical: "center" };

function xCell(ws: WS, addr: string, value: unknown, style?: CellStyle) {
  const cell: Record<string, unknown> = { v: value };
  if (typeof value === "string" && value.startsWith("=") && value.length > 1) {
    const c2 = value.charCodeAt(1);
    if ((c2 >= 65 && c2 <= 90) || (c2 >= 97 && c2 <= 122) || c2 === 40 || c2 === 39 || (c2 >= 48 && c2 <= 57)) {
      cell.f = value.slice(1);
      cell.v = 0;
      cell.t = "n";
    } else {
      cell.t = "s";
    }
  } else if (typeof value === "number") {
    cell.t = "n";
  } else {
    cell.t = "s";
  }
  if (style) cell.s = style;
  ws[addr] = cell;
}
function xRange(ws: WS, r: string) {
  ws["!ref"] = r;
}
function xMerge(ws: WS, r: string) {
  if (!ws["!merges"]) ws["!merges"] = [];
  (ws["!merges"] as unknown[]).push(XLSX.utils.decode_range(r));
}
function xCols(ws: WS, widths: number[]) {
  ws["!cols"] = widths.map((w) => ({ wch: w }));
}
function xRowH(ws: WS, row: number, h: number) {
  if (!ws["!rows"]) ws["!rows"] = [];
  (ws["!rows"] as unknown[])[row - 1] = { hpt: h };
}

// SettlementResult → 코드맵(codeMap) 변환
export function buildCodeMap(r: SettlementResult): Record<string, number> {
  return {
    S001: r.salary, S002: r.bonus, S004: r.salary + r.bonus,
    S013: r.nonTax13, S019: r.nonTaxSum, S030: r.totalSalary,
    G001: r.laborDed, S301: r.earnedIncome,
    G002: r.selfDed, G004: r.depDed, G005: r.selfDed + r.depDed,
    G007: r.elderDed, G008: r.disabDed, G009: r.womanDed, G010: r.singleDed,
    G011: r.elderDed + r.disabDed + r.womanDed + r.singleDed,
    G015: r.pension, G111: r.health, G154: r.ltcare, G112: r.employ,
    G136: r.insurDed,
    G218: r.venture, G219: r.smallbiz, G113: r.rentLoan, G115: r.mtgInt,
    G223: r.card.cc, G205: r.card.cash, G222: r.card.dc,
    G257: r.card.cult, G258: 0, G259: 0,
    G228: r.card.trad, G240: r.card.tran,
    G913: r.card.allGeneral + r.card.trad + r.card.tran,
    G207: 0, G224: 0, G231: 0,
    G230: r.card.tradDeduct, G237: r.card.tranDeduct,
    G232: r.card.baseDeduct, G225: r.card.total,
    G210: r.otherDed, G014: r.personalDed,
    G211: r.taxBase, G212: r.calcTax,
    G304: r.laborCredit, G312: r.childCredit,
    G315: r.retCredit, G316: r.penCredit,
    G317: r.insCredit, G318: r.medCredit,
    G319: r.eduCredit, G322: r.donCredit,
    G309: r.totalCredit,
    G901: r.finalIncomeTax, G902: r.finalLocalTax,
    G907: r.withheldIncome, G908: r.withheldLocal,
    G910: r.diffIncome, G911: r.diffLocal,
  };
}

export function buildWorkbook(d: Record<string, number>) {
  const wb = XLSX.utils.book_new();
  const v = (c: string) => (typeof d[c] === "number" ? d[c] : 0);

  // --- Sheet 1: 한눈에보기 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 38, 4, 22, 4, 38]);
    xCell(ws, "B2", "연말정산 — 계산 흐름 한눈에 보기", TITLE_STYLE); xMerge(ws, "B2:F2"); xRowH(ws, 2, 32);
    xCell(ws, "B4", "■ 최종 결과 — 환급/납부", STEP_STYLE); xMerge(ws, "B4:F4");
    const fL = S({ bold: true, size: 11, fill: FIN_FILL, align: ALL });
    const fV = S({ size: 11, color: "0000FF", fill: FIN_FILL, align: ALR, fmt: '#,##0"원";[Red](#,##0"원")' });
    const fVB = S({ bold: true, size: 12, color: "C00000", fill: FIN_FILL, align: ALR, fmt: '#,##0"원";[Red](#,##0"원")' });
    xCell(ws, "B5", "차감_소득세 (환급/추가납부)", fL); xMerge(ws, "B5:C5");
    xCell(ws, "D5", v("G910"), fV); xMerge(ws, "D5:F5");
    xCell(ws, "B6", "차감_지방소득세 (환급/추가납부)", fL); xMerge(ws, "B6:C6");
    xCell(ws, "D6", v("G911"), fV); xMerge(ws, "D6:F6");
    xCell(ws, "B7", "총 환급(△)/납부 합계", fL); xMerge(ws, "B7:C7");
    xCell(ws, "D7", "=D5+D6", fVB); xMerge(ws, "D7:F7");

    xCell(ws, "B9", "■ 8단계 계산 흐름", STEP_STYLE); xMerge(ws, "B9:F9");
    const sL = S({ bold: true, fill: SUB_FILL, align: ALL });
    const sV = S({ bold: true, color: "0000FF", size: 12, fill: SUB_FILL, align: ALR, fmt: "#,##0" });
    const flow: [string, string, number][] = [
      ["①", "급여+상여 = 소득총액", v("S001") + v("S002")],
      ["②", "소득총액 − 비과세 = 총급여액", v("S030")],
      ["③", "총급여 − 근로소득공제 = 근로소득", v("S301")],
      ["④", "근로소득 − 소득공제 = 과세표준", v("G211")],
      ["⑤", "과세표준 × 세율 = 산출세액", v("G212")],
      ["⑥", "산출세액 − 세액공제 = 결정세액(소득세)", v("G901")],
      ["⑦", "결정세액 × 10% = 지방소득세", v("G902")],
      ["⑧", "결정 − 기납부 = 차감징수세액", v("G910")],
    ];
    let r = 10;
    flow.forEach(([s, desc, val]) => {
      xCell(ws, `B${r}`, `  ${s}  ${desc}`, sL); xMerge(ws, `B${r}:E${r}`);
      xCell(ws, `F${r}`, val, sV);
      r++;
    });
    xRange(ws, `A1:F${r + 1}`);
    XLSX.utils.book_append_sheet(wb, ws, "1.한눈에보기");
  }

  // --- Sheet 2: 총급여 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 30, 22, 30]);
    xCell(ws, "B2", "STEP 1.  총급여액 계산", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    ["부호", "항목", "금액(원)", "설명"].forEach((h, i) => xCell(ws, `${"BCDE"[i]}4`, h, HEAD_STYLE));
    const rows2: [string, string, number | string, string][] = [
      ["+", "급여소득 (S001)", v("S001"), "기본 급여"],
      ["+", "상여소득 (S002)", v("S002"), "각종 상여금"],
      ["=", "소득총액", "=D5+D6", "급여 + 상여"],
      ["−", "비과세 — 자가운전 (S013)", v("S013"), "월 20만원 한도 비과세"],
      ["=", "비과세 합계", "=D8", "비과세 항목 합계"],
      ["=", "총급여액 (S030)", "=D7-D9", "▶ 다음 단계의 출발점"],
    ];
    let r = 5;
    rows2.forEach(([sign, name, val, note]) => {
      const isFinal = r === 10;
      const isSum = sign === "=";
      const fill = isFinal ? FIN_FILL : isSum ? RES_FILL : undefined;
      const fc = typeof val === "number" ? "0000FF" : "000000";
      xCell(ws, `B${r}`, sign, S({ fill, align: ALC, border: true, bold: isSum, size: isFinal ? 12 : 11 }));
      xCell(ws, `C${r}`, name, S({ fill, align: ALL, border: true, bold: isSum, size: isFinal ? 12 : 11 }));
      xCell(ws, `D${r}`, val, S({ fill, align: ALR, border: true, bold: isSum, color: fc, size: isFinal ? 12 : 11, fmt: "#,##0" }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isSum, size: isFinal ? 12 : 11 }));
      r++;
    });
    xRange(ws, "A1:E11");
    XLSX.utils.book_append_sheet(wb, ws, "2.총급여");
  }

  // --- Sheet 3: 근로소득 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 32, 22, 44]);
    xCell(ws, "B2", "STEP 2.  근로소득금액 계산", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    ["부호", "항목", "금액(원)", "설명"].forEach((h, i) => xCell(ws, `${"BCDE"[i]}4`, h, HEAD_STYLE));
    const rows3: [string, string, number | string, string][] = [
      ["+", "총급여액 (STEP 1)", "='2.총급여'!D10", "STEP 1 결과"],
      ["−", "근로소득공제 (G001)", v("G001"), "총급여 구간별 공제"],
      ["=", "근로소득금액 (S301)", "=D5-D6", "▶ 소득공제 적용 전 소득"],
    ];
    let r = 5;
    rows3.forEach(([sign, name, val, note]) => {
      const isFinal = sign === "=" && r === 7;
      const fill = isFinal ? FIN_FILL : sign === "=" ? RES_FILL : undefined;
      const fc = typeof val === "number" ? "0000FF" : "000000";
      xCell(ws, `B${r}`, sign, S({ fill, align: ALC, border: true, bold: isFinal, size: isFinal ? 12 : 11 }));
      xCell(ws, `C${r}`, name, S({ fill, align: ALL, border: true, bold: isFinal, size: isFinal ? 12 : 11 }));
      xCell(ws, `D${r}`, val, S({ fill, align: ALR, border: true, bold: isFinal, color: fc, size: isFinal ? 12 : 11, fmt: "#,##0" }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isFinal, size: isFinal ? 12 : 11 }));
      r++;
    });
    xCell(ws, "B9", "참고 — 근로소득공제 산식", STEP_STYLE); xMerge(ws, "B9:E9");
    const brk = [
      ["총급여 구간", "공제액"],
      ["500만원 이하", "총급여 × 70%"],
      ["500만 ~ 1,500만원", "350만 + (총급여−500만)×40%"],
      ["1,500만 ~ 4,500만원", "750만 + (총급여−1,500만)×15%"],
      ["4,500만 ~ 1억원", "1,200만 + (총급여−4,500만)×5%"],
      ["1억원 초과", "1,475만 + (총급여−1억)×2% (최대 2,000만)"],
    ];
    r = 10;
    brk.forEach((row, i) => {
      const fill = i === 0 ? SUB_FILL : undefined;
      const bold = i === 0;
      xCell(ws, `B${r}`, row[0], S({ fill, align: ALL, border: true, bold })); xMerge(ws, `B${r}:C${r}`);
      xCell(ws, `D${r}`, row[1], S({ fill, align: ALL, border: true, bold })); xMerge(ws, `D${r}:E${r}`);
      r++;
    });
    xRange(ws, "A1:E15");
    XLSX.utils.book_append_sheet(wb, ws, "3.근로소득");
  }

  // --- Sheet 4: 소득공제 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 34, 22, 38]);
    xCell(ws, "B2", "STEP 3.  소득공제", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    const sh = (r: number, t: string) => { xCell(ws, `B${r}`, t, STEP_STYLE); xMerge(ws, `B${r}:E${r}`); };
    const ln = (r: number, sign: string, name: string, amt: number | string, note: string, isT = false, isF = false) => {
      const fill = isF ? FIN_FILL : isT ? RES_FILL : undefined;
      const fc = typeof amt === "number" ? "0000FF" : "000000";
      xCell(ws, `B${r}`, sign, S({ fill, align: ALC, border: true, bold: isT, size: isF ? 12 : 11 }));
      xCell(ws, `C${r}`, name, S({ fill, align: ALL, border: true, bold: isT, size: isF ? 12 : 11 }));
      xCell(ws, `D${r}`, amt, S({ fill, align: ALR, border: true, bold: isT, color: fc, size: isF ? 12 : 11, fmt: "#,##0" }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isT, size: isF ? 12 : 11 }));
    };
    let r = 4;
    sh(r, "① 인적공제"); r++;
    ln(r++, "+", "본인공제 (G002)", v("G002"), "본인 1명 × 150만원");
    ln(r++, "+", "부양가족공제 (G004)", v("G004"), "부양가족 × 150만원");
    ln(r++, "=", "기본공제 소계", "=D5+D6", "", true);
    ln(r++, "+", "경로우대공제 (G007)", v("G007"), "70세 이상 × 100만원");
    ln(r++, "+", "장애인공제 (G008)", v("G008"), "장애인 × 200만원");
    ln(r++, "=", "인적공제 합계", "=D7+D8+D9", "인적 소계", true);
    r++;
    sh(r, "② 사회보험료공제"); r++;
    const sr1 = r;
    ln(r++, "+", "국민연금 (G015)", v("G015"), "본인부담 전액");
    ln(r++, "+", "건강보험료 (G111)", v("G111"), "");
    ln(r++, "+", "장기요양 (G154)", v("G154"), "");
    ln(r++, "+", "고용보험료 (G112)", v("G112"), "");
    ln(r++, "=", "사회보험료 소계", `=SUM(D${sr1}:D${sr1 + 3})`, "", true);
    r++;
    sh(r, "③ 기타소득공제"); r++;
    const sr2 = r;
    ln(r++, "+", "벤처투자공제 (G218)", v("G218"), "");
    ln(r++, "+", "소기업공제부금 (G219)", v("G219"), "노란우산공제");
    ln(r++, "+", "신용카드공제 (G225)", v("G225"), "▶ 다음 시트 상세");
    ln(r++, "+", "주택임차차입금 (G113)", v("G113"), "");
    ln(r++, "+", "장기주택저당이자 (G115)", v("G115"), "");
    ln(r++, "=", "기타공제 소계", `=SUM(D${sr2}:D${sr2 + 4})`, "", true);
    r++;
    sh(r, "▣ 소득공제 합계"); r++;
    ln(r++, "=", "총 소득공제", `=D10+D${sr1 + 4}+D${sr2 + 5}`, "인적+사회보험+기타", true, true);
    xRange(ws, `A1:E${r}`);
    XLSX.utils.book_append_sheet(wb, ws, "4.소득공제");
  }

  // --- Sheet 4-1: 신용카드공제 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 32, 18, 18, 22, 40]);
    xCell(ws, "B2", "STEP 3-1.  신용카드 등 공제 상세", TITLE_STYLE); xMerge(ws, "B2:F2"); xRowH(ws, 2, 28);
    xCell(ws, "B4", "① 사용금액 명세", STEP_STYLE); xMerge(ws, "B4:F4");
    ["항목코드", "사용수단", "사용금액(원)", "공제율", "구분"].forEach((h, i) => xCell(ws, `${"BCDEF"[i]}5`, h, HEAD_STYLE));
    const cards: [string, string, number, number, string][] = [
      ["G223", "신용카드 사용", v("G223"), 0.15, "일반"],
      ["G205", "현금영수증", v("G205"), 0.30, "일반"],
      ["G222", "직불·선불카드", v("G222"), 0.30, "일반"],
      ["G257", "도서·문화 신용카드", v("G257"), 0.30, "도서·공연 등"],
      ["G228", "전통시장 사용", v("G228"), 0.40, "추가 공제"],
      ["G240", "대중교통 사용", v("G240"), 0.40, "추가 공제"],
    ];
    let r = 6;
    cards.forEach(([code, name, amt, rate, cat]) => {
      xCell(ws, `B${r}`, code, S({ align: ALC, border: true }));
      xCell(ws, `C${r}`, name, S({ align: ALL, border: true }));
      xCell(ws, `D${r}`, amt, S({ align: ALR, border: true, color: "0000FF", fmt: "#,##0" }));
      xCell(ws, `E${r}`, rate, S({ align: ALR, border: true, fmt: "0%" }));
      xCell(ws, `F${r}`, cat, S({ align: ALL, border: true }));
      r++;
    });
    xCell(ws, `C${r}`, "합계 (G913)", S({ fill: RES_FILL, bold: true, align: ALL, border: true }));
    xCell(ws, `D${r}`, `=SUM(D6:D${r - 1})`, S({ fill: RES_FILL, bold: true, align: ALR, color: "0000FF", border: true, fmt: "#,##0" }));
    ["B", "E", "F"].forEach((col) => xCell(ws, `${col}${r}`, "", S({ fill: RES_FILL, border: true })));
    r += 2;
    xCell(ws, `B${r}`, "② 공제액 결과", STEP_STYLE); xMerge(ws, `B${r}:F${r}`); r++;
    const calcs: [string, number, string][] = [
      ["전통시장 추가공제 (G230)", v("G230"), "별도 100만원 한도"],
      ["대중교통 추가공제 (G237)", v("G237"), "별도 100만원 한도"],
      ["신용카드등공제액 기본 (G232)", v("G232"), "총급여 구간별 한도"],
      ["신용카드등공제액 합계 (G225)", v("G225"), "기본+전통+대중교통"],
    ];
    calcs.forEach(([name, amt, note], i) => {
      const isF = i >= 2;
      const fill = isF ? FIN_FILL : undefined;
      xCell(ws, `B${r}`, name, S({ fill, align: ALL, border: true, bold: isF, size: isF ? 12 : 11 })); xMerge(ws, `B${r}:C${r}`);
      xCell(ws, `D${r}`, amt, S({ fill, align: ALR, border: true, bold: isF, color: "0000FF", fmt: "#,##0", size: isF ? 12 : 11 }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isF, size: isF ? 12 : 11 })); xMerge(ws, `E${r}:F${r}`);
      r++;
    });
    xRange(ws, `A1:F${r}`);
    XLSX.utils.book_append_sheet(wb, ws, "4-1.신용카드공제");
  }

  // --- Sheet 5: 과세표준·산출세액 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 34, 22, 44]);
    xCell(ws, "B2", "STEP 4-5.  과세표준 → 산출세액", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    ["부호", "항목", "금액(원)", "설명"].forEach((h, i) => xCell(ws, `${"BCDE"[i]}4`, h, HEAD_STYLE));
    const base = v("G211"), inc = v("S301"), ded = inc - base, tax = v("G212");
    const brackets: [number, number, number][] = [
      [14000000, 0.06, 0], [50000000, 0.15, 1260000], [88000000, 0.24, 5760000],
      [150000000, 0.35, 15440000], [300000000, 0.38, 19940000], [500000000, 0.40, 25940000],
      [1000000000, 0.42, 35940000], [Infinity, 0.45, 65940000],
    ];
    let ai = 0;
    for (let i = 0; i < brackets.length; i++) { if (base <= brackets[i][0]) { ai = i; break; } }
    const [, rate, dval] = brackets[ai];
    const rows5: [string, string, number | string, string][] = [
      ["+", "근로소득금액", inc, "STEP 2 결과"],
      ["−", "소득공제 합계", ded, "인적+보험+기타"],
      ["=", "과세표준 (G211)", "=D5-D6", "▶ 세율 적용 기준"],
      ["×", `세율 ${(rate * 100).toFixed(0)}% 구간`, "", `과세표준×${(rate * 100).toFixed(0)}% − ${(dval / 10000).toLocaleString()}만원`],
      ["=", "산출세액 (G212)", tax, "▶ 세액공제 전 세금"],
    ];
    let r = 5;
    rows5.forEach(([sign, name, val, note]) => {
      const isFinal = sign === "=" && r === 9;
      const isSum = sign === "=";
      const fill = isFinal ? FIN_FILL : isSum ? RES_FILL : undefined;
      const fc = typeof val === "number" ? "0000FF" : "000000";
      xCell(ws, `B${r}`, sign, S({ fill, align: ALC, border: true, bold: isSum, size: isFinal ? 12 : 11 }));
      xCell(ws, `C${r}`, name, S({ fill, align: ALL, border: true, bold: isSum, size: isFinal ? 12 : 11 }));
      xCell(ws, `D${r}`, val, S({ fill, align: ALR, border: true, bold: isSum, color: fc, size: isFinal ? 12 : 11, fmt: "#,##0" }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isSum, size: isFinal ? 12 : 11 }));
      r++;
    });
    xCell(ws, "B11", "참고 — 종합소득세율", STEP_STYLE); xMerge(ws, "B11:E11");
    const tt = [
      ["과세표준 구간", "세율", "누진공제"],
      ["1,400만원 이하", "6%", "−"], ["1,400만~5,000만원", "15%", "126만원"],
      ["5,000만~8,800만원", "24%", "576만원"], ["8,800만~1.5억원", "35%", "1,544만원"],
      ["1.5억~3억원", "38%", "1,994만원"], ["3억~5억원", "40%", "2,594만원"],
      ["5억~10억원", "42%", "3,594만원"], ["10억원 초과", "45%", "6,594만원"],
    ];
    r = 12;
    tt.forEach((row, i) => {
      const isApp = i - 1 === ai;
      const fill = i === 0 ? SUB_FILL : isApp ? RES_FILL : undefined;
      const bold = i === 0 || isApp;
      xCell(ws, `B${r}`, row[0] + (isApp ? "  ◀ 본 건" : ""), S({ fill, align: ALL, border: true, bold })); xMerge(ws, `B${r}:C${r}`);
      xCell(ws, `D${r}`, row[1], S({ fill, align: ALC, border: true, bold }));
      xCell(ws, `E${r}`, row[2], S({ fill, align: ALL, border: true, bold }));
      r++;
    });
    xRange(ws, `A1:E${r}`);
    XLSX.utils.book_append_sheet(wb, ws, "5.과세표준_산출세액");
  }

  // --- Sheet 6: 세액공제 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 36, 20, 44]);
    xCell(ws, "B2", "STEP 6.  세액공제", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    ["부호", "항목", "금액(원)", "설명"].forEach((h, i) => xCell(ws, `${"BCDE"[i]}4`, h, HEAD_STYLE));
    const rows6: [string, string, number | string, string][] = [
      ["+", "근로소득세액공제 (G304)", v("G304"), "산출세액 기준 자동계산"],
      ["+", "자녀세액공제 (G312)", v("G312"), "자녀 수에 따른 공제"],
      ["+", "보장성보험료 세액공제 (G317)", v("G317"), "보험료×12%, 한도 12만원"],
      ["+", "의료비 세액공제 (G318)", v("G318"), "총급여 3% 초과분×15%"],
      ["+", "교육비 세액공제 (G319)", v("G319"), "교육비×15%"],
      ["+", "기부금 세액공제 (G322)", v("G322"), "기부금×15%(초과분30%)"],
      ["+", "퇴직연금 세액공제 (G315)", v("G315"), "DC추가납입×12%"],
      ["+", "연금저축 세액공제 (G316)", v("G316"), "납입액×12%"],
      ["=", "세액공제 합계 (G309)", "=SUM(D5:D12)", "▶ 산출세액에서 차감"],
    ];
    let r = 5;
    rows6.forEach(([sign, name, val, note]) => {
      const isFinal = sign === "=";
      const fc = typeof val === "number" ? "0000FF" : "000000";
      const fill = isFinal ? FIN_FILL : undefined;
      xCell(ws, `B${r}`, sign, S({ fill, align: ALC, border: true, bold: isFinal, size: isFinal ? 12 : 11 }));
      xCell(ws, `C${r}`, name, S({ fill, align: ALL, border: true, bold: isFinal, size: isFinal ? 12 : 11 }));
      xCell(ws, `D${r}`, val, S({ fill, align: ALR, border: true, bold: isFinal, color: fc, size: isFinal ? 12 : 11, fmt: "#,##0" }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isFinal, size: isFinal ? 12 : 11 }));
      r++;
    });
    xRange(ws, "A1:E14");
    XLSX.utils.book_append_sheet(wb, ws, "6.세액공제");
  }

  // --- Sheet 7: 결정·환급 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 34, 22, 42]);
    xCell(ws, "B2", "STEP 7-8.  결정세액 → 환급/납부", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    ["부호", "항목", "금액(원)", "설명"].forEach((h, i) => xCell(ws, `${"BCDE"[i]}4`, h, HEAD_STYLE));
    const rows7: [string, string, number | string, string, string?][] = [
      ["+", "산출세액 (G212)", v("G212"), "STEP 5"],
      ["−", "세액공제 합계 (G309)", v("G309"), "STEP 6"],
      ["=", "결정세액 소득세 (G901)", "=D5-D6", "▶ 최종 소득세", "row-result"],
      ["=", "지방소득세 (G902)", "=ROUND(D7*0.1,0)", "결정세액×10%", "row-result"],
      ["", "", "", ""],
      ["+", "기납부 소득세 (G907)", v("G907"), "원천징수 누계"],
      ["+", "기납부 지방소득세 (G908)", v("G908"), "원천징수 누계"],
      ["", "", "", ""],
      ["=", "차감 소득세 (G910)", "=D7-D10", "음수=환급, 양수=납부", "final"],
      ["=", "차감 지방소득세 (G911)", "=D8-D11", "음수=환급, 양수=납부", "final"],
      ["=", "총 환급(△)/납부(▼) 합계", "=D13+D14", "★ 최종 정산액", "final"],
    ];
    let r = 5;
    rows7.forEach(([sign, name, val, note, cls]) => {
      if (name === "") { r++; return; }
      const isF = cls === "final";
      const isR = sign === "=";
      const fill = isF ? FIN_FILL : isR ? RES_FILL : undefined;
      const fc = typeof val === "number" ? "0000FF" : "000000";
      xCell(ws, `B${r}`, sign, S({ fill, align: ALC, border: true, bold: isR, size: isF ? 13 : 11 }));
      xCell(ws, `C${r}`, name, S({ fill, align: ALL, border: true, bold: isR, size: isF ? 13 : 11 }));
      xCell(ws, `D${r}`, val, S({ fill, align: ALR, border: true, bold: isR, color: isF ? "C00000" : fc, size: isF ? 13 : 11, fmt: "#,##0;[Red](#,##0)" }));
      xCell(ws, `E${r}`, note, S({ fill, align: ALL, border: true, bold: isR, size: isF ? 13 : 11 }));
      r++;
    });
    xRange(ws, `A1:E${r}`);
    XLSX.utils.book_append_sheet(wb, ws, "7.결정·환급");
  }

  // --- Sheet 8: 초과사용액분석 ---
  {
    const ws: WS = {};
    xCols(ws, [4, 6, 40, 22, 50]);
    xCell(ws, "B2", "STEP 9.  신용카드 초과 사용액 분석", TITLE_STYLE); xMerge(ws, "B2:E2"); xRowH(ws, 2, 28);
    ["부호", "항목", "금액(원)", "설명"].forEach((h, i) => xCell(ws, `${"BCDE"[i]}4`, h, HEAD_STYLE));
    const ts = v("S030");
    const c15 = v("G223") + v("G257");
    const c30 = v("G205") + v("G222") + v("G258") + v("G259");
    const total = c15 + c30;
    const cap = ts <= 70000000 ? 3000000 : 2500000;
    const th = Math.round(ts * 0.25);
    const req = Math.round(th + cap / 0.3);
    const exc = total - req;
    let r = 5;
    xCell(ws, `B${r}`, "■ 기준 금액", STEP_STYLE); xMerge(ws, `B${r}:E${r}`); r++;
    ([
      ["+", "총급여 (S030)", ts, ""],
      ["×", "25% 문턱", th, "총급여×25% — 이상 써야 공제"],
      ["→", "공제 한도", cap, ts <= 70000000 ? "7천만 이하 → 300만" : "7천만 초과 → 250만"],
    ] as [string, string, number, string][]).forEach(([s, n, vl, nt]) => {
      const fill = s !== "+" ? RES_FILL : undefined;
      xCell(ws, `B${r}`, s, S({ align: ALC, border: true, fill, bold: s !== "+" }));
      xCell(ws, `C${r}`, n, S({ align: ALL, border: true, fill, bold: s !== "+" }));
      xCell(ws, `D${r}`, vl, S({ align: ALR, border: true, fill, bold: s !== "+", color: "0000FF", fmt: "#,##0" }));
      xCell(ws, `E${r}`, nt, S({ align: ALL, border: true, fill }));
      r++;
    });
    r++;
    xCell(ws, `B${r}`, "■ 일반 카드 사용 합계", STEP_STYLE); xMerge(ws, `B${r}:E${r}`); r++;
    xCell(ws, `B${r}`, "+", S({ align: ALC, border: true }));
    xCell(ws, `C${r}`, "15% 그룹 (신용카드+문화)", S({ align: ALL, border: true }));
    xCell(ws, `D${r}`, c15, S({ align: ALR, border: true, color: "0000FF", fmt: "#,##0" }));
    xCell(ws, `E${r}`, "G223+G257", S({ align: ALL, border: true })); r++;
    xCell(ws, `B${r}`, "+", S({ align: ALC, border: true }));
    xCell(ws, `C${r}`, "30% 그룹 (현금·직불)", S({ align: ALL, border: true }));
    xCell(ws, `D${r}`, c30, S({ align: ALR, border: true, color: "0000FF", fmt: "#,##0" }));
    xCell(ws, `E${r}`, "G205+G222", S({ align: ALL, border: true })); r++;
    xCell(ws, `B${r}`, "=", S({ align: ALC, border: true, bold: true, fill: RES_FILL, size: 12 }));
    xCell(ws, `C${r}`, "일반 카드 합계", S({ align: ALL, border: true, bold: true, fill: RES_FILL, size: 12 }));
    xCell(ws, `D${r}`, total, S({ align: ALR, border: true, bold: true, color: "0000FF", fmt: "#,##0", fill: RES_FILL, size: 12 }));
    xCell(ws, `E${r}`, "한도분석 대상", S({ align: ALL, border: true, fill: RES_FILL })); r++;
    r++;
    xCell(ws, `B${r}`, "■ 한도 달성 분석", STEP_STYLE); xMerge(ws, `B${r}:E${r}`); r++;
    xCell(ws, `B${r}`, "?", S({ align: ALC, border: true, fill: FIN_FILL, bold: true }));
    xCell(ws, `C${r}`, "한도 달성 최소 사용액", S({ align: ALL, border: true, bold: true, fill: FIN_FILL, size: 12 }));
    xCell(ws, `D${r}`, req, S({ align: ALR, border: true, bold: true, color: "0000FF", fmt: "#,##0", fill: FIN_FILL, size: 12 }));
    xCell(ws, `E${r}`, "25% 문턱 + (한도÷30%)", S({ align: ALL, border: true, fill: FIN_FILL })); r++;
    xCell(ws, `B${r}`, "=", S({ align: ALC, border: true, bold: true, fill: FIN_FILL, size: 13 }));
    xCell(ws, `C${r}`, "초과 사용액 (세제혜택 없음)", S({ align: ALL, border: true, bold: true, fill: FIN_FILL, size: 13 }));
    xCell(ws, `D${r}`, exc, S({ align: ALR, border: true, bold: true, color: "C00000", fmt: "#,##0;[Red](#,##0)", fill: FIN_FILL, size: 13 }));
    xCell(ws, `E${r}`, exc > 0 ? "한도초과 — 줄여도 동일공제" : "한도미달 — 더 쓰면 공제가능", S({ align: ALL, border: true, fill: FIN_FILL, size: 12, bold: true })); r++;
    xRange(ws, `A1:E${r + 1}`);
    XLSX.utils.book_append_sheet(wb, ws, "8.초과사용액분석");
  }

  return wb;
}

export function downloadSettlementExcel(result: SettlementResult, filenamePrefix = "연말정산계산") {
  const d = buildCodeMap(result);
  const wb = buildWorkbook(d);
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  XLSX.writeFile(wb, `${filenamePrefix}_${stamp}.xlsx`);
}
