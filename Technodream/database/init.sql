-- =====================================================
-- Скрипт инициализации БД "TechnoDream"
-- =====================================================

-- Расширение для нечёткого поиска
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- Таблица пользователей
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Таблица категорий
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- =====================================================
-- Таблица товаров
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(500),
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products USING GIN (name gin_trgm_ops);

-- =====================================================
-- Таблица заказов
-- =====================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT,
    delivery_method VARCHAR(20) NOT NULL
        CHECK (delivery_method IN ('pickup', 'courier')),
    payment_method VARCHAR(20) NOT NULL
        CHECK (payment_method IN ('cash', 'card')),
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'processing', 'shipped', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- Таблица позиций заказа
-- =====================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =====================================================
-- Таблица отзывов
-- =====================================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- =====================================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- =====================================================

-- Администратор (пароль: admin123)
INSERT INTO users (email, password_hash, first_name, role) VALUES
('admin@technodream.ru',
 '$2b$10$rZ8kS3yqJ.X9YqK1QcD0qOPx7mWqQGqJ3fX1aH8YzN3hLqJxB5Pgi',
 'Администратор', 'admin');

-- Тестовый покупатель (пароль: user123)
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('user@test.ru',
 '$2b$10$8K1p/a0dURXAm7QiTRq0qOe5W5Z5G6.X3xZkS9YzN3hLqJxB5Pgi',
 'Иван', 'Иванов', '+79001234567');

-- Категории
INSERT INTO categories (name, slug, description) VALUES
('Смартфоны', 'smartfony', 'Мобильные телефоны и смартфоны'),
('Ноутбуки', 'noutbuki', 'Портативные компьютеры'),
('Телевизоры', 'televizory', 'Телевизоры всех диагоналей'),
('Наушники', 'naushniki', 'Аудиотехника и наушники'),
('Планшеты', 'planshety', 'Планшетные компьютеры'),
('Игровые приставки', 'pristavki', 'Игровые консоли и аксессуары');

-- Товары
INSERT INTO products (category_id, name, brand, description, price, stock, specifications) VALUES
(1, 'Apple iPhone 15 Pro 256GB', 'Apple',
 'Флагманский смартфон с чипом A17 Pro и титановым корпусом', 119990, 15,
 '{"screen": "6.1\"", "memory": "256 GB", "ram": "8 GB", "camera": "48 МП"}'),
(1, 'Samsung Galaxy S24 Ultra 512GB', 'Samsung',
 'Премиальный смартфон с S Pen и экраном Dynamic AMOLED 2X', 129990, 8,
 '{"screen": "6.8\"", "memory": "512 GB", "ram": "12 GB", "camera": "200 МП"}'),
(1, 'Xiaomi Redmi Note 13 Pro', 'Xiaomi',
 'Доступный смартфон с отличной камерой', 24990, 25,
 '{"screen": "6.67\"", "memory": "256 GB", "ram": "8 GB", "camera": "200 МП"}'),
(2, 'Apple MacBook Air 13 M3', 'Apple',
 'Ультрабук с чипом M3 и дисплеем Liquid Retina', 134990, 5,
 '{"cpu": "Apple M3", "ram": "16 GB", "ssd": "512 GB", "screen": "13.6\""}'),
(2, 'ASUS ROG Strix G16', 'ASUS',
 'Игровой ноутбук с RTX 4070', 159990, 7,
 '{"cpu": "Intel Core i7", "ram": "32 GB", "ssd": "1 TB", "gpu": "RTX 4070"}'),
(3, 'LG OLED C3 55"', 'LG',
 '4K OLED-телевизор с поддержкой Dolby Vision', 119990, 4,
 '{"diagonal": "55\"", "resolution": "4K", "smart_tv": true}'),
(3, 'Samsung QLED Q80C 65"', 'Samsung',
 'QLED-телевизор 65 дюймов', 99990, 6,
 '{"diagonal": "65\"", "resolution": "4K", "smart_tv": true}'),
(4, 'Sony WH-1000XM5', 'Sony',
 'Беспроводные наушники с шумоподавлением', 32990, 12,
 '{"type": "накладные", "wireless": true, "noise_cancelling": true}'),
(4, 'Apple AirPods Pro 2', 'Apple',
 'TWS-наушники с активным шумоподавлением', 24990, 20,
 '{"type": "вкладыши", "wireless": true, "noise_cancelling": true}'),
(5, 'Apple iPad Air 11" M2', 'Apple',
 'Планшет с чипом M2', 64990, 10,
 '{"screen": "11\"", "memory": "128 GB", "cpu": "Apple M2"}'),
(6, 'Sony PlayStation 5', 'Sony',
 'Игровая консоль нового поколения', 54990, 9,
 '{"storage": "825 GB", "resolution": "4K"}'),
(6, 'Microsoft Xbox Series X', 'Microsoft',
 'Самая мощная консоль Xbox', 49990, 6,
 '{"storage": "1 TB", "resolution": "4K"}');