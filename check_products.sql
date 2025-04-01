-- Query per elencare tutti i prodotti
SELECT p.id, p.name, p.description, p.price, p.stock as stock_quantity, p.category, 
       p.image_url, p.created_at, p.updated_at, p.featured, p.brand, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.id; 