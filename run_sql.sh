#!/bin/bash
echo "Esecuzione dello script SQL per inserire prodotti di test..."
PGPASSWORD=1hhPgsa127 psql -U postgres -d rnbmx_shop -f insert_test_products.sql

echo
echo "Verifica i prodotti nel database..."
PGPASSWORD=1hhPgsa127 psql -U postgres -d rnbmx_shop -c "SELECT COUNT(*) FROM products;"
PGPASSWORD=1hhPgsa127 psql -U postgres -d rnbmx_shop -c "SELECT id, name, category, price, stock FROM products;"

echo
echo "Script SQL completato." 