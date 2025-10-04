-- =====================================================
-- MIGRATION: ADD PAYMENT AND SHIPPING FIELDS TO ORDERS
-- =====================================================
-- Add payment_method and shipping_method to orders table
-- =====================================================

-- Add payment_method column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'mercadopago', 'other'));

-- Add shipping_method column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_method TEXT;

-- Add shipping_cost column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Update existing orders to have default payment_method if null
UPDATE orders
SET payment_method = 'mercadopago'
WHERE payment_method IS NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN orders.payment_method IS 'Payment method used: cash, card, transfer, mercadopago, other';
COMMENT ON COLUMN orders.shipping_method IS 'Shipping method selected by customer';
COMMENT ON COLUMN orders.shipping_cost IS 'Cost of shipping for this order';