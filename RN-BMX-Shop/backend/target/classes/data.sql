-- Reimposta la password per tutti gli utenti al valore noto 'password123'
-- Il valore BCrypt codificato è '$2a$10$yfA0uyOQkEBVgwm9PJiOwe9ZpJZ64vACbsI5CJq0mMtG0fLqrIlnu'

-- ATTENZIONE: La seguente riga è stata commentata per evitare il reset delle password ad ogni riavvio
-- UPDATE users SET password = '$2a$10$yfA0uyOQkEBVgwm9PJiOwe9ZpJZ64vACbsI5CJq0mMtG0fLqrIlnu' WHERE 1=1;

-- Inserisce un utente admin con la password 'password123' solo se non esiste già
INSERT INTO users (
  first_name, last_name, name, surname, email, phone, password, 
  country, city, address, gender, username, created_at
)
SELECT 
  'Admin', 'User', 'Admin User', 'User', 'admin@rnbmx.com', '1234567890', 
  '$2a$10$yfA0uyOQkEBVgwm9PJiOwe9ZpJZ64vACbsI5CJq0mMtG0fLqrIlnu',
  'Italy', 'Rome', 'Via Admin 123', 'Male', 'admin.user', CURRENT_TIMESTAMP
WHERE
  NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@rnbmx.com');

-- Assegna ruoli all'utente admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@rnbmx.com' AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@rnbmx.com' AND r.name = 'ROLE_USER'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assicurati che esistano i ruoli di base
INSERT INTO roles (name) 
SELECT 'ROLE_USER' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_USER');

INSERT INTO roles (name) 
SELECT 'ROLE_ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

-- ATTENZIONE: Le seguenti righe sono state commentate per evitare la ricreazione dell'utente test
-- Crea un utente di test completamente nuovo (cancella se esiste)
-- DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'test@gmail.com');
-- DELETE FROM users WHERE email = 'test@gmail.com';

-- Crea un utente di test con tutti i campi obbligatori
INSERT INTO users (
  id, first_name, last_name, name, surname, email, phone, password, 
  country, city, address, gender, username, created_at
)
SELECT
  999, 'Test', 'User', 'Test User', 'User', 'test@gmail.com', '1234567890', 
  '$2a$10$yfA0uyOQkEBVgwm9PJiOwe9ZpJZ64vACbsI5CJq0mMtG0fLqrIlnu',
  'Italy', 'Rome', 'Via Test 123', 'Male', 'test.user', CURRENT_TIMESTAMP
WHERE
  NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@gmail.com');

-- Assegna ruoli all'utente test
INSERT INTO user_roles (user_id, role_id)
SELECT 999, r.id FROM roles r WHERE r.name = 'ROLE_USER'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = 999 AND ur.role_id = r.id
);

-- Stampa log per debugging
DO $$
DECLARE
  user_count INTEGER;
  role_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO role_count FROM roles;
  RAISE NOTICE 'Numero totale di utenti: %', user_count;
  RAISE NOTICE 'Numero totale di ruoli: %', role_count;
END
$$; 