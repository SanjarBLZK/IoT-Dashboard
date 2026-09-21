-- ============================================
-- MIGRATIE 001 — users tabel
-- ============================================
-- Voegt de `users` tabel toe voor het aankomende inlogscherm.
-- Geen rollen: elk account is gelijk. `last_login` houdt bij welke
-- accounts hebben ingelogd en wanneer.
--
-- Run dit script in de Supabase SQL Editor.
-- ============================================


-- 1. Tabel
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);


-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);


-- 3. Row Level Security
-- Users is een gevoelige tabel: standaard geen public policies.
-- De frontend hoort via een backend (of Supabase auth + service_role) te praten.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;


-- 4. Verificatie
-- Toont alle accounts en, indien van toepassing, hun laatste login.
SELECT id, username, created_at, last_login
FROM users
ORDER BY last_login DESC NULLS LAST, id;
