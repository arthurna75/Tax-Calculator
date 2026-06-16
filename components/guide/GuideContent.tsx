"use client";

const TOC = [
  ["g1", "① 연말정산이란?"],
  ["g2", "② 계산 흐름"],
  ["g3", "③ 총급여액"],
  ["g4", "④ 근로소득공제"],
  ["g5", "⑤ 소득공제"],
  ["g6", "⑥ 신용카드 공제"],
  ["g7", "⑦ 세율표"],
  ["g8", "⑧ 세액공제"],
  ["g9", "⑨ 결정세액"],
  ["g10", "⑩ 절세 팁 & FAQ"],
];

function scrollGuide(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function GuideContent() {
  return (
    <div className="guide-page">
      <div className="guide-toc">
        {TOC.map(([id, label]) => (
          <button key={id} className="guide-toc-btn" onClick={() => scrollGuide(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="guide-section" id="g1">
        <h2>① 연말정산이란?</h2>
        <p>
          연말정산은 근로소득자가 1년간 납부한 <strong>원천징수세액</strong>과 실제로 내야 할{" "}
          <strong>결정세액</strong>의 차액을 정산하는 절차입니다. 매년 2월 급여에서 환급하거나 추가 징수합니다.
        </p>
        <div className="tip-box">
          <div className="tip-title">📅 연말정산 일정 (2025년도 귀속 기준)</div>
          <ul>
            <li><strong>1월 중</strong> — 국세청 간소화 서비스 자료 제공 (홈택스 접속)</li>
            <li><strong>1~2월</strong> — 회사에 공제 증빙서류 제출</li>
            <li><strong>2월 급여</strong> — 환급 또는 추가 징수</li>
            <li><strong>3월 10일</strong> — 회사가 지급명세서 국세청 제출 마감</li>
          </ul>
        </div>
        <div className="warn-box">
          <p>
            ⚠️ 이 계산기는 <strong>2025년 귀속(2026년 정산)</strong> 세율·한도를 기준으로 합니다. 세법은 매년
            개정될 수 있으니 실제 신고 시 국세청 고시를 확인하세요.
          </p>
        </div>
      </div>

      <div className="guide-section" id="g2">
        <h2>② 계산 흐름 한눈에 보기</h2>
        <p>연말정산 계산은 아래 8단계를 순서대로 따릅니다.</p>
        <div className="flow-diagram">
          <div className="flow-box">급여 + 상여 = 소득총액</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-op">− 비과세 (자가운전, 식대 등)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-box">총급여액 (STEP 1)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-op">− 근로소득공제 (구간별 공제)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-box">근로소득금액 (STEP 2)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-op">− 각종 소득공제 (인적·보험료·신용카드 등)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-box">과세표준 (STEP 4)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-op">× 세율 (6%~45% 누진)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-box">산출세액 (STEP 5)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-op">− 세액공제 (근로·자녀·보험·교육·기부 등)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-box">결정세액 (STEP 7)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-op">− 기납부세액 (매월 원천징수 합계)</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-box result">환급(▲) 또는 추가납부(▼) (STEP 8)</div>
        </div>
      </div>

      <div className="guide-section" id="g3">
        <h2>③ 총급여액 계산</h2>
        <p>총급여액은 모든 소득에서 비과세 항목을 뺀 금액입니다. 이후 모든 계산의 기준이 됩니다.</p>
        <table className="guide-table">
          <tbody>
            <tr><th>항목</th><th>코드</th><th>비고</th></tr>
            <tr><td>급여소득</td><td>S001</td><td>기본급 연간 합계</td></tr>
            <tr><td>상여소득</td><td>S002</td><td>성과급, 명절상여 등</td></tr>
            <tr><td>(−) 자가운전보조금 비과세</td><td>S013</td><td>월 20만원 × 12개월 한도</td></tr>
            <tr><td>(−) 식대 비과세</td><td>—</td><td>월 20만원 한도 (2023년부터 인상)</td></tr>
            <tr><td>(−) 야간근로수당 비과세</td><td>—</td><td>생산직·운전직 등 연 240만원 한도</td></tr>
            <tr className="highlight"><td><strong>= 총급여액</strong></td><td>S030</td><td><strong>이후 모든 계산의 기준</strong></td></tr>
          </tbody>
        </table>
      </div>

      <div className="guide-section" id="g4">
        <h2>④ 근로소득공제 구간표</h2>
        <p>총급여액에서 세금을 내지 않아도 되는 기본 공제액입니다. 급여가 낮을수록 공제율이 높습니다.</p>
        <table className="guide-table">
          <tbody>
            <tr><th>총급여액 구간</th><th>공제액 계산식</th><th className="right">최대 공제액</th></tr>
            <tr><td>500만원 이하</td><td>총급여 × 70%</td><td className="right">350만원</td></tr>
            <tr><td>500만 ~ 1,500만원</td><td>350만 + (총급여 − 500만) × 40%</td><td className="right">750만원</td></tr>
            <tr><td>1,500만 ~ 4,500만원</td><td>750만 + (총급여 − 1,500만) × 15%</td><td className="right">1,200만원</td></tr>
            <tr><td>4,500만 ~ 1억원</td><td>1,200만 + (총급여 − 4,500만) × 5%</td><td className="right">1,475만원</td></tr>
            <tr className="highlight"><td>1억원 초과</td><td>1,475만 + (총급여 − 1억) × 2%</td><td className="right">2,000만원 한도</td></tr>
          </tbody>
        </table>
        <div className="tip-box">
          <div className="tip-title">💡 예시</div>
          <p>총급여 5,000만원인 경우: 1,200만 + (5,000만 − 4,500만) × 5% = 1,200만 + 25만 = <strong>1,225만원 공제</strong></p>
        </div>
      </div>

      <div className="guide-section" id="g5">
        <h2>⑤ 소득공제 종류 및 한도</h2>
        <h3>인적공제</h3>
        <table className="guide-table">
          <tbody>
            <tr><th>구분</th><th>공제액</th><th>요건</th></tr>
            <tr><td>본인 기본공제</td><td className="right">150만원</td><td>무조건 적용</td></tr>
            <tr><td>부양가족 기본공제</td><td className="right">1인당 150만원</td><td>연소득 100만원 이하 (근로소득만 있는 경우 500만원 이하)</td></tr>
            <tr><td>경로우대 추가공제</td><td className="right">1인당 100만원</td><td>기본공제 대상자 중 70세 이상</td></tr>
            <tr><td>장애인 추가공제</td><td className="right">1인당 200만원</td><td>기본공제 대상자 중 장애인</td></tr>
            <tr><td>부녀자공제</td><td className="right">50만원</td><td>여성 근로자로 배우자 있거나 부양가족 있는 세대주 (종합소득 3천만 이하)</td></tr>
            <tr><td>한부모공제</td><td className="right">100만원</td><td>배우자 없이 자녀(입양아 포함) 부양 (부녀자공제와 중복 불가)</td></tr>
          </tbody>
        </table>
        <h3>사회보험료 공제</h3>
        <table className="guide-table">
          <tbody>
            <tr><th>항목</th><th>공제 한도</th><th>비고</th></tr>
            <tr><td>국민연금보험료</td><td>납입액 전액</td><td>본인부담분만 해당</td></tr>
            <tr><td>건강보험료 + 장기요양보험료</td><td>납입액 전액</td><td>본인부담분만 해당</td></tr>
            <tr><td>고용보험료</td><td>납입액 전액</td><td>본인부담분만 해당</td></tr>
          </tbody>
        </table>
        <h3>주택 관련 공제</h3>
        <table className="guide-table">
          <tbody>
            <tr><th>항목</th><th>한도</th><th>요건</th></tr>
            <tr><td>주택임차차입금 원리금 상환액</td><td>상환액의 40%, 연 400만원 한도</td><td>무주택 세대주, 국민주택규모 이하 전세</td></tr>
            <tr><td>장기주택저당차입금 이자상환액</td><td>300만~1,800만원</td><td>무주택 또는 1주택 세대주, 주택가액 6억 이하</td></tr>
          </tbody>
        </table>
      </div>

      <div className="guide-section" id="g6">
        <h2>⑥ 신용카드 등 공제 상세 계산법</h2>
        <div className="warn-box">
          <p>⚠️ <strong>핵심 원칙:</strong> 신용카드 공제는 총급여의 25%를 초과하는 금액부터 시작됩니다. 25% 미만 사용은 공제가 전혀 없습니다.</p>
        </div>
        <h3>공제율 비교</h3>
        <table className="guide-table">
          <tbody>
            <tr><th>사용 수단</th><th className="center">공제율</th><th>비고</th></tr>
            <tr><td>신용카드</td><td className="center">15%</td><td>일반 신용카드</td></tr>
            <tr><td>직불카드·체크카드·선불카드</td><td className="center">30%</td><td>은행 체크카드 등</td></tr>
            <tr><td>현금영수증</td><td className="center">30%</td><td>현금결제 후 영수증 발급분</td></tr>
            <tr><td>도서·공연·박물관·미술관</td><td className="center">30%</td><td>총급여 7천만원 이하 근로자만 적용</td></tr>
            <tr><td>전통시장 사용액</td><td className="center">40%</td><td>별도 추가한도 100만원</td></tr>
            <tr><td>대중교통 사용액</td><td className="center">40%</td><td>별도 추가한도 100만원</td></tr>
          </tbody>
        </table>
        <h3>공제 한도</h3>
        <table className="guide-table">
          <tbody>
            <tr><th>총급여 구간</th><th className="right">기본 한도</th><th>추가 한도</th></tr>
            <tr><td>7,000만원 이하</td><td className="right">300만원</td><td>전통시장 +100만, 대중교통 +100만</td></tr>
            <tr><td>7,000만 ~ 1억 2천만원</td><td className="right">250만원</td><td>전통시장 +100만, 대중교통 +100만</td></tr>
            <tr><td>1억 2천만원 초과</td><td className="right">200만원</td><td>전통시장 +100만, 대중교통 +100만</td></tr>
          </tbody>
        </table>
        <div className="tip-box">
          <div className="tip-title">💡 계산 예시 (총급여 5,000만원, 신용카드만 2,500만원 사용)</div>
          <ul>
            <li>25% 기준금액 = 5,000만 × 25% = <strong>1,250만원</strong></li>
            <li>공제 대상금액 = 2,500만 − 1,250만 = <strong>1,250만원</strong></li>
            <li>공제액 = 1,250만 × 15% = <strong>187.5만원</strong></li>
            <li>기본 한도 300만원 이내이므로 <strong>187.5만원 전액 공제</strong></li>
          </ul>
        </div>
      </div>

      <div className="guide-section" id="g7">
        <h2>⑦ 종합소득세율표 (2025년 기준)</h2>
        <p>과세표준(근로소득금액 − 소득공제)에 아래 세율을 적용합니다. 누진공제액을 빼면 간단히 계산할 수 있습니다.</p>
        <table className="guide-table">
          <tbody>
            <tr><th>과세표준 구간</th><th className="center">세율</th><th className="right">누진공제</th><th>산출세액 계산식</th></tr>
            <tr><td>1,400만원 이하</td><td className="center">6%</td><td className="right">—</td><td>과세표준 × 6%</td></tr>
            <tr><td>1,400만 ~ 5,000만원</td><td className="center">15%</td><td className="right">126만원</td><td>과세표준 × 15% − 126만</td></tr>
            <tr><td>5,000만 ~ 8,800만원</td><td className="center">24%</td><td className="right">576만원</td><td>과세표준 × 24% − 576만</td></tr>
            <tr><td>8,800만 ~ 1억 5천만원</td><td className="center">35%</td><td className="right">1,544만원</td><td>과세표준 × 35% − 1,544만</td></tr>
            <tr><td>1억 5천만 ~ 3억원</td><td className="center">38%</td><td className="right">1,994만원</td><td>과세표준 × 38% − 1,994만</td></tr>
            <tr><td>3억 ~ 5억원</td><td className="center">40%</td><td className="right">2,594만원</td><td>과세표준 × 40% − 2,594만</td></tr>
            <tr><td>5억 ~ 10억원</td><td className="center">42%</td><td className="right">3,594만원</td><td>과세표준 × 42% − 3,594만</td></tr>
            <tr className="highlight"><td>10억원 초과</td><td className="center">45%</td><td className="right">6,594만원</td><td>과세표준 × 45% − 6,594만</td></tr>
          </tbody>
        </table>
        <div className="tip-box">
          <div className="tip-title">💡 지방소득세</div>
          <p>결정세액(소득세)의 10%를 별도로 납부합니다. 소득세와 함께 환급 또는 추가납부 됩니다.</p>
        </div>
      </div>

      <div className="guide-section" id="g8">
        <h2>⑧ 세액공제 종류 및 한도</h2>
        <p>소득공제는 <em>과세표준을 줄이는</em> 효과이고, 세액공제는 <em>계산된 세금을 직접 줄이는</em> 효과입니다. 따라서 세액공제가 더 강력합니다.</p>
        <table className="guide-table">
          <tbody>
            <tr><th>항목</th><th>공제율</th><th>한도</th><th>주요 요건</th></tr>
            <tr><td>근로소득세액공제</td><td>산출세액 기준</td><td>50만~74만원</td><td>근로소득자 자동 적용 (총급여 3,300만 초과 시 한도 감소)</td></tr>
            <tr><td>자녀세액공제</td><td>정액</td><td>1명:15만, 2명:35만, 3명~:65만+30만씩</td><td>8세 이상 기본공제 대상 자녀</td></tr>
            <tr><td>보장성보험료 세액공제</td><td>12%</td><td>납입액 100만원 한도 → 최대 12만원</td><td>본인·부양가족 보장성보험</td></tr>
            <tr><td>장애인전용보장성보험</td><td>15%</td><td>납입액 100만원 한도 → 최대 15만원</td><td>장애인 피보험자</td></tr>
            <tr><td>의료비 세액공제</td><td>15%</td><td>총급여 3% 초과분, 난임·미숙아 20%</td><td>본인·부양가족 의료비 (건강보험산정특례 30%)</td></tr>
            <tr><td>교육비 세액공제</td><td>15%</td><td>본인: 전액, 유치원~고교: 300만, 대학: 900만</td><td>본인·부양가족 교육비</td></tr>
            <tr><td>기부금 세액공제</td><td>15% / 30%</td><td>1천만원 이하 15%, 초과분 30%</td><td>법정·지정기부금 (종교단체 10%)</td></tr>
            <tr><td>연금저축 세액공제</td><td>12% (15%)</td><td>납입액 600만원 한도 (총급여 5,500만 이하 15%)</td><td>연금저축, IRP 합산 900만원 한도</td></tr>
            <tr><td>퇴직연금(DC) 추가납입</td><td>12% (15%)</td><td>연금저축과 합산 900만원 한도</td><td>DC형 퇴직연금 자기부담 추가납입</td></tr>
          </tbody>
        </table>
      </div>

      <div className="guide-section" id="g9">
        <h2>⑨ 결정세액 및 환급/추납 계산</h2>
        <table className="guide-table">
          <tbody>
            <tr><th>단계</th><th>계산</th><th>결과</th></tr>
            <tr><td>산출세액</td><td>과세표준 × 세율</td><td>G212</td></tr>
            <tr><td>결정세액(소득세)</td><td>산출세액 − 세액공제 합계</td><td>G901</td></tr>
            <tr><td>지방소득세</td><td>결정세액(소득세) × 10%</td><td>G902</td></tr>
            <tr><td>기납부 소득세</td><td>매월 원천징수 소득세 합계</td><td>G907</td></tr>
            <tr><td>기납부 지방소득세</td><td>매월 원천징수 지방세 합계</td><td>G908</td></tr>
            <tr className="highlight"><td><strong>차감 소득세</strong></td><td>결정세액 − 기납부 소득세</td><td><strong>G910 (음수=환급, 양수=납부)</strong></td></tr>
            <tr className="highlight"><td><strong>차감 지방소득세</strong></td><td>지방소득세 − 기납부 지방세</td><td><strong>G911</strong></td></tr>
          </tbody>
        </table>
        <div className="tip-box">
          <div className="tip-title">🔑 환급받는 이유</div>
          <p>매월 원천징수는 간이세액표 기준으로 약간 많이 떼는 구조입니다. 각종 공제를 적용한 실제 세금이 이보다 적으면 차액을 2월 급여에서 환급합니다.</p>
        </div>
      </div>

      <div className="guide-section" id="g10">
        <h2>⑩ 절세 팁 & FAQ</h2>
        <div className="tip-box">
          <div className="tip-title">💡 절세 핵심 전략 5가지</div>
          <ul>
            <li><strong>체크카드·현금영수증 비율 높이기:</strong> 공제율 30%로 신용카드(15%) 대비 2배 효과</li>
            <li><strong>연금저축/IRP 최대 납입:</strong> 납입액의 12~15% 세액공제, 소득세 직접 감소</li>
            <li><strong>의료비 모으기:</strong> 총급여 3% 초과분부터 공제, 가족 의료비 합산 가능</li>
            <li><strong>기부금 공제 챙기기:</strong> 신용카드 기부는 공제 불가 — 계좌이체로 영수증 발급</li>
            <li><strong>부양가족 등록:</strong> 소득요건(연 100만원 이하) 충족 부모·형제 등록 시 1인당 150만원 공제</li>
          </ul>
        </div>

        <h3>❓ 자주 묻는 질문</h3>
        <div className="tip-box">
          <div className="tip-title">Q. 맞벌이 부부인데 자녀는 누구에게 넣어야 하나요?</div>
          <p>일반적으로 소득이 높은 쪽에 넣는 게 유리합니다. 높은 세율 구간에서 더 큰 절세 효과가 납니다. 단, 부모(경로우대)는 실제로 부양하는 쪽에 넣어야 합니다.</p>
        </div>
        <div className="tip-box">
          <div className="tip-title">Q. 신용카드 공제가 한도를 넘었어요. 더 쓰면 이득인가요?</div>
          <p>아닙니다. 공제 한도(7천만 이하 기준 300만원 + 추가 200만원)를 초과하면 추가 사용분은 공제 혜택이 없습니다.</p>
        </div>
        <div className="tip-box">
          <div className="tip-title">Q. 월세 세액공제는 어디에 입력하나요?</div>
          <p>
            이 계산기에서는 월세 세액공제(G357) 항목이 별도로 없으나, 기타 세액공제란에 금액을 추가하거나 의료비
            공제란에 합산해 근사값을 구할 수 있습니다. 월세 세액공제는 총급여 7천만 이하, 무주택 세대주, 국민주택
            이하 주택에 납입한 월세의 15%(또는 17%)입니다.
          </p>
        </div>
        <div className="warn-box">
          <p>⚠️ 이 계산기는 참고용입니다. 최종 연말정산은 회사 담당자와 국세청 홈택스(www.hometax.go.kr)를 통해 진행하세요.</p>
        </div>
      </div>
    </div>
  );
}
