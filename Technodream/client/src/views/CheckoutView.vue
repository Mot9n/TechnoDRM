<template>
  <div class="checkout-page container">
    <h1>Оформление заказа</h1>

    <div v-if="!cart.items.length" class="empty-cart card text-center">
      <p>Корзина пуста. <router-link to="/catalog">Перейти в каталог</router-link></p>
    </div>

    <div v-else class="checkout-layout">
      <form class="checkout-form card" @submit.prevent="submitOrder">
        <h2>Контактные данные</h2>

        <div class="form-row">
          <label>Имя и фамилия *</label>
          <input v-model="form.customer_name" type="text" required placeholder="Иван Иванов" />
        </div>
        <div class="form-row">
          <label>Телефон *</label>
          <input v-model="form.customer_phone" type="tel" required placeholder="+7 (___) ___-__-__" />
        </div>
        <div class="form-row">
          <label>Email</label>
          <input v-model="form.customer_email" type="email" placeholder="example@mail.ru" />
        </div>

        <h2 style="margin-top:24px">Доставка</h2>

        <div class="form-row">
          <label class="radio-label">
            <input type="radio" v-model="form.delivery_method" value="pickup" />
            Самовывоз (бесплатно)
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.delivery_method" value="courier" />
            Курьер
          </label>
        </div>

        <div v-if="form.delivery_method === 'courier'" class="form-row">
          <label>Адрес доставки *</label>
          <input v-model="form.delivery_address" type="text" required placeholder="Улица, дом, квартира" />
        </div>

        <h2 style="margin-top:24px">Оплата</h2>

        <div class="form-row">
          <label class="radio-label">
            <input type="radio" v-model="form.payment_method" value="cash" />
            Наличными при получении
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.payment_method" value="card" />
            Картой при получении
          </label>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting" style="margin-top:20px">
          {{ submitting ? 'Оформляем...' : 'Оформить заказ' }}
        </button>
      </form>

      <div class="order-summary card">
        <h2>Ваш заказ</h2>
        <div v-for="item in cart.items" :key="item.product_id" class="order-item">
          <span class="order-item-name">{{ item.name }}</span>
          <span class="order-item-qty">× {{ item.quantity }}</span>
          <span class="order-item-price">{{ formatPrice(item.price * item.quantity) }} ₽</span>
        </div>
        <div class="order-total">
          <span>Итого:</span>
          <span>{{ formatPrice(cart.totalAmount) }} ₽</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import api from '@/services/api';

const cart = useCartStore();
const router = useRouter();

const form = reactive({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  delivery_method: 'pickup',
  delivery_address: '',
  payment_method: 'cash'
});

const submitting = ref(false);
const error = ref('');

const formatPrice = (p) => Number(p).toLocaleString('ru-RU');

const submitOrder = async () => {
  error.value = '';
  submitting.value = true;
  try {
    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email || undefined,
      delivery_method: form.delivery_method,
      delivery_address: form.delivery_method === 'courier' ? form.delivery_address : undefined,
      payment_method: form.payment_method,
      items: cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    };
    const { data } = await api.post('/orders', payload);
    cart.clear();
    router.push({ name: 'checkout-success', params: { id: data.id } });
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка оформления заказа. Попробуйте снова.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.checkout-page { padding-bottom: 40px; }

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.checkout-form h2 { font-size: 16px; margin-bottom: 14px; }

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  cursor: pointer;
}
.radio-label input { width: auto; }

.order-summary h2 { font-size: 18px; margin-bottom: 16px; }

.order-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 8px;
}
.order-item-name { flex: 1; color: var(--color-text); }
.order-item-qty { color: var(--color-muted); }
.order-item-price { font-weight: 500; white-space: nowrap; }

.order-total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
}
</style>
