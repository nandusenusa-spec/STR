-- ===== SEED FORUM CATEGORIES =====
INSERT INTO forum_categories (name, slug, description, color, sort_order) VALUES
('General', 'general', 'Discusiones generales de la comunidad', '#3b82f6', 0),
('Tips & Trucos', 'tips', 'Comparte consejos, técnicas y trucos', '#10b981', 1),
('Spots', 'spots', 'Recomendaciones de lugares para surfear, skate y SUP', '#f59e0b', 2),
('Equipo', 'equipo', 'Habla sobre equipos, tablas, accesorios y gear', '#8b5cf6', 3)
ON CONFLICT (slug) DO NOTHING;

-- ===== SEED CHAT CHANNELS =====
INSERT INTO chat_channels (name, slug, description, category) VALUES
('general', 'general', 'Canal general para conversaciones', 'general'),
('surf', 'surf', 'Canal para la comunidad de surf', 'surf'),
('skate', 'skate', 'Canal para la comunidad de skate', 'skate'),
('sup', 'sup', 'Canal para la comunidad de SUP', 'sup'),
('anuncios', 'anuncios', 'Anuncios importantes de la comunidad', 'announcements')
ON CONFLICT (slug) DO NOTHING;
