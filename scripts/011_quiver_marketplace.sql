-- Marketplace: venta y alquiler de tablas desde el quiver
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'none'; -- 'none', 'sale', 'rent', 'both'
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS rent_price_day DECIMAL(10,2);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS rent_price_week DECIMAL(10,2);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS listing_description TEXT;
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS listing_active BOOLEAN DEFAULT FALSE;
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS listing_contact VARCHAR(100);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS listing_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create marketplace listing index
CREATE INDEX IF NOT EXISTS idx_surfer_quiver_marketplace ON surfer_quiver(listing_active, listing_type) 
WHERE listing_active = TRUE;
