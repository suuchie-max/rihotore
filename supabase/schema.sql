-- 梨歩トレ: 家族ごとのデータ。family_id は URL に含まれる推測不能なトークン。
create table if not exists public.app_data (
  family_id  text not null,
  key        text not null,               -- 'meta' または 'day:YYYY-MM-DD'
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (family_id, key)
);

alter table public.app_data enable row level security;

-- リクエストヘッダー x-family-token と一致する家族の行だけ読み書きできる
drop policy if exists "family token access" on public.app_data;
create policy "family token access" on public.app_data
  for all
  to anon
  using      (family_id = (current_setting('request.headers', true)::json ->> 'x-family-token'))
  with check (family_id = (current_setting('request.headers', true)::json ->> 'x-family-token'));
