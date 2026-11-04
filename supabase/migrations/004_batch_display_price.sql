ALTER TABLE batches ADD COLUMN IF NOT EXISTS display_price_inr INT;
COMMENT ON COLUMN batches.display_price_inr IS 'Optional MRP/list price for display only. Charged amount is always price_inr.';