<template>
  <div class="admin-login">
    <div class="login-card card">
      <h1>⚡ TechnoDream</h1>
      <p class="text-muted text-center">Панель администратора</p>
      <form @submit.prevent="handleLogin">
        <div class="form-row">
          <label>Email</label>
          <input v-model="email" type="email" required placeholder="admin@technodream.ru" />
        </div>
        <div class="form-row">
          <label>Пароль</label>
          <input v-model="password" type="password" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Входим...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const user = await auth.login(email.value, password.value);
    if (user.role !== 'admin') {
      auth.logout();
      error.value = 'Доступ разрешён только администраторам';
      return;
    }
    router.push('/admin');
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка входа';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.login-card { width: 360px; padding: 36px; }
h1 { text-align: center; margin-bottom: 6px; font-size: 22px; color: var(--color-primary); }
</style>
