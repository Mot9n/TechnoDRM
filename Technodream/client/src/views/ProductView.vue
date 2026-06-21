<template>
  <div v-if="loading" class="container loading">Загрузка...</div>
  <div v-else-if="!product" class="container empty">Товар не найден</div>
  <div v-else class="product-page container">
    <div class="breadcrumbs">
      <router-link to="/">Главная</router-link> /
      <router-link to="/catalog">Каталог</router-link>
      <template v-if="product.category_slug">
        / <router-link :to="`/catalog/${product.category_slug}`">{{ product.category_name }}</router-link>
      </template>
    </div>

    <div class="product-layout">
      <div class="product-gallery">
        <img :src="imageUrl" :alt="product.name" @error="onImgError" />
      </div>

      <div class="product-details">
        <div class="brand">{{ product.brand }}</div>
        <h1>{{ product.name }}</h1>
        <div class="price-block">
          <div class="price">{{ formatPrice(product.price) }} ₽</div>
          <div :class="['stock', product.stock > 0 ? 'in-stock' : 'out-of-stock']">
            {{ product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии' }}
          </div>
        </div>

        <div class="actions">
          <div class="qty-control">
            <button @click="quantity > 1 && quantity--">−</button>
            <span>{{ quantity }}</span>
            <button @click="quantity < product.stock && quantity++">+</button>
          </div>
          <button class="btn btn-primary" :disabled="product.stock === 0" @click="addToCart">
            🛒 В корзину
          </button>
        </div>

        <div v-if="product.description" class="description">
          <h3>Описание</h3>
          <p>{{ product.description }}</p>
        </div>

        <div v-if="hasSpecs" class="specifications">
          <h3>Характеристики</h3>
          <table>
            <tr v-for="(value, key) in product.specifications" :key="key">
              <td class="spec-key">{{ specLabel(key) }}</td>
              <td class="spec-value">{{ value }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <section class="reviews-section">
      <h2>Отзывы</h2>
      <form v-if="auth.isAuthenticated" class="review-form" @submit.prevent="submitReview">
        <div class="rating-input">
          <span>Оценка:</span>
          <button
            v-for="n in 5" :key="n" type="button"
            :class="['star', { active: n <= newReview.rating }]"
            @click="newReview.rating = n"
          >★</button>
        </div>
        <textarea v-model="newReview.comment" placeholder="Ваш отзыв..." rows="3"></textarea>
        <button type="submit" class="btn btn-primary">Отправить отзыв</button>
      </form>
      <p v-else class="text-muted">
        <router-link to="/login">Войдите</router-link>, чтобы оставить отзыв.
      </p>
      <div v-if="reviews.length" class="reviews-list">
        <div v-for="r in reviews" :key="r.id" class="review">
          <div class="review-header">
            <strong>{{ r.first_name }} {{ r.last_name || '' }}</strong>
            <span class="review-stars">
              <span v-for="n in 5" :key="n" :class="{ filled: n <= r.rating }">★</span>
            </span>
            <span class="review-date">{{ formatDate(r.created_at) }}</span>
          </div>
          <p v-if="r.comment">{{ r.comment }}</p>
        </div>
      </div>
      <p v-else class="text-muted">Отзывов пока нет.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const cart = useCartStore();
const auth = useAuthStore();

const product = ref(null);
const reviews = ref([]);
const loading = ref(true);
const quantity = ref(1);
const fallback = ref(false);
const newReview = ref({ rating: 5, comment: '' });

const apiBase = import.meta.env.VITE_API_URL;

const imageUrl = computed(() => {
  if (fallback.value || !product.value?.image_url) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="%23E5E7EB" width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-family="Arial" font-size="20">Нет фото</text></svg>';
  }
  return apiBase + product.value.image_url;
});

const hasSpecs = computed(() =>
  product.value?.specifications &&
  typeof product.value.specifications === 'object' &&
  Object.keys(product.value.specifications).length > 0
);

const specLabels = {
  screen: 'Экран', memory: 'Память', ram: 'ОЗУ', camera: 'Камера',
  cpu: 'Процессор', gpu: 'Видеокарта', ssd: 'Накопитель',
  diagonal: 'Диагональ', resolution: 'Разрешение', smart_tv: 'Smart TV',
  type: 'Тип', wireless: 'Беспроводные', noise_cancelling: 'Шумоподавление',
  storage: 'Объём памяти'
};
const specLabel = (k) => specLabels[k] || k;

const onImgError = () => { fallback.value = true; };
const formatPrice = (p) => Number(p).toLocaleString('ru-RU');
const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU');

const loadProduct = async () => {
  loading.value = true;
  fallback.value = false;
  quantity.value = 1;
  try {
    const [prodRes, revRes] = await Promise.all([
      api.get(`/products/${route.params.id}`),
      api.get(`/reviews/product/${route.params.id}`)
    ]);
    product.value = prodRes.data;
    reviews.value = revRes.data;
  } catch (e) {
    product.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(loadProduct);
watch(() => route.params.id, loadProduct);

const addToCart = () => {
  if (product.value && product.value.stock > 0) {
    cart.addItem(product.value, quantity.value);
  }
};

const submitReview = async () => {
  try {
    await api.post('/reviews', {
      product_id: product.value.id,
      rating: newReview.value.rating,
      comment: newReview.value.comment
    });
    newReview.value = { rating: 5, comment: '' };
    const { data } = await api.get(`/reviews/product/${product.value.id}`);
    reviews.value = data;
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка при отправке отзыва');
  }
};
</script>

<style scoped>
.loading, .empty { padding: 60px 20px; text-align: center; color: var(--color-muted); }

.breadcrumbs { font-size: 13px; color: var(--color-muted); margin-bottom: 20px; }
.breadcrumbs a { color: var(--color-muted); }

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: var(--radius);
  background: white;
  box-shadow: var(--shadow);
  padding: 20px;
}

.brand { font-size: 13px; color: var(--color-muted); text-transform: uppercase; margin-bottom: 6px; }
h1 { font-size: 24px; margin-bottom: 16px; }

.price-block { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.price { font-size: 28px; font-weight: 700; }
.in-stock { color: var(--color-success); font-size: 13px; }
.out-of-stock { color: var(--color-error); font-size: 13px; }

.actions { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.qty-control {
  display: flex; align-items: center; gap: 10px;
  border: 1px solid var(--color-border); border-radius: var(--radius); padding: 6px 12px;
}
.qty-control button {
  background: none; border: none; font-size: 20px; cursor: pointer; color: var(--color-text);
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
}
.qty-control span { font-weight: 600; font-size: 16px; min-width: 24px; text-align: center; }

.description, .specifications { margin-bottom: 20px; }
.specifications table { width: 100%; border-collapse: collapse; }
.specifications tr { border-bottom: 1px solid var(--color-border); }
.spec-key { padding: 8px 0; color: var(--color-muted); font-size: 13px; width: 40%; }
.spec-value { padding: 8px 0; font-size: 13px; }

.reviews-section { border-top: 1px solid var(--color-border); padding-top: 32px; }
.review-form { background: white; padding: 20px; border-radius: var(--radius); margin-bottom: 24px; }
.rating-input { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 14px; }
.star { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-border); padding: 0; }
.star.active { color: #F59E0B; }
.review-form textarea { width: 100%; margin-bottom: 12px; resize: vertical; }

.reviews-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.review { background: white; padding: 16px; border-radius: var(--radius); box-shadow: var(--shadow); }
.review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.review-stars span { color: var(--color-border); }
.review-stars .filled { color: #F59E0B; }
.review-date { font-size: 12px; color: var(--color-muted); margin-left: auto; }

@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; gap: 20px; }
}
</style>
