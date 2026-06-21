<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <span>⚡</span> TechnoDream
      </div>
      <nav class="sidebar-nav">
        <router-link :to="{ name: 'admin-dashboard' }" exact-active-class="active">
          📊 Дашборд
        </router-link>
        <router-link :to="{ name: 'admin-products' }" active-class="active">
          📦 Товары
        </router-link>
        <router-link :to="{ name: 'admin-categories' }" active-class="active">
          🗂️ Категории
        </router-link>
        <router-link :to="{ name: 'admin-orders' }" active-class="active">
          🛒 Заказы
        </router-link>
        <router-link :to="{ name: 'admin-users' }" active-class="active">
          👥 Пользователи
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="sidebar-link">← На сайт</router-link>
        <button class="sidebar-link logout-btn" @click="logout">Выйти</button>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="admin-breadcrumb">{{ $route.meta.title || 'Панель управления' }}</div>
        <div class="admin-user">{{ auth.user?.first_name }}</div>
      </header>
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push('/admin/login');
};
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }

.admin-sidebar {
  width: 220px;
  background: #1F2937;
  color: #D1D5DB;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  padding: 20px 18px;
  font-size: 17px;
  font-weight: 700;
  color: white;
  border-bottom: 1px solid #374151;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
}

.sidebar-nav a {
  display: block;
  padding: 10px 18px;
  color: #D1D5DB;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s;
}
.sidebar-nav a:hover { background: #374151; }
.sidebar-nav a.active { background: var(--color-primary); color: white; }

.sidebar-footer {
  padding: 16px 18px;
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-link { color: #9CA3AF; font-size: 13px; text-decoration: none; }
.sidebar-link:hover { color: white; }
.logout-btn { background: none; border: none; cursor: pointer; text-align: left; padding: 0; }

.admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.admin-header {
  background: white;
  border-bottom: 1px solid var(--color-border);
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.admin-breadcrumb { font-weight: 600; font-size: 15px; }
.admin-user { font-size: 14px; color: var(--color-muted); }

.admin-content { padding: 24px; flex: 1; }

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
}
</style>
