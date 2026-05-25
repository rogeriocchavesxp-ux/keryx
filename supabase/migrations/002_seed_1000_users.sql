-- =============================================
-- KERYX — Seed: 1000 usuários simulados
-- Execute no SQL Editor do Supabase (projeto Keryx)
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  i         INTEGER;
  j         INTEGER;
  uid       UUID;
  pid       UUID;
  is_nt     BOOLEAN;
  book      TEXT;
  testament TEXT;
  lang      TEXT;
  cap       INTEGER;
  ver_ini   INTEGER;
  ver_fim   INTEGER;
  n_proj    INTEGER;

  books_nt TEXT[] := ARRAY[
    'Mateus','Marcos','Lucas','João','Atos','Romanos',
    '1 Coríntios','2 Coríntios','Gálatas','Efésios',
    'Filipenses','Colossenses','1 Tessalonicenses',
    '1 Timóteo','2 Timóteo','Hebreus','Tiago',
    '1 Pedro','Apocalipse'
  ];

  books_at TEXT[] := ARRAY[
    'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
    'Josué','Juízes','1 Samuel','2 Samuel',
    'Salmos','Provérbios','Eclesiastes','Isaías',
    'Jeremias','Ezequiel','Daniel','Amós','Miquéias','Habacuque'
  ];

  statuses TEXT[] := ARRAY[
    'draft','draft','draft',
    'in_progress','in_progress',
    'completed'
  ];

  plans TEXT[] := ARRAY[
    'free','free','free','free',   -- 40% free
    'basic','basic','basic',       -- 30% basic
    'pro','pro',                   -- 20% pro
    'seminary'                     -- 10% seminary
  ];

  prefixes TEXT[] := ARRAY['Pr.','Rev.','Sem.','Dr.','Mre.'];

  first_names TEXT[] := ARRAY[
    'João','Pedro','Paulo','Lucas','Marcos','André','Felipe','Tiago',
    'Rafael','Daniel','Samuel','Elias','Ezequiel','Davi','Salomão',
    'Calebe','Josué','Abraão','Isaac','José','Moisés','Aarão',
    'Gideão','Sansão','Jeremias','Isaías','Amós','Oséias','Malaquias'
  ];

  last_names TEXT[] := ARRAY[
    'Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira',
    'Alves','Pereira','Lima','Gomes','Costa','Martins',
    'Ribeiro','Carvalho','Almeida','Nascimento','Araújo',
    'Cardoso','Moreira','Nunes','Castro','Cavalcante',
    'Barbosa','Cunha','Monteiro','Correia','Teixeira','Nogueira'
  ];

BEGIN
  FOR i IN 1..1000 LOOP
    uid := gen_random_uuid();
    is_nt := random() > 0.38; -- 62% NT, 38% AT

    -- ── Auth user ───────────────────────────────────────────────────────────
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid,
      'authenticated',
      'authenticated',
      'usuario' || LPAD(i::TEXT, 4, '0') || '@keryx.dev',
      crypt('Keryx@2026', gen_salt('bf')),
      NOW() - (random() * INTERVAL '365 days'),
      NOW() - (random() * INTERVAL '365 days'),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      FALSE, '', '', '', ''
    );

    -- ── Profile (trigger já cria, apenas atualizamos) ───────────────────────
    UPDATE public.profiles SET
      full_name = prefixes[1 + (floor(random() * array_length(prefixes, 1)))::INT]
               || ' '
               || first_names[1 + (floor(random() * array_length(first_names, 1)))::INT]
               || ' '
               || last_names[1 + (floor(random() * array_length(last_names, 1)))::INT],
      plan = plans[1 + (floor(random() * array_length(plans, 1)))::INT],
      updated_at = NOW()
    WHERE id = uid;

    -- ── Projetos (1–4 por usuário) ──────────────────────────────────────────
    n_proj := 1 + floor(random() * 3)::INT;

    FOR j IN 1..n_proj LOOP
      is_nt := random() > 0.38;

      IF is_nt THEN
        book      := books_nt[1 + (floor(random() * array_length(books_nt, 1)))::INT];
        testament := 'NT';
        lang      := 'grego';
      ELSE
        book      := books_at[1 + (floor(random() * array_length(books_at, 1)))::INT];
        testament := 'AT';
        lang      := 'hebraico';
      END IF;

      cap     := 1  + floor(random() * 20)::INT;
      ver_ini := 1  + floor(random() * 10)::INT;
      ver_fim := ver_ini + 1 + floor(random() * 15)::INT;

      INSERT INTO public.projects (
        id, user_id, title, book, passage_ref,
        testament, original_language, bible_version, status,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        uid,
        'Exegese de ' || book || ' ' || cap || '.' || ver_ini || '-' || ver_fim,
        book,
        cap::TEXT || '.' || ver_ini::TEXT || '-' || ver_fim::TEXT,
        testament, lang, 'NAA',
        statuses[1 + (floor(random() * array_length(statuses, 1)))::INT],
        NOW() - (random() * INTERVAL '300 days'),
        NOW() - (random() * INTERVAL '30 days')
      );
    END LOOP;

  END LOOP;

  RAISE NOTICE '✓ Seed concluído: 1000 usuários + projetos criados';
END $$;

-- ── Verificação rápida ───────────────────────────────────────────────────────
SELECT
  'Usuários'   AS tabela, COUNT(*) AS total FROM auth.users   WHERE email LIKE '%@keryx.dev'
UNION ALL
SELECT
  'Perfis'     AS tabela, COUNT(*) AS total FROM public.profiles
UNION ALL
SELECT
  'Projetos'   AS tabela, COUNT(*) AS total FROM public.projects
UNION ALL
SELECT
  'Por plano'  AS tabela, COUNT(*) AS total FROM public.profiles WHERE plan = 'free'
UNION ALL
SELECT
  'Pro/Seminary' AS tabela, COUNT(*) AS total FROM public.profiles WHERE plan IN ('pro','seminary');
