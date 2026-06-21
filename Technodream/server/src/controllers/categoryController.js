const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*)::int FROM products WHERE category_id = c.id) AS products_count
       FROM categories c
       ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения категории' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, slug, parent_id, description } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Укажите название и slug' });
    }
    const result = await db.query(
      `INSERT INTO categories (name, slug, parent_id, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, slug, parent_id || null, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Категория с таким slug уже существует' });
    }
    res.status(500).json({ error: 'Ошибка создания категории' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id, description } = req.body;
    const result = await db.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           parent_id = $3,
           description = COALESCE($4, description)
       WHERE id = $5 RETURNING *`,
      [name, slug, parent_id || null, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления категории' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json({ message: 'Категория удалена' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Невозможно удалить категорию: в ней есть товары' });
    }
    res.status(500).json({ error: 'Ошибка удаления категории' });
  }
};