-- G113을 주택임차차입금(공제항목)에서 보장성보험 납입액(세액공제 기초자료)으로 수정
UPDATE tax_codes SET
  name        = '보장성보험 납입액',
  category    = 'credit',
  description = '보장성보험 납입액 (× 12% → G317 세액공제 자동계산)',
  rate        = 0.12,
  limit_amount = 1000000,
  sort_order  = 335
WHERE code = 'G113';
