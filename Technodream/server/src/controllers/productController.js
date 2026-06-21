const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const {
      category, brand, minPrice, maxPrice, inStock,
      search, sort = 'created_desc', page = 1, limit = 12
    } = req.query;

    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`(p.category_id::text = $${params.length} OR c.slug = $${params.length})`);
    }
    if (brand) {
      const brands = Array.isArray(brand) ? brand : [brand];
      params.push(brands);
      conditions.push(`p.brand = ANY($${params.length})`);
    }
    if (minPrice) {
      params.push(minPrice);
      conditions.push(`p.price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(maxPrice);
      conditions.push(`p.price <= $${params.length}`);
    }
    if (inStock === 'true') {
      conditions.push(`p.stock > 0`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`p.name ILIKE $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      name_asc: 'p.name ASC',
      created_desc: 'p.created_at DESC'
    };
    const orderBy = sortMap[sort] || sortMap.created_desc;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await db.query(query, params);

    const countParams = params.slice(0, -2);
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, countParams);

    res.json({
      items: result.rows,
      total: countResult.rows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].total / parseInt(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL`;
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category_id = $1`;
    }
    query += ` ORDER BY brand`;
    const result = await db.query(query, params);
    res.json(result.rows.map(r => r.brand));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения брендов' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category_id, brand, description, price, stock, specifications } = req.body;
    if (!name || !category_id || price === undefined) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    let specs = null;
    if (specifications) {
      try {
        specs = typeof specifications === 'string'
          ? JSON.parse(specifications)
          : specifications;
      } catch (e) {
        specs = null;
      }
    }

    const result = await db.query(
      `INSERT INTO products (category_id, name, brand, description, price, stock, image_url, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [category_id, name, brand || null, description || null, price, stock || 0, imageUrl, specs]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, brand, description, price, stock, specifications } = req.body;

    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    let imageUrl = existing.rows[0].image_url;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    let specs = existing.rows[0].specifications;
    if (specifications) {
      try {
        specs = typeof specifications === 'string'
          ? JSON.parse(specifications)
          : specifications;
      } catch (e) {
        // оставляем старое значение
      }
    }

    const result = await db.query(
      `UPDATE products
       SET name = $1, category_id = $2, brand = $3, description = $4,
           price = $5, stock = $6, image_url = $7, specifications = $8
       WHERE id = $9
       RETURNING *`,
      [
        name || existing.rows[0].name,
        category_id || existing.rows[0].category_id,
        brand !== undefined ? brand : existing.rows[0].brand,
        description !== undefined ? description : existing.rows[0].description,
        price !== undefined ? price : existing.rows[0].price,
        stock !== undefined ? stock : existing.rows[0].stock,
        imageUrl,
        specs,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Невозможно удалить товар: он присутствует в заказах' });
    }
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
};