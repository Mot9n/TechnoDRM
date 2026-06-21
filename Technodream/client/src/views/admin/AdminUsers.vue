<template>
  <div class="admin-users">
    <div class="page-header">
      <h1>Пользователи</h1>
      <input v-model="search" type="text" placeholder="Поиск..." style="max-width:260px" />
    </div>

    <div class="card">
      <div v-if="loading" class="text-muted" style="padding:20px">Загрузка...</div>
      <table v-else class="data-table">
        <thead>
          <tr><th>ID</th><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Дата рег.</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.first_name }} {{ u.last_name || '' }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.phone || '—' }}</td>
            <td><span :class="['role-badge', `role-${u.role}`]">{{ u.role === 'admin' ? 'Администратор' : 'Покупатель' }}</span></td>
            <td>{{ formatDate(u.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const users = ref([]);
const loading = ref(true);
const search = ref('');

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase();
  return q
    ? users.value.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.first_name.toLowerCase().includes(q) ||
        (u.last_name || '').toLowerCase().includes(q)
      )
    : users.value;
});

onMounted(async () => {
  try {
    const { data } = await api.get('/users');
    users.value = data;
  } finally {
    loading.value = false;
  }
});

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU');
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
.data-table th { color: var(--color-muted); font-size: 12px; text-transform: uppercase; font-weight: 500; }
.role-badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.role-admin { background: #FEF3C7; color: #D97706; }
.role-customer { background: #DBEAFE; color: #1D4ED8; }
</style>
