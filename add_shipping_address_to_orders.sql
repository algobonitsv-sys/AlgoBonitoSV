ALTER TABLE orders ADD COLUMN shipping_address TEXT;

-- Agregar columna de teléfono si no existe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Agregar columna created_at si no existe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE orders SET shipping_address = NULL WHERE shipping_address IS NULL;
UPDATE orders SET customer_phone = NULL WHERE customer_phone IS NULL;
UPDATE orders SET created_at = NOW() WHERE created_at IS NULL;