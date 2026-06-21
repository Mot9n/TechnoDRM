<template>
  <div class="catalog container">
    <h1>{{ pageTitle }}</h1>

    <div class="catalog-layout">
      <!-- Фильтры -->
      <aside class="filters">
        <div class="filter-block">
          <h3>Цена</h3>
          <div class="price-inputs">
            <input v-model.number="filters.minPrice" type="number" placeholder="От" min="0" />
            <input v-model.number="filters.maxPrice" type="number" placeholder="До" min="0" />
          </div>
        </div>

        <div v-if="brands.length" class="filter-block">
          <h3>Бренд</h3>
          <label v-for="b in brands" :key="b" class="checkbox">
            <input type="checkbox" :value="b" v-model="filters.brands" />
            {{ b }}
          </label>
        </div>

        <div class="filter-block">
          <label class="checkbox">
            <input type="checkbox" v-model="filters.inStock" />
            Только в наличии
          </label>
        </div>

        <button class="btn btn-block" @click="resetFilters">Сбросить фильтры</button>
      </aside>

      <!-- Основной контент -->
      <div class="catalog-main">
        <div class="toolbar">
          <span class="results-count">Найдено: {{ total }}</span>
          <select v-model="filters.sort">
            <option value="created_desc">Сначала новые</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
            <option value="name_asc">По названию</option>
          </select>
        </div>

        <div v-if="loading" class="loading">Загрузка...</div>
        <div v-else-if="!products.length" class="empty">Товары не найдены</div>
        <div v-else class="products-grid">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="btn" :disabled="page <= 1" @click="page--">← Назад</button>
          <span>Стр. {{ page }} из {{ totalPages }}</span>
          <button class="btn" :disabled="page >= totalPages" @click="page++">Вперёд →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import ProductCard from '@/components/product/ProductCard.vue';

const route = useRoute();

const products = ref([]);
const brands = ref([]);
const total = ref(0);
const totalPages = ref(1);
const page = ref(1);
const loading = ref(false);
const categoryName = ref('');

const filters = reactive({
  minPrice: null,
  maxPrice: null,
  brands: [],
  inStock: false,
  sort: 'created_desc'
});

const pageTitle = computed(() => {
  if (route.query.search) return `Поиск: "${route.query.search}"`;
  if (categoryName.value) return categoryName.value;
  return 'Каталог';
});

const loadBrands = async () => {
  try {
    const params = {};
    if (route.params.slug) params.category = route.params.slug;
    const { data } = await api.get('/products/brands', { params });
    brands.value = data;
  } catch (e) { console.error(e); }
};

const loadCategoryInfo = async () => {
  if (!route.params.slug) {
    categoryName.value = '';
    return;
  }
  try {
    const { data } = await api.get(`/categories/${route.params.slug}`);
    categoryName.value = data.name;
  } catch (e) { categoryName.value = ''; }
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      limit: 12,
      sort: filters.sort
    };
    if (route.params.slug) params.category = route.params.slug;
    if (route.query.search) params.search = route.query.search;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = true;
    if (filters.brands.length) params.brand = filters.brands;

    const { data } = await api.get('/products', { params });
    products.value = data.items;
    total.value = data.total;
    totalPages.value = data.totalPages;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.minPrice = null;
  filters.maxPrice = null;
  filters.brands = [];
  filters.inStock = false;
  filters.sort = 'created_desc';
  page.value = 1;
};

// При изменении фильтров — сбрасываем страницу и перезагружаем
watch(
  () => [filters.minPrice, filters.maxPrice, filters.inStock, filters.sort, filters.brands.length],
  () => {
    page.value = 1;
    loadProducts();
  }
);

// При смене страницы — подгружаем
watch(page, loadProducts);

// При смене категории/поиска — перезагружаем всё
watch(
  () => [route.params.slug, route.query.search],
  () => {
    page.value = 1;
    resetFilters();
    loadCategoryInfo();
    loadBrands();
    loadProducts();
  }
);

onMounted(() => {
  loadCategoryInfo();
  loadBrands();
  loadProducts();
});
</script>

<style scoped>
.catalog { padding: 20px; }

.catalog-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  margin-top: 20px;
}

.filters {
  background: var(--color-white);
  padding: 18px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  align-self: start;
  position: sticky;
  top: 80px;
}

.filter-block {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 14px;
  margin-bottom: 14px;
}
.filter-block:last-of-type {
  border-bottom: none;
}
.filter-block h3 {
  font-size: 14px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-muted);
}

.price-inputs {
  display: flex;
  gap: 6px;
}
.price-inputs input {
  font-size: 13px;
  padding: 8px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 6px;
  cursor: pointer;
}
.checkbox input {
  width: auto;
  margin: 0;
}

.catalog-main {
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar select {
  width: auto;
  min-width: 200px;
}
.results-count {
  font-size: 14px;
  color: var(--color-muted);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-muted);
  background: var(--color-white);
  border-radius: var(--radius);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }
  .filters {
    position: static;
  }
}

@media (max-width: 480px) {
  .products-grid { grid-template-columns: 1fr; }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .toolbar select { width: 100%; }
}
</style>