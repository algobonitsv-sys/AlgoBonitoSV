-- Remove unnecessary columns from materials table
ALTER TABLE materials DROP COLUMN IF EXISTS cost_per_unit;
ALTER TABLE materials DROP COLUMN IF EXISTS unit_type;
ALTER TABLE materials DROP COLUMN IF EXISTS current_stock;
ALTER TABLE materials DROP COLUMN IF EXISTS min_stock;