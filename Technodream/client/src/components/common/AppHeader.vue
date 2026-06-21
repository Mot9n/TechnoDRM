<template>
  <header class="app-header">
    <div class="container header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">⚡</span>
        <span>TechnoDream</span>
      </router-link>

      <nav :class="['main-nav', { open: menuOpen }]">
        <router-link to="/catalog">Каталог</router-link>
        <router-link to="/catalog/smartfony">Смартфоны</router-link>
        <router-link to="/catalog/noutbuki">Ноутбуки</router-link>
        <router-link to="/catalog/televizory">Телевизоры</router-link>
      </nav>

      <form class="search-form" @submit.prevent="doSearch">
        <input v-model="searchQuery" type="text" placeholder="Поиск товаров..." />
        <button type="submit">🔍</button>
      </form>

      <div class="header-actions">
        <router-link to="/cart" class="cart-link">
          🛒
          <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
        </router-link>

        <div class="user-menu">
          <template v-if="auth.isAuthenticated">
            <router-link v-if="auth.isAdmin" to="/admin">Админ</router-link>
            <router-link to="/account">Профиль</router-link>
            <button class="link-btn" @click="auth.logout()">Выйти</button>
          </template>
          <template v-else>
            <router-link to="/login">Войти</router-link>
            <router-link to="/register">Регистрация</router-link>
          </template>
        </div>
      </div>

      <button class="menu-toggle" @click="menuOpen = !menuOpen">☰</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();

const searchQuery = ref('');
const menuOpen = ref(false);

const doSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { search: searchQuery.value.trim() } });
    searchQuery.value = '';
    menuOpen.value = false;
  }
};
</script>

<style scoped>
.app-header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 20px;
}
.logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.logo-icon { font-size: 22px; }

.main-nav { display: flex; gap: 18px; }
.main-nav a {
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
}
.main-nav a:hover { color: var(--color-primary); }

.search-form {
  flex: 1;
  max-width: 420px;
  display: flex;
  gap: 6px;
}
.search-form input { flex: 1; }
.search-form button {
  padding: 10px 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}

.header-actions { display: flex; align-items: center; gap: 14px; }

.cart-link {
  position: relative;
  font-size: 22px;
  text-decoration: none;
}
.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--color-accent);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.user-menu a {
  color: var(--color-text);
  font-weight: 500;
}
.link-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}
.link-btn:hover { color: var(--color-error); }

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .main-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-white);
    flex-direction: column;
    padding: 14px 20px;
    border-bottom: 1px solid var(--color-border);
    gap: 12px;
  }
  .main-nav.open { display: flex; }
  .menu-toggle { display: block; }
  .search-form { max-width: none; }
}

@media (max-width: 600px) {
  .header-inner { gap: 10px; flex-wrap: wrap; }
  .search-form {
    order: 3;
    flex-basis: 100%;
  }
  .logo span:not(.logo-icon) { display: none; }
}
</style>