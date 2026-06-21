<template>
  <div class="auth-page container">
    <div class="auth-card card">
      <h1>Регистрация</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-row">
          <label>Имя *</label>
          <input v-model="form.firstName" type="text" required placeholder="Иван" />
        </div>
        <div class="form-row">
          <label>Фамилия</label>
          <input v-model="form.lastName" type="text" placeholder="Иванов" />
        </div>
        <div class="form-row">
          <label>Телефон</label>
          <input v-model="form.phone" type="tel" placeholder="+7 (___) ___-__-__" />
        </div>
        <div class="form-row">
          <label>Email *</label>
          <input v-model="form.email" type="email" required placeholder="example@mail.ru" />
        </div>
        <div class="form-row">
          <label>Пароль *</label>
          <input v-model="form.password" type="password" required minlength="6" placeholder="Минимум 6 символов" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Регистрируем...' : 'Зарегистрироваться' }}
        </button>
      </form>
      <p class="auth-footer">Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({ firstName: '', lastName: '', phone: '', email: '', password: '' });
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.register(form);
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка регистрации. Попробуйте снова.';
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
