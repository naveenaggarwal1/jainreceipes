-- ============================================================
-- Jain Recipes — Supabase Schema + Seed
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  avatar_url text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. RECIPES
create table public.recipes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  ingredients text[] not null default '{}',
  steps       text[] not null default '{}',
  category    text not null check (category in ('Main Dish','Dessert','Snack','Fasting','Breakfast')),
  jain_tags   text[] not null default '{}',
  author_id   uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Anonymous',
  approved    boolean not null default false,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- 3. RATINGS
create table public.ratings (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  uuid not null references public.recipes(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  score      smallint not null check (score between 1 and 5),
  review     text,
  created_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

-- 4. BOOKMARKS
create table public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  uuid not null references public.recipes(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.recipes  enable row level security;
alter table public.ratings  enable row level security;
alter table public.bookmarks enable row level security;

-- Profiles: anyone can read; users can update own profile
create policy "profiles_public_read"  on public.profiles for select using (true);
create policy "profiles_self_update"  on public.profiles for update using (auth.uid() = id);

-- Recipes: anyone reads approved; auth users insert; admin full access
create policy "recipes_public_read"   on public.recipes for select using (approved = true);
create policy "recipes_admin_read"    on public.recipes for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "recipes_auth_insert"   on public.recipes for insert with check (auth.uid() = author_id);
create policy "recipes_admin_all"     on public.recipes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Ratings: anyone reads; auth users insert/update own
create policy "ratings_public_read"   on public.ratings for select using (true);
create policy "ratings_auth_insert"   on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings_self_update"   on public.ratings for update using (auth.uid() = user_id);
create policy "ratings_self_delete"   on public.ratings for delete using (auth.uid() = user_id);

-- Bookmarks: users see/manage own only
create policy "bookmarks_own"         on public.bookmarks for all using (auth.uid() = user_id);

-- ============================================================
-- HELPFUL VIEW: recipes with avg rating
-- ============================================================
create or replace view public.recipes_with_ratings as
select
  r.*,
  coalesce(round(avg(rt.score), 1), 0) as avg_rating,
  count(rt.id)::int                     as rating_count
from public.recipes r
left join public.ratings rt on rt.recipe_id = r.id
group by r.id;

-- ============================================================
-- SEED: 5 default recipes (author_id = null = Admin)
-- ============================================================
insert into public.recipes (title, description, ingredients, steps, category, jain_tags, author_name, approved, created_at) values
(
  'Gujarati Dal',
  'A simple, flavorful Jain dal without onion or garlic.',
  array['Toor dal','turmeric','ginger','green chili','cumin seeds','curry leaves','salt','jaggery','lemon juice'],
  array['Cook dal with turmeric and water.','Fry cumin, ginger, chili and curry leaves.','Add to dal, simmer, finish with jaggery and lemon juice.'],
  'Main Dish',
  array['no_root_veg','no_onion_garlic'],
  'Admin', true, '2026-04-04T21:32:02.777Z'
),
(
  'Fasting Sabudana Khichdi',
  'Comforting Jain fasting khichdi made with sabudana and peanuts.',
  array['Sabudana','peanuts','potatoes','cumin seeds','green chili','rock salt','ghee','coriander'],
  array['Soak sabudana overnight.','Roast peanuts and crush coarsely.','Cook cubed potatoes with spices, add sabudana, finish with coriander.'],
  'Fasting',
  array['upvas','no_onion_garlic'],
  'Admin', true, '2026-04-04T21:32:02.777Z'
),
(
  'Jain Vegetable Pulao',
  'A fragrant pulao with peas and mild spices that follows Jain cooking rules.',
  array['Basmati rice','peas','ghee','cumin','cinnamon','cloves','green cardamom','salt'],
  array['Wash rice and soak for 20 minutes.','Fry whole spices in ghee, add vegetables.','Add rice and water, cook until fluffy.'],
  'Main Dish',
  array['no_onion_garlic','paryushan'],
  'Admin', true, '2026-04-04T21:35:03.302Z'
),
(
  'Sabudana Vada',
  'Crispy sabudana patties perfect for Jain fasting days.',
  array['Sabudana','mashed potatoes','peanuts','green chili','cumin seeds','rock salt','coriander','oil'],
  array['Soak sabudana and combine with mashed potato, peanuts and spices.','Shape into round patties.','Deep fry until golden brown.'],
  'Snack',
  array['upvas','no_onion_garlic'],
  'Admin', true, '2026-04-04T21:35:03.302Z'
),
(
  'Mango Shrikhand',
  'A creamy Jain dessert made with strained yogurt and fresh mango.',
  array['Hung curd','mango pulp','sugar','cardamom powder','saffron','chopped pistachios'],
  array['Strain curd in muslin cloth until thick.','Beat with sugar and mango pulp until smooth.','Chill and garnish with pistachios and saffron.'],
  'Dessert',
  array['no_onion_garlic','paryushan'],
  'Admin', true, '2026-04-04T21:35:03.302Z'
),
(
  'Dal Bati',
  'A classic Rajasthani feast — crispy baked wheat balls served with a rich, spiced five-lentil dal. A hearty Jain comfort meal.',
  array['Wheat flour','semolina (sooji)','ghee','salt','baking soda','toor dal','chana dal','moong dal','masoor dal','urad dal','turmeric','cumin seeds','mustard seeds','green chili','ginger','coriander powder','garam masala','lemon juice','fresh coriander'],
  array['Mix wheat flour, semolina, 3 tbsp ghee, salt and baking soda. Add water and knead into a stiff dough. Shape into round balls (bati).','Bake batis in a preheated oven at 180°C for 30 minutes, turning halfway, until golden and cooked through.','Wash and soak all five dals together for 30 minutes. Pressure cook with turmeric, salt and water for 4–5 whistles.','Heat ghee in a pan. Splutter cumin and mustard seeds, add ginger and green chili. Add coriander powder and garam masala.','Add the tempering to the cooked dal. Simmer for 5 minutes. Finish with lemon juice and fresh coriander.','Crack each bati open, pour hot ghee inside, and serve alongside the dal.'],
  'Main Dish',
  array['no_onion_garlic','no_root_veg'],
  'Admin', true, '2026-04-05T10:00:00.000Z'
),
(
  'Gatte ki Sabzi',
  'Soft gram flour dumplings simmered in a tangy yogurt-based gravy — a beloved Rajasthani Jain curry.',
  array['Besan (gram flour)','turmeric','red chili powder','coriander powder','ajwain (carom seeds)','ghee','salt','yogurt','cumin seeds','mustard seeds','ginger','green chili','asafoetida (hing)','garam masala','fresh coriander','oil'],
  array['Mix besan with turmeric, chili powder, ajwain, salt and 1 tbsp oil. Add water gradually to make a stiff dough.','Roll into long cylinders (gattas) about 1 cm thick. Boil in salted water for 10 minutes until firm. Remove and slice into 2 cm pieces.','Whisk yogurt with coriander powder, turmeric, chili powder and salt. Keep aside.','Heat ghee in a kadai. Add hing, mustard and cumin seeds. Add ginger and green chili, sauté briefly.','Lower the heat, add the whisked yogurt mixture slowly, stirring constantly to prevent curdling.','Add the cooked gattas and simmer on low flame for 10 minutes. Finish with garam masala and fresh coriander.'],
  'Main Dish',
  array['no_onion_garlic','no_root_veg'],
  'Admin', true, '2026-04-05T10:00:00.000Z'
),
(
  'Sev Tamatar ki Sabzi',
  'A quick and vibrant Gujarati curry made with juicy tomatoes and crunchy sev — ready in under 20 minutes.',
  array['Ripe tomatoes','sev (thin crispy chickpea noodles)','ghee','cumin seeds','mustard seeds','green chili','ginger','turmeric','red chili powder','coriander powder','sugar','salt','fresh coriander','lemon juice'],
  array['Heat ghee in a pan. Splutter mustard and cumin seeds. Add green chili and ginger, sauté for 30 seconds.','Add chopped tomatoes, turmeric, red chili powder, coriander powder, salt and a pinch of sugar.','Cook on medium heat for 8–10 minutes, stirring occasionally, until tomatoes break down into a thick masala.','Add a splash of water if needed to adjust consistency. Taste and balance sweet, salt and spice.','Just before serving, stir in half the sev so it softens slightly into the curry.','Garnish with remaining crunchy sev, fresh coriander and a squeeze of lemon juice. Serve hot with roti.'],
  'Main Dish',
  array['no_onion_garlic','no_root_veg'],
  'Admin', true, '2026-04-05T10:00:00.000Z'
);
