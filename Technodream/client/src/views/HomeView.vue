<template>
  <div class="home">
    <section class="container hero">
      <div class="hero-content">
        <h1>Электроника, о которой вы мечтаете</h1>
        <p>Смартфоны, ноутбуки, телевизоры и техника для дома — с доставкой и гарантией.</p>
        <router-link to="/catalog" class="btn btn-accent">Перейти в каталог</router-link>
      </div>
      <div class="hero-image">⚡</div>
    </section>

    <section class="container section">
      <h2>Категории</h2>
      <div class="categories-grid">
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="`/catalog/${cat.slug}`"
          class="category-card"
        >
          <div class="category-icon">{{ getCategoryIcon(cat.slug) }}</div>
          <div class="category-name">{{ cat.name }}</div>
          <div class="category-count">{{ cat.products_count }} товаров</div>
        </router-link>
      </div>
    </section>

    <section class="container section">
      <h2>Популярные товары</h2>
      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else class="products-grid">
        <ProductCard v-for="p in popularProducts" :key="p.id" :product="p" />
      </div>
    </section>

    <section class="container features">
      <div class="feature">
        <div class="feature-icon">🚚</div>
        <div>
          <h3>Быстрая доставка</h3>
          <p>По Екатеринбургу — в день заказа</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">✅</div>
        <div>
          <h3>Официальная гарантия</h3>
          <p>Только оригинальная техника</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">💳</div>
        <div>
          <h3>Удобная оплата</h3>
          <p>Наличными или картой</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import ProductCard from '@/components/product/ProductCard.vue';

const categories = ref([]);
const popularProducts = ref([]);
const loading = ref(true);

const icons = {
  smartfony: '📱',
  noutbuki: '💻',
  televizory: '📺',
  naushniki: '🎧',
  planshety: '📱',
  pristavki: '🎮'
};
const getCategoryIcon = (slug) => icons[slug] || '🔌';

onMounted(async () => {
  try {
    const [catRes, prodRes] = await Promise.all([
      api.get('/categories'),
      api.get('/products?limit=8&sort=created_desc')
    ]);
    categories.value = catRes.data;
    popularProducts.value = prodRes.data.items;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1E5AC8, #3B82F6);
  border-radius: 12px;
  color: white;
  margin-bottom: 32px;
}
.hero-content { flex: 1; }
.hero-content h1 { color: white; font-size: 32px; margin-bottom: 12px; }
.hero-content p { font-size: 16px; opacity: 0.9; margin-bottom: 20px; }
.hero-image { font-size: 120px; opacity: 0.5; }

.section { margin-bottom: 36px; }

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.category-card {
  background: white;
  padding: 18px;
  border-radius: var(--radius);
  text-align: center;
  text-decoration: none;
  color: var(--color-text);
  transition: transform 0.15s;
  box-shadow: var(--shadow);
}
.category-card:hover { transform: translateY(-2px); }
.category-icon { font-size: 36px; margin-bottom: 8px; }
.category-name { font-weight: 500; font-size: 14px; }
.category-count { font-size: 12px; color: var(--color-muted); margin-top: 4px; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: var(--radius);
  margin-bottom: 24px;
}
.feature { display: flex; align-items: center; gap: 14px; }
.feature-icon { font-size: 36px; }
.feature h3 { font-size: 15px; margin-bottom: 4px; }
.feature p { font-size: 13px; color: var(--color-muted); }

.loading { text-align: center; padding: 40px; color: var(--color-muted); }

@media (max-width: 1024px) {
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .hero { flex-direction: column; text-align: center; }
  .hero-image { font-size: 80px; }
  .products-grid { grid-template-columns: repeat(2, 1fr); }
  .features { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>