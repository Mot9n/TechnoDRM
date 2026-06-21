require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const hash = await bcrypt.hash('admin123', 10);

  await pool.query(`DELETE FROM users WHERE email = 'admin@technodream.ru'`);

  await pool.query(
    `INSERT INTO users (email, password_hash, first_name, role)
     VALUES ($1, $2, $3, 'admin')`,
    ['admin@technodream.ru', hash, 'Администратор']
  );

  console.log('✅ Администратор создан!');
  console.log('   Email: admin@technodream.ru');
  console.log('   Пароль: admin123');

  await pool.end();
}

main().catch(err => {
  console.error('❌ Ошибка:', err.message);
  process.exit(1);
});
