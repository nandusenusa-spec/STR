-- Quiver Profesional - Métricas completas de surfboards
-- Agrega campos técnicos para un análisis profesional de tablas

-- Agregar nuevos campos al quiver
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS tail_type VARCHAR(30); -- squash, round, swallow, fish, pin, diamond, square
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS nose_type VARCHAR(30); -- pointed, round, wide
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS rocker_nose VARCHAR(20); -- low, medium, high
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS rocker_tail VARCHAR(20); -- low, medium, high  
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS rocker_entry VARCHAR(20); -- low, medium, high
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS concave_type VARCHAR(30); -- flat, single, double, vee, channel
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS rail_type VARCHAR(30); -- full, medium, low, pinched, boxy
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS construction VARCHAR(50); -- PU/PE, EPS/Epoxy, Softop, Carbon, Stringerless
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS stringer VARCHAR(30); -- single, triple, none, carbon
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS glass_weight VARCHAR(30); -- 4oz, 6oz, 4+4, 6+4, custom
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS condition VARCHAR(20); -- new, excellent, good, fair, poor
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS wave_range_min DECIMAL(3,1); -- min wave height in feet
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS wave_range_max DECIMAL(3,1); -- max wave height in feet
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS ideal_wave_type VARCHAR(50); -- beach break, point break, reef, all-around
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS leash_length VARCHAR(20); -- 6ft, 7ft, 8ft, 9ft, 10ft
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS traction_pad BOOLEAN DEFAULT TRUE;
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS sessions_count INTEGER DEFAULT 0;
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS last_session_date DATE;
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5);
ALTER TABLE surfer_quiver ADD COLUMN IF NOT EXISTS observations TEXT; -- notas personales sobre la tabla

-- Tabla para historial de reparaciones
CREATE TABLE IF NOT EXISTS board_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES surfer_quiver(id) ON DELETE CASCADE,
  repair_date DATE NOT NULL,
  repair_type VARCHAR(50), -- ding, crack, delam, fin_box, nose, tail
  description TEXT,
  cost DECIMAL(10,2),
  repaired_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_board_repairs_board ON board_repairs(board_id);
