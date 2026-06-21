<template>
  <div class="orders card">
    <h2>Мои заказы</h2>
    <div v-if="loading" class="text-muted">Загрузка...</div>
    <div v-else-if="!orders.length" class="text-muted">Заказов пока нет.</div>
    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Дата</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>#{{ o.id }}</td>
          <td>{{ formatDate(o.created_at) }}</td>
          <td>{{ formatPrice(o.total_amount) }} ₽</td>
          <td><span :class="['status-badge', `status-${o.status}`]">{{ statusLabel(o.status) }}</span></td>
          <td>
            <router-link :to="{ name: 'account-order', params: { id: o.id } }" class="btn" style="padding:4px 10px;font-size:13px">
              Подробнее
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get('/orders/my');
    orders.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU');
const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
const statusLabels = { new: 'Новый', processing: 'В обработке', shipped: 'Отправлен', completed: 'Завершён', cancelled: 'Отменён' };
const statusLabel = (s) => statusLabels[s] || s;
</script>

<style scoped>
.orders-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.orders-table th, .orders-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
.orders-table th { color: var(--color-muted); font-weight: 500; font-size: 13px; }
.status-badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.status-new { background: #DBEAFE; color: #1D4ED8; }
.status-processing { background: #FEF3C7; color: #D97706; }
.status-shipped { background: #E0F2FE; color: #0369A1; }
.status-completed { background: #D1FAE5; color: #065F46; }
.status-cancelled { background: #FEE2E2; color: #B91C1C; }
</style>
