// 연말정산_통합계산기.html의 계산 로직을 TypeScript로 이식
// DOM 대신 SettlementInput 객체를 입력으로 받는다.

export interface SettlementInput {
  S001: number; // 급여소득
  S002: number; // 상여소득
  S013: number; // 자가운전보조금 비과세
  nontaxEtc: number; // 기타 비과세

  G004: number; // 부양가족공제
  G007: number; // 경로우대공제
  G008: number; // 장애인공제
  G009: number; // 부녀자공제
  G010: number; // 한부모공제

  G015: number; // 국민연금
  G111: number; // 건강보험료
  G154: number; // 장기요양보험료
  G112: number; // 고용보험료

  G223: number; // 신용카드
  G205: number; // 현금영수증
  G222: number; // 직불·체크카드
  G257: number; // 도서·공연·문화
  G228: number; // 전통시장
  G240: number; // 대중교통

  G218: number; // 벤처투자조합 출자공제
  G219: number; // 소기업·소상공인 공제부금
  G113: number; // 주택임차차입금 원리금상환액
  G115: number; // 장기주택저당차입금 이자상환액

  G312: number; // 자녀세액공제
  G317: number; // 보장성보험료 세액공제
  G319: number; // 교육비 세액공제
  G322: number; // 기부금 세액공제
  G315: number; // 퇴직연금(DC) 세액공제
  G316: number; // 연금저축 세액공제
  G318: number; // 의료비 세액공제

  G907: number; // 기납부 소득세
  G908: number; // 기납부 지방소득세
}

export interface CardDeductionResult {
  cc: number;
  cash: number;
  dc: number;
  cult: number;
  trad: number;
  tran: number;
  total15: number;
  total30: number;
  allGeneral: number;
  threshold: number;
  base: number;
  basicCap: number;
  baseDeduct: number;
  tradDeduct: number;
  tranDeduct: number;
  total: number;
}

export interface SettlementResult {
  salary: number;
  bonus: number;
  nonTax13: number;
  nonTaxEtc: number;
  nonTaxSum: number;
  totalSalary: number;
  laborDed: number;
  earnedIncome: number;
  selfDed: number;
  depDed: number;
  elderDed: number;
  disabDed: number;
  womanDed: number;
  singleDed: number;
  personalDed: number;
  pension: number;
  health: number;
  ltcare: number;
  employ: number;
  insurDed: number;
  card: CardDeductionResult;
  venture: number;
  smallbiz: number;
  rentLoan: number;
  mtgInt: number;
  otherDed: number;
  totalDeduction: number;
  taxBase: number;
  calcTax: number;
  laborCredit: number;
  childCredit: number;
  insCredit: number;
  eduCredit: number;
  donCredit: number;
  retCredit: number;
  penCredit: number;
  medCredit: number;
  totalCredit: number;
  finalIncomeTax: number;
  finalLocalTax: number;
  withheldIncome: number;
  withheldLocal: number;
  diffIncome: number;
  diffLocal: number;
  totalDiff: number;
}

// ===================================================================
//  근로소득공제 계산
// ===================================================================
export function calcLaborDeduction(salary: number): number {
  if (salary <= 5000000) return Math.round(salary * 0.70);
  if (salary <= 15000000) return Math.round(3500000 + (salary - 5000000) * 0.40);
  if (salary <= 45000000) return Math.round(7500000 + (salary - 15000000) * 0.15);
  if (salary <= 100000000) return Math.round(12000000 + (salary - 45000000) * 0.05);
  return Math.min(Math.round(14750000 + (salary - 100000000) * 0.02), 20000000);
}

// ===================================================================
//  산출세액 계산
// ===================================================================
export function calcIncomeTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  const brackets: [number, number, number][] = [
    [14000000, 0.06, 0],
    [50000000, 0.15, 1260000],
    [88000000, 0.24, 5760000],
    [150000000, 0.35, 15440000],
    [300000000, 0.38, 19940000],
    [500000000, 0.40, 25940000],
    [1000000000, 0.42, 35940000],
    [Infinity, 0.45, 65940000],
  ];
  for (const [limit, rate, ded] of brackets) {
    if (taxBase <= limit) return Math.round(taxBase * rate - ded);
  }
  return 0;
}

// ===================================================================
//  근로소득세액공제
// ===================================================================
export function calcLaborTaxCredit(calcTax: number, totalSalary: number): number {
  if (calcTax <= 0) return 0;
  let credit: number;
  if (calcTax <= 1300000) credit = Math.round(calcTax * 0.55);
  else credit = Math.round(715000 + (calcTax - 1300000) * 0.30);

  let cap: number;
  if (totalSalary <= 33000000) cap = 740000;
  else if (totalSalary <= 70000000) cap = Math.max(660000 - Math.round((totalSalary - 33000000) * 0.008), 500000);
  else cap = 500000;

  return Math.min(credit, cap);
}

// ===================================================================
//  신용카드 공제 상세 계산
// ===================================================================
export function calcCardDeduction(totalSalary: number, input: SettlementInput): CardDeductionResult {
  const cc = input.G223;
  const cash = input.G205;
  const dc = input.G222;
  const cult = input.G257;
  const trad = input.G228;
  const tran = input.G240;

  const threshold = Math.round(totalSalary * 0.25);
  const total15 = cc + (totalSalary <= 70000000 ? cult : 0);
  const total30 = cash + dc + (totalSalary > 70000000 ? cult : 0);
  const allGeneral = total15 + total30;

  let base = 0;
  if (allGeneral + trad + tran > threshold) {
    const overThreshold = allGeneral - threshold;
    if (overThreshold <= 0) {
      base = 0;
    } else if (overThreshold <= total15) {
      base = Math.round(overThreshold * 0.15);
    } else {
      base = Math.round(total15 * 0.15 + (overThreshold - total15) * 0.30);
    }
  }

  let basicCap: number;
  if (totalSalary <= 70000000) basicCap = 3000000;
  else if (totalSalary <= 120000000) basicCap = 2500000;
  else basicCap = 2000000;

  const baseDeduct = Math.min(base, basicCap);
  const tradDeduct = Math.min(Math.round(trad * 0.40), 1000000);
  const tranDeduct = Math.min(Math.round(tran * 0.40), 1000000);

  return {
    cc, cash, dc, cult, trad, tran,
    total15, total30, allGeneral, threshold,
    base, basicCap, baseDeduct, tradDeduct, tranDeduct,
    total: baseDeduct + tradDeduct + tranDeduct,
  };
}

// ===================================================================
//  전체 계산
// ===================================================================
export function calcSettlement(input: SettlementInput): SettlementResult {
  const salary = input.S001;
  const bonus = input.S002;
  const nonTax13 = input.S013;
  const nonTaxEtc = input.nontaxEtc;
  const nonTaxSum = nonTax13 + nonTaxEtc;
  const totalSalary = Math.max(salary + bonus - nonTaxSum, 0);

  const laborDed = calcLaborDeduction(totalSalary);
  const earnedIncome = Math.max(totalSalary - laborDed, 0);

  const selfDed = 1500000;
  const depDed = input.G004;
  const elderDed = input.G007;
  const disabDed = input.G008;
  const womanDed = input.G009;
  const singleDed = input.G010;
  const personalDed = selfDed + depDed + elderDed + disabDed + womanDed + singleDed;

  const pension = input.G015;
  const health = input.G111;
  const ltcare = input.G154;
  const employ = input.G112;
  const insurDed = health + ltcare + employ;

  const card = calcCardDeduction(totalSalary, input);

  const venture = input.G218;
  const smallbiz = input.G219;
  const rentLoan = input.G113;
  const mtgInt = input.G115;
  const otherDed = venture + smallbiz + card.total + rentLoan + mtgInt;

  const totalDeduction = personalDed + pension + insurDed + otherDed;
  const taxBase = Math.max(earnedIncome - totalDeduction, 0);

  const calcTax = calcIncomeTax(taxBase);

  const laborCredit = calcLaborTaxCredit(calcTax, totalSalary);
  const childCredit = input.G312;
  const insCredit = input.G317;
  const eduCredit = input.G319;
  const donCredit = input.G322;
  const retCredit = input.G315;
  const penCredit = input.G316;
  const medCredit = input.G318;
  const totalCredit = laborCredit + childCredit + insCredit + eduCredit + donCredit + retCredit + penCredit + medCredit;

  const finalIncomeTax = Math.max(calcTax - totalCredit, 0);
  const finalLocalTax = Math.round(finalIncomeTax * 0.1);
  const withheldIncome = input.G907;
  const withheldLocal = input.G908;
  const diffIncome = finalIncomeTax - withheldIncome;
  const diffLocal = finalLocalTax - withheldLocal;
  const totalDiff = diffIncome + diffLocal;

  return {
    salary, bonus, nonTax13, nonTaxEtc, nonTaxSum, totalSalary,
    laborDed, earnedIncome,
    selfDed, depDed, elderDed, disabDed, womanDed, singleDed, personalDed,
    pension, health, ltcare, employ, insurDed,
    card,
    venture, smallbiz, rentLoan, mtgInt, otherDed,
    totalDeduction, taxBase,
    calcTax,
    laborCredit, childCredit, insCredit, eduCredit, donCredit, retCredit, penCredit, medCredit, totalCredit,
    finalIncomeTax, finalLocalTax,
    withheldIncome, withheldLocal,
    diffIncome, diffLocal, totalDiff,
  };
}

// ===================================================================
//  보조 함수 (가이드/결과 표시용)
// ===================================================================
export function getTaxBracket(base: number): { limit: number; rate: number; ded: number } {
  const brackets = [
    { limit: 14000000, rate: 6, ded: 0 },
    { limit: 50000000, rate: 15, ded: 1260000 },
    { limit: 88000000, rate: 24, ded: 5760000 },
    { limit: 150000000, rate: 35, ded: 15440000 },
    { limit: 300000000, rate: 38, ded: 19940000 },
    { limit: 500000000, rate: 40, ded: 25940000 },
    { limit: 1000000000, rate: 42, ded: 35940000 },
    { limit: Infinity, rate: 45, ded: 65940000 },
  ];
  for (const b of brackets) if (base <= b.limit) return b;
  return brackets[brackets.length - 1];
}

export function getLaborBracketDesc(salary: number): string {
  if (salary <= 5000000) return "총급여 × 70%";
  if (salary <= 15000000) return "350만 + 초과분×40%";
  if (salary <= 45000000) return "750만 + 초과분×15%";
  if (salary <= 100000000) return "1,200만 + 초과분×5%";
  return "1,475만 + 초과분×2%";
}

export function moneyStr(v: number): string {
  if (v === 0) return "0";
  return (v < 0 ? "△" : "") + Math.abs(v).toLocaleString();
}
