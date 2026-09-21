-- ============================================
-- MIGRATIE 002 — Authenticatie functies
-- ============================================
-- Voegt `register_user` en `login_user` toe als SECURITY DEFINER functies.
--
-- WAAROM DEZE AANPAK:
-- Deze app is een pure frontend (Vite/React) met de publieke anon key.
-- Zou de browser wachtwoorden zelf verifieren, dan moest hij `password_hash`
-- kunnen uitlezen -- en dan staan alle hashes publiek op internet.
-- Door de check in een SECURITY DEFINER functie te doen, gebeurt het
-- vergelijken BINNEN de database. De hash verlaat de database nooit.
--
-- RLS op `users` blijft daarom aan zonder policies: direct SELECT vanaf de
-- client geeft 0 rijen. Alleen deze twee functies kunnen bij de tabel.
--
-- Vereist: migratie 001 (users tabel).
-- Run dit script in de Supabase SQL Editor.
-- ============================================


-- 1. pgcrypto voor bcrypt hashing (crypt / gen_salt)
-- Supabase heeft deze extensie standaard in het `extensions` schema.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


-- ============================================
-- 2. register_user(username, password)
-- ============================================
-- Maakt een nieuw account aan met een bcrypt hash.
-- Gooit een exception bij ongeldige input of dubbele gebruikersnaam.
CREATE OR REPLACE FUNCTION public.register_user(
  p_username text,
  p_password text
)
RETURNS TABLE (
  id         integer,
  username   varchar,
  created_at timestamptz,
  last_login timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_username text;
  v_id       integer;
  v_created  timestamptz;
BEGIN
  -- Normaliseer: gebruikersnamen zijn case-insensitive en zonder randspaties.
  v_username := lower(trim(coalesce(p_username, '')));

  IF length(v_username) < 3 THEN
    RAISE EXCEPTION 'Gebruikersnaam moet minimaal 3 tekens bevatten.'
      USING ERRCODE = '22023';
  END IF;

  IF length(v_username) > 64 THEN
    RAISE EXCEPTION 'Gebruikersnaam mag maximaal 64 tekens bevatten.'
      USING ERRCODE = '22023';
  END IF;

  IF length(coalesce(p_password, '')) < 8 THEN
    RAISE EXCEPTION 'Wachtwoord moet minimaal 8 tekens bevatten.'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.users u WHERE lower(u.username) = v_username
  ) THEN
    RAISE EXCEPTION 'Gebruikersnaam is al in gebruik.'
      USING ERRCODE = '23505';
  END IF;

  -- bcrypt met cost factor 12
  INSERT INTO public.users (username, password_hash)
  VALUES (v_username, crypt(p_password, gen_salt('bf', 12)))
  RETURNING users.id, users.created_at
  INTO v_id, v_created;

  RETURN QUERY SELECT v_id, v_username::varchar, v_created, NULL::timestamptz;
END;
$$;


-- ============================================
-- 3. login_user(username, password)
-- ============================================
-- Verifieert de inloggegevens. Bij succes: werkt `last_login` bij en
-- retourneert de accountgegevens (zonder hash).
-- Bij een foute combinatie: retourneert 0 rijen (geen exception, zodat we
-- niet verklappen of de gebruikersnaam bestaat).
CREATE OR REPLACE FUNCTION public.login_user(
  p_username text,
  p_password text
)
RETURNS TABLE (
  id         integer,
  username   varchar,
  created_at timestamptz,
  last_login timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_id      integer;
  v_name    varchar;
  v_hash    varchar;
  v_created timestamptz;
  v_last    timestamptz;
BEGIN
  SELECT u.id, u.username, u.password_hash, u.created_at
    INTO v_id, v_name, v_hash, v_created
  FROM public.users u
  WHERE lower(u.username) = lower(trim(coalesce(p_username, '')));

  -- Onbekende gebruiker: doe alsnog een hash-berekening zodat de responstijd
  -- niet verraadt of het account bestaat (timing attack mitigatie).
  IF v_id IS NULL THEN
    PERFORM crypt(coalesce(p_password, ''), gen_salt('bf', 12));
    RETURN;
  END IF;

  -- bcrypt vergelijking: hash het ingevoerde wachtwoord met de opgeslagen
  -- salt en vergelijk het resultaat.
  IF v_hash IS DISTINCT FROM crypt(coalesce(p_password, ''), v_hash) THEN
    RETURN;
  END IF;

  UPDATE public.users
  SET last_login = now()
  WHERE users.id = v_id
  RETURNING users.last_login
  INTO v_last;

  RETURN QUERY SELECT v_id, v_name, v_created, v_last;
END;
$$;


-- ============================================
-- 4. Rechten
-- ============================================
-- Niemand mag deze functies standaard aanroepen; expliciet toekennen aan de
-- client-rollen die Supabase gebruikt.
REVOKE ALL ON FUNCTION public.register_user(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.login_user(text, text)    FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_user(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_user(text, text)    TO anon, authenticated;


-- ============================================
-- 5. Verificatie
-- ============================================
-- Maak een testaccount aan en log er meteen mee in.
-- Verwacht: beide queries geven 1 rij terug, de tweede met een last_login.
--
--   SELECT * FROM register_user('testuser', 'geheim123');
--   SELECT * FROM login_user('testuser', 'geheim123');
--   SELECT * FROM login_user('testuser', 'foutwachtwoord');  -- 0 rijen
--
-- Opruimen na de test:
--   DELETE FROM users WHERE username = 'testuser';

SELECT
  p.proname   AS functie,
  p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('register_user', 'login_user')
ORDER BY p.proname;
