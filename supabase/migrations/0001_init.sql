-- 0001_init.sql
-- 연말정산 계산기: 프로필 / 코드 마스터 / 사용자 저장 기록 스키마 + RLS + 시드

-- ============================================================
-- 1. profiles (role 관리용)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- auth.users insert 시 profiles 자동 생성
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. tax_codes (마스터 코드 테이블: S001, G211 등)
-- ============================================================
create table tax_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null check (category in ('income','deduction','credit','tax')),
  description text,
  rate numeric,
  limit_amount numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. settlements (사용자별 연말정산 저장 기록)
-- ============================================================
create table settlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  tax_year int not null default 2025,
  data jsonb not null default '{}',
  result jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. RLS
-- ============================================================
alter table profiles enable row level security;
alter table tax_codes enable row level security;
alter table settlements enable row level security;

create policy "profiles_self_select" on profiles for select using (auth.uid() = id);

create policy "tax_codes_read_all" on tax_codes for select using (auth.role() = 'authenticated');
create policy "tax_codes_admin_write" on tax_codes for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "tax_codes_admin_update" on tax_codes for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "tax_codes_admin_delete" on tax_codes for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "settlements_owner_all" on settlements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 5. 시드 데이터 (legacy 계산기에서 사용된 정산항목코드)
-- ============================================================
insert into tax_codes (code, name, category, description, rate, limit_amount, sort_order) values
  ('S001', '급여소득', 'income', '기본급 연간 합계', null, null, 10),
  ('S002', '상여소득', 'income', '성과급, 명절상여 등', null, null, 20),
  ('S013', '자가운전보조금 비과세', 'income', '월 20만원 × 12개월 한도', null, 2400000, 30),
  ('S030', '총급여액', 'income', '급여+상여-비과세 (자동계산)', null, null, 40),
  ('G001', '근로소득공제', 'deduction', '총급여액 기준 5단계 구간별 공제 (자동계산)', null, null, 50),
  ('S301', '근로소득금액', 'income', '총급여액 - 근로소득공제 (자동계산)', null, null, 60),
  ('G002', '본인공제', 'deduction', '본인 1명 × 150만원', null, 1500000, 70),
  ('G004', '부양가족공제', 'deduction', '부양가족 1인당 150만원', null, null, 80),
  ('G007', '경로우대공제', 'deduction', '70세 이상 1인당 100만원 추가', null, null, 90),
  ('G008', '장애인공제', 'deduction', '장애인 1인당 200만원 추가', null, null, 100),
  ('G009', '부녀자공제', 'deduction', '50만원', null, 500000, 110),
  ('G010', '한부모공제', 'deduction', '100만원', null, 1000000, 120),
  ('G015', '국민연금보험료공제', 'deduction', '본인부담분 전액', null, null, 130),
  ('G111', '건강보험료공제', 'deduction', '본인부담분', null, null, 140),
  ('G154', '장기요양보험료공제', 'deduction', '건강보험 부가', null, null, 150),
  ('G112', '고용보험료공제', 'deduction', '본인부담분', null, null, 160),
  ('G223', '신용카드 사용액', 'deduction', '신용카드공제 기초자료, 공제율 15%', 0.15, null, 170),
  ('G205', '현금영수증 사용액', 'deduction', '신용카드공제 기초자료, 공제율 30%', 0.30, null, 180),
  ('G222', '직불·체크카드 사용액', 'deduction', '신용카드공제 기초자료, 공제율 30%', 0.30, null, 190),
  ('G257', '도서·공연·문화 신용카드', 'deduction', '총급여 7천만 이하만 적용, 공제율 30%', 0.30, null, 200),
  ('G228', '전통시장 사용액', 'deduction', '별도한도 100만원, 공제율 40%', 0.40, 1000000, 210),
  ('G240', '대중교통 사용액', 'deduction', '별도한도 100만원, 공제율 40%', 0.40, 1000000, 220),
  ('G225', '신용카드 공제액 합계', 'deduction', '기본+전통시장+대중교통 (자동계산)', null, null, 230),
  ('G218', '벤처투자조합 출자공제', 'deduction', null, null, null, 240),
  ('G219', '소기업·소상공인 공제부금', 'deduction', '노란우산공제', null, null, 250),
  ('G113', '주택임차차입금 원리금 상환액', 'deduction', null, null, null, 260),
  ('G115', '장기주택저당차입금 이자상환액', 'deduction', null, null, null, 270),
  ('G211', '과세표준', 'tax', '소득금액 - 소득공제 합계 (자동계산)', null, null, 280),
  ('G212', '산출세액', 'tax', '과세표준 × 세율 - 누진공제 (자동계산)', null, null, 290),
  ('G304', '근로소득세액공제', 'credit', '산출세액 기준 자동계산', null, null, 300),
  ('G312', '자녀세액공제', 'credit', '1명 15만, 2명 35만, 3명 이상 1인당 30만 추가', null, null, 310),
  ('G315', '퇴직연금(DC형) 세액공제', 'credit', '추가납입액 × 12%', 0.12, null, 320),
  ('G316', '연금저축 세액공제', 'credit', '납입액 × 12%(또는 15%)', 0.12, null, 330),
  ('G317', '보장성보험료 세액공제', 'credit', '보험료 × 12%', 0.12, 1000000, 340),
  ('G318', '의료비 세액공제', 'credit', '총급여 3% 초과분 × 15%', 0.15, null, 350),
  ('G319', '교육비 세액공제', 'credit', '교육비 × 15%', 0.15, null, 360),
  ('G322', '기부금 세액공제', 'credit', '기부금 × 15%(1천만 초과분 30%)', 0.15, null, 370),
  ('G309', '세액공제 합계', 'credit', '자동계산', null, null, 380),
  ('G901', '결정세액(소득세)', 'tax', '산출세액 - 세액공제 합계 (자동계산)', null, null, 390),
  ('G902', '지방소득세', 'tax', '결정세액(소득세) × 10% (자동계산)', 0.10, null, 400),
  ('G907', '기납부 소득세', 'tax', '매월 원천징수 소득세 합계', null, null, 410),
  ('G908', '기납부 지방소득세', 'tax', '매월 원천징수 지방세 합계', null, null, 420),
  ('G910', '차감 소득세', 'tax', '결정세액 - 기납부 소득세 (음수=환급, 양수=납부)', null, null, 430),
  ('G911', '차감 지방소득세', 'tax', '지방소득세 - 기납부 지방세 (음수=환급, 양수=납부)', null, null, 440);
