require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

(async () => {
  try {
    // ============================
    // АДМИНИСТРАТОР
    // ============================
    const adminEmail = 'admin@technodream.ru';
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 10);

    await db.query(`DELETE FROM users WHERE email = $1`, [adminEmail]);
    await db.query(
      `INSERT INTO users (email, password_hash, first_name, role)
       VALUES ($1, $2, $3, 'admin')`,
      [adminEmail, adminHash, 'Администратор']
    );
    console.log(`✅ Администратор создан: ${adminEmail} / ${adminPassword}`);

    // ============================
    // ТЕСТОВЫЙ ПОКУПАТЕЛЬ
    // ============================
    const userEmail = 'user@test.ru';
    const userPassword = 'user123';
    const userHash = await bcrypt.hash(userPassword, 10);

    await db.query(`DELETE FROM users WHERE email = $1`, [userEmail]);
    await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, 'customer')`,
      [userEmail, userHash, 'Иван', 'Иванов', '+79001234567']
    );
    console.log(`✅ Покупатель создан: ${userEmail} / ${userPassword}`);

    console.log('\n🎉 Готово!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  }
})();