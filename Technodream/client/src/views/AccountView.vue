<template>
  <div class="account-page container">
    <div class="account-layout">
      <aside class="account-nav card">
        <div class="account-user">
          <div class="avatar">{{ initials }}</div>
          <div>
            <div class="user-name">{{ auth.user?.first_name }} {{ auth.user?.last_name || '' }}</div>
            <div class="user-email">{{ auth.user?.email }}</div>
          </div>
        </div>
        <nav>
          <router-link :to="{ name: 'account' }" exact-active-class="active">Профиль</router-link>
          <router-link :to="{ name: 'account-orders' }" active-class="active">Мои заказы</router-link>
        </nav>
        <button class="btn btn-block" style="margin-top:16px;color:var(--color-error)" @click="logout">
          Выйти
        </button>
      </aside>
      <div class="account-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const initials = computed(() => {
  const f = auth.user?.first_name?.[0] || '';
  const l = auth.user?.last_name?.[0] || '';
  return (f + l).toUpperCase() || '?';
});

const logout = () => {
  auth.logout();
  router.push('/');
};
</script>

<style scoped>
.account-page { padding-bottom: 40px; }
.account-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}
.account-nav { padding: 20px; }
.account-user { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.avatar {
  width: 48px; height: 48px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px;
  flex-shrink: 0;
}
.user-name { font-weight: 600; font-size: 14px; }
.user-email { font-size: 12px; color: var(--color-muted); margin-top: 2px; }
.account-nav nav { display: flex; flex-direction: column; gap: 4px; }
.account-nav a {
  display: block; padding: 10px 12px; border-radius: 6px;
  color: var(--color-text); font-size: 14px; font-weight: 500; text-decoration: none;
}
.account-nav a:hover { background: var(--color-bg); }
.account-nav a.active { background: var(--color-primary); color: white; }

@media (max-width: 768px) {
  .account-layout { grid-template-columns: 1fr; }
}
</style>
