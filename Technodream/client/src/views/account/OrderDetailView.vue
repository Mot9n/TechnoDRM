<template>
  <div class="order-detail card">
    <div v-if="loading" class="text-muted">Загрузка...</div>
    <div v-else-if="!order" class="text-muted">Заказ не найден.</div>
    <div v-else>
      <div class="order-header">
        <h2>Заказ #{{ order.id }}</h2>
        <span :class="['status-badge', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
      </div>
      <div class="order-meta">
        <span>{{ formatDate(order.created_at) }}</span>
        <span>{{ deliveryLabel(order.delivery_method) }}</span>
        <span>{{ paymentLabel(order.payment_method) }}</span>
      </div>
      <div v-if="order.delivery_address" class="text-muted" style="font-size:13px;margin-bottom:12px">
        Адрес: {{ order.delivery_address }}
      </div>

      <table class="items-table">
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
      </table>

      <div class="order-total">
        Итого: <strong>{{ formatPrice(order.total_amount) }} ₽</strong>
      </div>

      <router-link :to="{ name: 'account-orders' }" class="btn" style="margin-top:16px">← Назад к заказам</router-link>
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

onMounted(async () => {
  try {
    const { data } = await api.get(`/orders/${route.params.id}`);
    order.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
const statusLabels = { new: 'Новый', processing: 'В обработке', shipped: 'Отправлен', completed: 'Завершён', cancelled: 'Отменён' };
const statusLabel = (s) => statusLabels[s] || s;
const deliveryLabel = (m) => m === 'pickup' ? 'Самовывоз' : 'Курьерская доставка';
const paymentLabel = (m) => m === 'cash' ? 'Наличными' : 'Картой';
</script>

<style scoped>
.order-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.order-meta { display: flex; gap: 16px; font-size: 13px; color: var(--color-muted); margin-bottom: 16px; }
.items-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 14px; }
.items-table th, .items-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--color-border); }
.items-table th { color: var(--color-muted); font-size: 12px; font-weight: 500; text-transform: uppercase; }
.order-total { text-align: right; font-size: 16px; }
.status-badge { padding: 3px 8px; border-radius: 4px; font-size: 13px; font-weight: 500; }
.status-new { background: #DBEAFE; color: #1D4ED8; }
.status-processing { background: #FEF3C7; color: #D97706; }
.status-shipped { background: #E0F2FE; color: #0369A1; }
.status-completed { background: #D1FAE5; color: #065F46; }
.status-cancelled { background: #FEE2E2; color: #B91C1C; }
</style>
