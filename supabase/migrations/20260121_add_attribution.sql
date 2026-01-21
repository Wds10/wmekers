-- Migration to add attribution fields to models table
ALTER TABLE models 
ADD COLUMN IF NOT EXISTS author_original text,
ADD COLUMN IF NOT EXISTS license_type text DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS is_imported boolean DEFAULT false;

-- Add checking constraint for license (Optional but recommended)
-- ALTER TABLE models ADD CONSTRAINT allowed_licenses CHECK (license_type IN ('Standard', 'CC0', 'CC-BY'));
