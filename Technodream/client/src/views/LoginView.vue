<template>
  <div class="auth-page container">
    <div class="auth-card card">
      <h1>Вход</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-row">
          <label>Email</label>
          <input v-model="email" type="email" required placeholder="example@mail.ru" />
        </div>
        <div class="form-row">
          <label>Пароль</label>
          <input v-model="password" type="password" required placeholder="Введите пароль" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Входим...' : 'Войти' }}
        </button>
      </form>
      <p class="auth-footer">Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
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
    const redirect = route.query.redirect || (user.role === 'admin' ? '/admin' : '/');
    router.push(redirect);
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка входа. Проверьте данные.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; padding: 40px 20px; }
.auth-card { width: 100%; max-width: 420px; padding: 32px; }
h1 { text-align: center; margin-bottom: 24px; }
.btn-block { margin-top: 8px; }
.auth-footer { text-align: center; margin-top: 16px; font-size: 14px; color: var(--color-muted); }
</style>
