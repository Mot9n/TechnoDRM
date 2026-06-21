const db = require('../config/db');

exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const result = await db.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone)
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, role`,
      [first_name, last_name, phone, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, phone, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
};