<template>
  <div class="product-card">
    <router-link :to="`/product/${product.id}`" class="product-link">
      <div class="product-image">
        <img :src="imageUrl" :alt="product.name" @error="onImgError" />
        <span v-if="product.stock === 0" class="badge out-of-stock">Нет в наличии</span>
      </div>
      <div class="product-info">
        <div class="product-brand">{{ product.brand || '—' }}</div>
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
      </div>
    </router-link>
    <button
      class="btn btn-primary btn-block"
      :disabled="product.stock === 0"
      @click="addToCart"
    >
      {{ product.stock === 0 ? 'Нет в наличии' : 'В корзину' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';

const props = defineProps({
  product: { type: Object, required: true }
});

const cart = useCartStore();
const apiBase = import.meta.env.VITE_API_URL;
const fallback = ref(false);

const imageUrl = computed(() => {
  if (fallback.value || !props.product.image_url) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23E5E7EB" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-family="Arial" font-size="16">Нет фото</text></svg>';
  }
  return apiBase + props.product.image_url;
});

const onImgError = () => { fallback.value = true; };

const formatPrice = (p) => Number(p).toLocaleString('ru-RU');

const addToCart = () => {
  cart.addItem(props.product);
};
</script>

<style scoped>
.product-card {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.product-link {
  flex: 1;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}
.product-image {
  position: relative;
  aspect-ratio: 1;
  background: #f9fafb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.badge.out-of-stock {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-error);
  color: white;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
}
.product-brand {
  font-size: 12px;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.3;
  min-height: 36px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
.product-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}
</style>