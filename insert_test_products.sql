-- Verifica se esistono categorie, altrimenti creale
INSERT INTO categories (name, description)
SELECT 'Biciclette', 'Biciclette complete BMX'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Biciclette');

INSERT INTO categories (name, description)
SELECT 'Componenti', 'Componenti e pezzi di ricambio per BMX'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Componenti');

INSERT INTO categories (name, description)
SELECT 'Abbigliamento', 'Abbigliamento BMX'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Abbigliamento');

INSERT INTO categories (name, description)
SELECT 'Accessori', 'Accessori per BMX e rider'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Accessori');

-- Recupera gli ID delle categorie per l'inserimento dei prodotti
WITH category_ids AS (
    SELECT id, name FROM categories
    WHERE name IN ('Biciclette', 'Componenti', 'Abbigliamento', 'Accessori')
)

-- Inserisci prodotti di test solo se non esistono già prodotti con lo stesso nome
INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'BMX Freestyle Pro', 
    'Bicicletta BMX professionale per freestyle e trick.', 
    699.99, 
    15, 
    'Biciclette', 
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    true, 
    (SELECT id FROM categories WHERE name = 'Biciclette')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'BMX Freestyle Pro');

INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'BMX Race Elite', 
    'Bicicletta BMX da gara leggera e aerodinamica.', 
    899.99, 
    8, 
    'Biciclette', 
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    true, 
    (SELECT id FROM categories WHERE name = 'Biciclette')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'BMX Race Elite');

INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'Casco BMX Pro', 
    'Casco professionale per BMX con protezione avanzata.', 
    89.99, 
    25, 
    'Accessori', 
    'https://images.unsplash.com/photo-1573496773905-f5b17e717f05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    false, 
    (SELECT id FROM categories WHERE name = 'Accessori')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'Casco BMX Pro');

INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'Manubrio BMX Cromato', 
    'Manubrio in acciaio cromato per BMX freestyle.', 
    49.99, 
    30, 
    'Componenti', 
    'https://images.unsplash.com/photo-1605965462688-7b62a4c41298?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    false, 
    (SELECT id FROM categories WHERE name = 'Componenti')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'Manubrio BMX Cromato');

INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'Maglietta BMX Team', 
    'Maglietta ufficiale del team BMX, traspirante e confortevole.', 
    29.99, 
    50, 
    'Abbigliamento', 
    'https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    true, 
    (SELECT id FROM categories WHERE name = 'Abbigliamento')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'Maglietta BMX Team');

INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'Pedali BMX Platform', 
    'Pedali platform in alluminio con pin per massima aderenza.', 
    39.99, 
    40, 
    'Componenti', 
    'https://images.unsplash.com/photo-1583227122027-d2d360c66d3c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    false, 
    (SELECT id FROM categories WHERE name = 'Componenti')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pedali BMX Platform');

-- Aggiungiamo la felpa che è nel frontend
INSERT INTO products (
    name, description, price, stock, category, image_url, 
    brand, created_at, updated_at, featured, category_id
)
SELECT 
    'Felpa RN BMX', 
    'Felpa ufficiale del team RN BMX, traspirante e confortevole.', 
    29.99, 
    12, 
    'Abbigliamento', 
    'http://localhost:3000/felpa-crew.jpg', 
    'RN BMX Shop', 
    NOW(), 
    NOW(), 
    true, 
    (SELECT id FROM categories WHERE name = 'Abbigliamento')
WHERE
    NOT EXISTS (SELECT 1 FROM products WHERE name = 'Felpa RN BMX'); 