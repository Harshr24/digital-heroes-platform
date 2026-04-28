-- Digital Heroes Platform schema
-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

create type public.user_role as enum ('user', 'admin');
create type public.subscription_status as enum ('active', 'cancelled', 'expired', 'incomplete');
create type public.draw_mode as enum ('random', 'algorithmic');
create type public.winning_status as enum ('pending', 'approved', 'rejected', 'paid');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'user',
  charity_id uuid,
  charity_percentage numeric(5,2) not null default 10.00 check (charity_percentage >= 10 and charity_percentage <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan text not null check (plan in ('monthly','yearly')),
  status public.subscription_status not null default 'incomplete',
  period_start timestamptz,
  period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table public.charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  website text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users
  add constraint users_charity_id_fkey
  foreign key (charity_id) references public.charities(id) on delete set null;

create table public.scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score between 1 and 45),
  played_on date not null,
  created_at timestamptz not null default now(),
  unique(user_id, played_on)
);

create table public.draws (
  id uuid primary key default uuid_generate_v4(),
  draw_month date not null unique,
  mode public.draw_mode not null,
  winning_numbers integer[] not null check (array_length(winning_numbers, 1) = 5),
  jackpot_carryover numeric(12,2) not null default 0,
  prize_pool numeric(12,2) not null default 0,
  is_published boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.draw_results (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  matched_count integer not null check (matched_count between 0 and 5),
  score_ids uuid[] not null,
  created_at timestamptz not null default now(),
  unique(draw_id, user_id)
);

create table public.winnings (
  id uuid primary key default uuid_generate_v4(),
  draw_result_id uuid not null unique references public.draw_results(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  tier integer not null check (tier in (3,4,5)),
  status public.winning_status not null default 'pending',
  payout_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  charity_id uuid not null references public.charities(id) on delete cascade,
  draw_id uuid references public.draws(id) on delete set null,
  percentage numeric(5,2) not null check (percentage >= 10 and percentage <= 100),
  amount numeric(12,2) not null check (amount >= 0),
  is_extra boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.verification_submissions (
  id uuid primary key default uuid_generate_v4(),
  winning_id uuid not null unique references public.winnings(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  proof_url text not null,
  admin_notes text,
  status public.winning_status not null default 'pending',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_status on public.subscriptions(status);
create index idx_scores_user_created on public.scores(user_id, created_at desc);
create index idx_draw_results_draw on public.draw_results(draw_id);
create index idx_winnings_user on public.winnings(user_id, status);
create index idx_donations_charity on public.donations(charity_id);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users for each row execute procedure public.touch_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.touch_updated_at();
create trigger charities_updated_at before update on public.charities for each row execute procedure public.touch_updated_at();
create trigger draws_updated_at before update on public.draws for each row execute procedure public.touch_updated_at();
create trigger winnings_updated_at before update on public.winnings for each row execute procedure public.touch_updated_at();
create trigger verification_submissions_updated_at before update on public.verification_submissions for each row execute procedure public.touch_updated_at();

create or replace function public.trim_scores_to_five()
returns trigger as $$
begin
  delete from public.scores
  where id in (
    select id
    from public.scores
    where user_id = new.user_id
    order by created_at desc
    offset 5
  );
  return new;
end;
$$ language plpgsql;

create trigger keep_only_five_scores
after insert on public.scores
for each row execute procedure public.trim_scores_to_five();

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_results enable row level security;
alter table public.winnings enable row level security;
alter table public.charities enable row level security;
alter table public.donations enable row level security;
alter table public.verification_submissions enable row level security;

create policy "users_select_self" on public.users for select using (auth.uid() = id);
create policy "users_update_self" on public.users for update using (auth.uid() = id);

create policy "subscriptions_select_self" on public.subscriptions for select using (auth.uid() = user_id);

create policy "scores_crud_self" on public.scores
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "draws_select_all" on public.draws for select using (true);
create policy "charities_select_all" on public.charities for select using (true);

create policy "draw_results_select_self" on public.draw_results for select using (auth.uid() = user_id);
create policy "winnings_select_self" on public.winnings for select using (auth.uid() = user_id);
create policy "donations_select_self" on public.donations for select using (auth.uid() = user_id);
create policy "verification_select_self" on public.verification_submissions for select using (auth.uid() = user_id);

