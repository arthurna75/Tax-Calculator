# 연말정산 계산기 (Next.js + Supabase)

근로소득 연말정산 계산, 결과 저장/조회, Excel 리포트 다운로드, 정산 코드 마스터 관리를 제공하는 풀스택 웹 앱입니다.

## 기술 스택
- Next.js (App Router) + TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- xlsx-js-style (Excel 리포트 생성)
- Vercel (배포)

## 1. Supabase 프로젝트 설정
1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트의 **SQL Editor**에서 [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 내용을 실행합니다. (`profiles`/`tax_codes`/`settlements` 테이블, RLS 정책, 코드 시드 데이터가 생성됩니다.)
3. 첫 가입자를 관리자로 지정하려면, 가입 후 SQL Editor에서:
   ```sql
   update profiles set role = 'admin' where email = '본인이메일@example.com';
   ```

## 2. 환경변수 설정
[`.env.local.example`](.env.local.example)을 복사해 `.env.local`을 만들고 Supabase 프로젝트의 **Settings → API**에서 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`.env.local`은 `.gitignore`에 의해 커밋되지 않습니다. `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 키이므로 클라이언트 코드에 절대 노출하지 마세요.

## 3. 로컬 실행
```bash
npm install
npm run dev
```
[http://localhost:3000](http://localhost:3000) 접속 → 회원가입 → 계산기 사용.

## 4. 주요 기능
- `/login` — 이메일/비밀번호 로그인 및 가입
- `/calculator` — 입력값 변경 시 실시간 재계산, 결과를 Excel(9시트)로 다운로드, 내 기록으로 저장
- `/records`, `/records/[id]` — 저장한 연말정산 기록 조회/수정/삭제
- `/admin/codes` — (관리자 전용) 정산 코드 마스터 CRUD
- `/guide` — 연말정산 계산 흐름 및 공제 항목 가이드

## 5. Vercel 배포
1. GitHub 저장소를 Vercel 대시보드에서 **Import Project**로 연결합니다.
2. Vercel 프로젝트의 **Settings → Environment Variables**에 `.env.local`과 동일한 3개 키를 등록합니다.
3. 이후 `main` 브랜치에 `git push`하면 자동으로 빌드·배포됩니다. (`vercel.json`에 `framework: nextjs` 지정됨)

## 폴더 구조 참고
- `lib/tax/calculations.ts` — 근로소득공제, 신용카드공제, 종합소득세율, 세액공제 등 계산 로직
- `lib/tax/excelExport.ts` — Excel 9시트 리포트 생성
- `lib/tax/settlements.ts`, `lib/tax/codes.ts` — Server Actions 기반 CRUD
- `lib/supabase/*` — 브라우저/서버 Supabase 클라이언트, 세션 미들웨어
- `legacy/` — 마이그레이션 이전 정적 HTML 계산기 (참고용 보존)
