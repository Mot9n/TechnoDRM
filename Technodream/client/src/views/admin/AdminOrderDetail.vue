<template>
  <div class="order-detail">
    <div class="page-header">
      <router-link :to="{ name: 'admin-orders' }" class="btn">← Заказы</router-link>
      <h1>Заказ #{{ route.params.id }}</h1>
    </div>

    <div v-if="loading" class="text-muted">Загрузка...</div>
    <div v-else-if="!order">Заказ не найден</div>
    <div v-else class="order-grid">
      <div class="card">
        <h2>Информация</h2>
        <div class="info-grid">
          <div><span class="label">Покупатель</span><span>{{ order.customer_name }}</span></div>
          <div><span class="label">Телефон</span><span>{{ order.customer_phone }}</span></div>
          <div><span class="label">Email</span><span>{{ order.customer_email || '—' }}</span></div>
          <div><span class="label">Доставка</span><span>{{ deliveryLabel(order.delivery_method) }}</span></div>
          <div><span class="label">Оплата</span><span>{{ paymentLabel(order.payment_method) }}</span></div>
          <div v-if="order.delivery_address">
            <span class="label">Адрес</span><span>{{ order.delivery_address }}</span>
          </div>
          <div><span class="label">Дата</span><span>{{ formatDate(order.created_at) }}</span></div>
        </div>
      </div>

      <div class="card">
        <h2>Статус</h2>
        <select v-model="order.status" @change="updateStatus" class="status-select-big">
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>

      <div class="card order-items-card">
        <h2>Позиции заказа</h2>
        <table class="data-table">
          <thead>
            <tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.id">
              <td>{{ item.product_name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatPrice(item.price) }} ₽</td>
              <td>{{ formatPrice(item.price * item.quantity) }} ₽</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Итого</strong></td>
              <td><strong>{{ formatPrice(order.total_amount) }} ₽</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const order = ref(null);
const loading = ref(true);

const statuses = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' }
];

onMounted(async () => {
  try {
    const { data } = await api.get(`/orders/${route.params.id}`);
    order.value = data;
  } finally {
    loading.value = false;
  }
});

const updateStatus = async () => {
  try {
    await api.patch(`/orders/${order.value.id}`, { status: order.value.status });
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
const deliveryLabel = (m) => m === 'pickup' ? 'Самовывоз' : 'Курьерская доставка';
const paymentLabel = (m) => m === 'cash' ? 'Наличными' : 'Картой';
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.order-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.order-items-card { grid-column: 1 / -1; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-grid > div { display: flex; flex-direction: column; gap: 2px; }
.label { font-size: 11px; color: var(--color-muted); text-transform: uppercase; font-weight: 500; }
.status-select-big { font-size: 15px; padding: 8px 12px; margin-top: 8px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px; }
.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
.data-table th { font-size: 12px; color: var(--color-muted); text-transform: uppercase; font-weight: 500; }
.data-table tfoot td { font-size: 15px; border-bottom: none; padding-top: 14px; }
@media (max-width: 768px) { .order-grid { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } }
</style>
