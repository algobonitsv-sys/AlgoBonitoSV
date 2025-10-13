-- Limpiar contenido actual de materials_content
DELETE FROM materials_content;

-- Insertar nuevo contenido
INSERT INTO materials_content (section_type, title, content, icon_name, is_active, display_order) VALUES
('care_tips', 'Cuidado de tus Joyas', 'Guarda tus piezas individualmente para evitar que se rayen. Evita el contacto con perfumes, cremas y productos de limpieza. Quítate las joyas antes de nadar, bañarte o hacer ejercicio. Límpialas suavemente con un paño seco y suave después de usarlas.', 'ShieldCheck', true, 1),
('maintenance', 'Mantenimiento', 'Para una limpieza más profunda, puedes usar agua tibia y un jabón neutro. Usa un cepillo de dientes suave para llegar a las zonas difíciles y seca completamente la pieza antes de guardarla. Para piezas con piedras preciosas, recomendamos una limpieza profesional una vez al año.', 'Wrench', true, 2);