const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const newOrdersResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM orders WHERE status = 'new'`
    );
    const revenueResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0)::numeric AS revenue
       FROM orders
       WHERE status IN ('completed', 'shipped')
         AND created_at >= NOW() - INTERVAL '30 days'`
    );
    const lowStockResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM products WHERE stock < 5`
    );
    const usersResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'`
    );
    const recentOrders = await db.query(
      `SELECT id, customer_name, total_amount, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 10`
    );

    res.json({
      stats: {
        newOrders: newOrdersResult.rows[0].count,
        revenue: Number(revenueResult.rows[0].revenue),
        lowStock: lowStockResult.rows[0].count,
        users: usersResult.rows[0].count
      },
      recentOrders: recentOrders.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
};