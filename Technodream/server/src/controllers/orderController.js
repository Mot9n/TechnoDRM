const db = require('../config/db');

exports.create = async (req, res) => {
  const {
    customer_name, customer_phone, customer_email,
    delivery_method, delivery_address,
    payment_method, items
  } = req.body;

  if (!customer_name || !customer_phone || !delivery_method || !payment_method || !items?.length) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (delivery_method === 'courier' && !delivery_address) {
    return res.status(400).json({ error: 'Укажите адрес доставки' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      if (!rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Товар #${item.product_id} не найден` });
      }
      const product = rows[0];
      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Недостаточно товара #${item.product_id} на складе` });
      }
      totalAmount += Number(product.price) * item.quantity;
      resolvedItems.push({ product_id: product.id, price: product.price, quantity: item.quantity });
    }

    const orderResult = await client.query(
      `INSERT INTO orders
         (user_id, customer_name, customer_phone, customer_email,
          delivery_method, delivery_address, payment_method, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        req.user?.userId || null,
        customer_name, customer_phone, customer_email || null,
        delivery_method, delivery_address || null,
        payment_method, totalAmount
      ]
    );
    const order = orderResult.rows[0];

    for (const item of resolvedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Ошибка оформления заказа' });
  } finally {
    client.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    const order = orderResult.rows[0];

    // Пользователь может смотреть только свои заказы, админ — любые
    if (req.user.role !== 'admin' && order.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const itemsResult = await db.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения заказа' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE status = $1`;
    }
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }
    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
};