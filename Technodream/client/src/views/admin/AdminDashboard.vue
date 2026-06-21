<template>
  <div class="dashboard">
    <h1>Дашборд</h1>

    <div v-if="loading" class="text-muted">Загрузка...</div>
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon">🛒</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.newOrders }}</div>
            <div class="stat-label">Новых заказов</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">{{ formatPrice(stats.revenue) }} ₽</div>
            <div class="stat-label">Выручка (30 дней)</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.lowStock }}</div>
            <div class="stat-label">Мало на складе</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.users }}</div>
            <div class="stat-label">Покупателей</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:24px">
        <h2>Последние заказы</h2>
        <table class="data-table">
          <thead>
            <tr><th>№</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr>
          </thead>
          <tbody>
            <tr v-for="o in recentOrders" :key="o.id">
              <td>
                <router-link :to="{ name: 'admin-order', params: { id: o.id } }">#{{ o.id }}</router-link>
              </td>
              <td>{{ o.customer_name }}</td>
              <td>{{ formatPrice(o.total_amount) }} ₽</td>
              <td><span :class="['status-badge', `status-${o.status}`]">{{ statusLabel(o.status) }}</span></td>
              <td>{{ formatDate(o.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const loading = ref(true);
const stats = ref({ newOrders: 0, revenue: 0, lowStock: 0, users: 0 });
const recentOrders = ref([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/stats');
    stats.value = data.stats;
    recentOrders.value = data.recentOrders;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU');
const statusLabels = { new: 'Новый', processing: 'В обработке', shipped: 'Отправлен', completed: 'Завершён', cancelled: 'Отменён' };
const statusLabel = (s) => statusLabels[s] || s;
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 8px;
}
.stat-card { display: flex; align-items: center; gap: 14px; padding: 18px; }
.stat-icon { font-size: 32px; }
.stat-value { font-size: 24px; font-weight: 700; }
.stat-label { font-size: 13px; color: var(--color-muted); margin-top: 2px; }

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 12px; }
.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
.data-table th { color: var(--color-muted); font-size: 12px; text-transform: uppercase; font-weight: 500; }

.status-badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.status-new { background: #DBEAFE; color: #1D4ED8; }
.status-processing { background: #FEF3C7; color: #D97706; }
.status-shipped { background: #E0F2FE; color: #0369A1; }
.status-completed { background: #D1FAE5; color: #065F46; }
.status-cancelled { background: #FEE2E2; color: #B91C1C; }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }
</style>
