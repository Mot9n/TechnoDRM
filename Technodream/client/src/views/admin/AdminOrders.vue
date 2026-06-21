<template>
  <div class="admin-orders">
    <div class="page-header">
      <h1>Заказы</h1>
      <select v-model="statusFilter" style="max-width:200px">
        <option value="">Все статусы</option>
        <option value="new">Новые</option>
        <option value="processing">В обработке</option>
        <option value="shipped">Отправлены</option>
        <option value="completed">Завершены</option>
        <option value="cancelled">Отменены</option>
      </select>
    </div>

    <div class="card">
      <div v-if="loading" class="text-muted" style="padding:20px">Загрузка...</div>
      <table v-else class="data-table">
        <thead>
          <tr><th>№</th><th>Дата</th><th>Покупатель</th><th>Телефон</th><th>Доставка</th><th>Сумма</th><th>Статус</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="o in filteredOrders" :key="o.id">
            <td>
              <router-link :to="{ name: 'admin-order', params: { id: o.id } }">#{{ o.id }}</router-link>
            </td>
            <td>{{ formatDate(o.created_at) }}</td>
            <td>{{ o.customer_name }}</td>
            <td>{{ o.customer_phone }}</td>
            <td>{{ deliveryLabel(o.delivery_method) }}</td>
            <td>{{ formatPrice(o.total_amount) }} ₽</td>
            <td>
              <select :value="o.status" @change="changeStatus(o, $event.target.value)" class="status-select">
                <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </td>
            <td>
              <router-link :to="{ name: 'admin-order', params: { id: o.id } }" class="btn" style="padding:4px 10px;font-size:13px">
                Детали
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const orders = ref([]);
const loading = ref(true);
const statusFilter = ref('');

const statuses = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' }
];

const filteredOrders = computed(() =>
  statusFilter.value ? orders.value.filter(o => o.status === statusFilter.value) : orders.value
);

const load = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/orders');
    orders.value = data;
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU');
const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
const deliveryLabel = (m) => m === 'pickup' ? 'Самовывоз' : 'Курьер';

const changeStatus = async (order, newStatus) => {
  const old = order.status;
  order.status = newStatus;
  try {
    await api.patch(`/orders/${order.id}`, { status: newStatus });
  } catch (e) {
    order.status = old;
    alert(e.response?.data?.error || 'Ошибка обновления статуса');
  }
};
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th, .data-table td { padding: 10px 10px; text-align: left; border-bottom: 1px solid var(--color-border); }
.data-table th { color: var(--color-muted); font-size: 11px; text-transform: uppercase; font-weight: 500; }
.status-select { font-size: 12px; padding: 4px 6px; width: auto; }
</style>
