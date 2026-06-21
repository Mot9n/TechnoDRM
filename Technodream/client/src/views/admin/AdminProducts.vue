<template>
  <div class="admin-products">
    <div class="page-header">
      <h1>Товары</h1>
      <button class="btn btn-primary" @click="openCreate">+ Добавить товар</button>
    </div>

    <div class="filters-bar card">
      <input v-model="search" type="text" placeholder="Поиск по названию..." style="max-width:260px" />
      <select v-model="categoryFilter" style="max-width:200px">
        <option value="">Все категории</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="card" style="margin-top:16px">
      <div v-if="loading" class="text-muted" style="padding:20px">Загрузка...</div>
      <table v-else class="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Категория</th><th>Бренд</th><th>Цена</th><th>Склад</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredProducts" :key="p.id">
            <td>{{ p.id }}</td>
            <td>{{ p.name }}</td>
            <td>{{ p.category_name }}</td>
            <td>{{ p.brand || '—' }}</td>
            <td>{{ formatPrice(p.price) }} ₽</td>
            <td :class="{ 'low-stock': p.stock < 5 }">{{ p.stock }}</td>
            <td class="actions-cell">
              <button class="btn" style="padding:4px 10px;font-size:13px" @click="openEdit(p)">Изменить</button>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:13px" @click="deleteProduct(p)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модал создания/редактирования -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card card">
        <h2>{{ editProduct ? 'Изменить товар' : 'Новый товар' }}</h2>
        <form @submit.prevent="saveProduct">
          <div class="form-row">
            <label>Название *</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-row">
            <label>Категория *</label>
            <select v-model="form.category_id" required>
              <option value="">Выберите...</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>Бренд</label>
            <input v-model="form.brand" />
          </div>
          <div class="form-row">
            <label>Описание</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-row-2">
            <div class="form-row">
              <label>Цена *</label>
              <input v-model.number="form.price" type="number" min="0" step="0.01" required />
            </div>
            <div class="form-row">
              <label>На складе</label>
              <input v-model.number="form.stock" type="number" min="0" />
            </div>
          </div>
          <div class="form-row">
            <label>Фото товара</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="onFile" />
            <img v-if="imagePreview" :src="imagePreview" class="img-preview" />
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn" @click="showModal = false">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const search = ref('');
const categoryFilter = ref('');
const showModal = ref(false);
const editProduct = ref(null);
const saving = ref(false);
const formError = ref('');
const imageFile = ref(null);
const imagePreview = ref('');

const form = reactive({ name: '', category_id: '', brand: '', description: '', price: 0, stock: 0 });

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchSearch = !search.value || p.name.toLowerCase().includes(search.value.toLowerCase());
    const matchCat = !categoryFilter.value || p.category_id === Number(categoryFilter.value);
    return matchSearch && matchCat;
  });
});

const formatPrice = (p) => Number(p).toLocaleString('ru-RU');

const loadData = async () => {
  loading.value = true;
  try {
    const [prodRes, catRes] = await Promise.all([
      api.get('/products?limit=200'),
      api.get('/categories')
    ]);
    products.value = prodRes.data.items;
    categories.value = catRes.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const openCreate = () => {
  editProduct.value = null;
  Object.assign(form, { name: '', category_id: '', brand: '', description: '', price: 0, stock: 0 });
  imageFile.value = null;
  imagePreview.value = '';
  formError.value = '';
  showModal.value = true;
};

const openEdit = (p) => {
  editProduct.value = p;
  Object.assign(form, { name: p.name, category_id: p.category_id, brand: p.brand || '', description: p.description || '', price: p.price, stock: p.stock });
  imageFile.value = null;
  imagePreview.value = p.image_url ? import.meta.env.VITE_API_URL + p.image_url : '';
  formError.value = '';
  showModal.value = true;
};

const onFile = (e) => {
  imageFile.value = e.target.files[0] || null;
  if (imageFile.value) imagePreview.value = URL.createObjectURL(imageFile.value);
};

const saveProduct = async () => {
  saving.value = true;
  formError.value = '';
  try {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
    if (imageFile.value) fd.append('image', imageFile.value);

    if (editProduct.value) {
      await api.put(`/products/${editProduct.value.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    showModal.value = false;
    await loadData();
  } catch (e) {
    formError.value = e.response?.data?.error || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (p) => {
  if (!confirm(`Удалить "${p.name}"?`)) return;
  try {
    await api.delete(`/products/${p.id}`);
    await loadData();
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка удаления');
  }
};
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.filters-bar { display: flex; gap: 12px; padding: 14px; margin-bottom: 4px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
.data-table th { color: var(--color-muted); font-size: 12px; text-transform: uppercase; font-weight: 500; }
.low-stock { color: var(--color-error); font-weight: 600; }
.actions-cell { display: flex; gap: 6px; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal-card { width: 540px; max-height: 90vh; overflow-y: auto; padding: 28px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.img-preview { max-width: 120px; margin-top: 8px; border-radius: 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
</style>
