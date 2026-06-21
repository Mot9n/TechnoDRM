<template>
  <div class="cart-page container">
    <h1>Корзина</h1>

    <div v-if="!cart.items.length" class="empty-cart card text-center">
      <div style="font-size:64px;margin-bottom:16px">🛒</div>
      <p>Корзина пуста</p>
      <router-link to="/catalog" class="btn btn-primary" style="margin-top:16px">Перейти в каталог</router-link>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.product_id" class="cart-item card">
          <img :src="imageUrl(item)" :alt="item.name" class="cart-item-img" @error="e => e.target.src = placeholder" />
          <div class="cart-item-info">
            <router-link :to="`/product/${item.product_id}`" class="cart-item-name">{{ item.name }}</router-link>
            <div class="cart-item-price">{{ formatPrice(item.price) }} ₽ / шт.</div>
          </div>
          <div class="cart-item-qty">
            <button @click="cart.updateQuantity(item.product_id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="cart.updateQuantity(item.product_id, item.quantity + 1)">+</button>
          </div>
          <div class="cart-item-total">{{ formatPrice(item.price * item.quantity) }} ₽</div>
          <button class="remove-btn" @click="cart.removeItem(item.product_id)" title="Удалить">✕</button>
        </div>
      </div>

      <div class="cart-summary card">
        <h2>Итого</h2>
        <div class="summary-row">
          <span>Товаров:</span>
          <span>{{ cart.totalItems }} шт.</span>
        </div>
        <div class="summary-row total">
          <span>Сумма:</span>
          <span>{{ formatPrice(cart.totalAmount) }} ₽</span>
        </div>
        <router-link to="/checkout" class="btn btn-primary btn-block" style="margin-top:16px">
          Оформить заказ
        </router-link>
        <button class="btn btn-block" style="margin-top:8px;color:var(--color-error)" @click="cart.clear()">
          Очистить корзину
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
const apiBase = import.meta.env.VITE_API_URL;
const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23E5E7EB" width="80" height="80"/></svg>';

const imageUrl = (item) =>
  item.image_url ? apiBase + item.image_url : placeholder;

const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
</script>

<style scoped>
.cart-page { padding-bottom: 40px; }

.empty-cart { max-width: 400px; margin: 60px auto; padding: 40px; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.cart-items { display: flex; flex-direction: column; gap: 12px; }

.cart-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
}

.cart-item-img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 6px;
  background: var(--color-bg);
  flex-shrink: 0;
}

.cart-item-info { flex: 1; min-width: 0; }

.cart-item-name {
  font-weight: 500;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--color-text);
}

.cart-item-price { font-size: 13px; color: var(--color-muted); margin-top: 4px; }

.cart-item-qty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
.cart-item-qty button {
  width: 28px;
  height: 28px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-item-qty button:disabled { opacity: 0.4; cursor: not-allowed; }

.cart-item-total { font-weight: 600; font-size: 15px; min-width: 90px; text-align: right; }

.remove-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}
.remove-btn:hover { color: var(--color-error); }

.cart-summary h2 { font-size: 18px; margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
.summary-row.total { font-size: 18px; font-weight: 700; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border); }

@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-item { flex-wrap: wrap; }
  .cart-item-total { margin-left: auto; }
}
</style>
