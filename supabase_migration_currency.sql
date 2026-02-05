-- Migration to add dual currency support (USD and ETB)
-- Run this in your Supabase SQL Editor

-- Update services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_usd NUMERIC;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_etb NUMERIC;

-- Update plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_usd NUMERIC;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_etb NUMERIC;

-- Update transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_usd NUMERIC;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_etb NUMERIC;

-- Update bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_usd NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_etb NUMERIC;

-- Optional: Migrate existing data
-- This sets USD price to the current price value for existing records
UPDATE services SET price_usd = CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS NUMERIC) WHERE price_usd IS NULL AND price ~ '[0-9]';
UPDATE plans SET price_usd = CAST(price AS NUMERIC) WHERE price_usd IS NULL AND price ~ '^[0-9.]+$';
UPDATE transactions SET amount_usd = amount WHERE amount_usd IS NULL;
UPDATE bookings SET amount_usd = CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS NUMERIC) WHERE amount_usd IS NULL AND price ~ '[0-9]';
