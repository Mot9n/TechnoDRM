<template>
  <div class="admin-categories">
    <div class="page-header">
      <h1>Категории</h1>
      <button class="btn btn-primary" @click="openCreate">+ Добавить категорию</button>
    </div>

    <div class="card">
      <div v-if="loading" class="text-muted" style="padding:20px">Загрузка...</div>
      <table v-else class="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Slug</th><th>Товаров</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.name }}</td>
            <td><code>{{ c.slug }}</code></td>
            <td>{{ c.products_count }}</td>
            <td class="actions-cell">
              <button class="btn" style="padding:4px 10px;font-size:13px" @click="openEdit(c)">Изменить</button>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:13px" @click="deleteCategory(c)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card card">
        <h2>{{ editCategory ? 'Изменить категорию' : 'Новая категория' }}</h2>
        <form @submit.prevent="saveCategory">
          <div class="form-row">
            <label>Название *</label>
            <input v-model="form.name" required @input="autoSlug" />
          </div>
          <div class="form-row">
            <label>Slug *</label>
            <input v-model="form.slug" required placeholder="naprimer-slug" />
          </div>
          <div class="form-row">
            <label>Описание</label>
            <textarea v-model="form.description" rows="2"></textarea>
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
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';

const categories = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editCategory = ref(null);
const saving = ref(false);
const formError = ref('');
const form = reactive({ name: '', slug: '', description: '' });

const load = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const autoSlug = () => {
  if (!editCategory.value) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[а-я]/g, (c) => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }[c] || c));
  }
};

const openCreate = () => {
  editCategory.value = null;
  Object.assign(form, { name: '', slug: '', description: '' });
  formError.value = '';
  showModal.value = true;
};

const openEdit = (c) => {
  editCategory.value = c;
  Object.assign(form, { name: c.name, slug: c.slug, description: c.description || '' });
  formError.value = '';
  showModal.value = true;
};

const saveCategory = async () => {
  saving.value = true;
  formError.value = '';
  try {
    if (editCategory.value) {
      await api.put(`/categories/${editCategory.value.id}`, form);
    } else {
      await api.post('/categories', form);
    }
    showModal.value = false;
    await load();
  } catch (e) {
    formError.value = e.response?.data?.error || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (c) => {
  if (!confirm(`Удалить категорию "${c.name}"?`)) return;
  try {
    await api.delete(`/categories/${c.id}`);
    await load();
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка удаления');
  }
};
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
.data-table th { color: var(--color-muted); font-size: 12px; text-transform: uppercase; font-weight: 500; }
.actions-cell { display: flex; gap: 6px; }
code { background: var(--color-bg); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-card { width: 440px; padding: 28px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
</style>
