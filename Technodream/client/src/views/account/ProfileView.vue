<template>
  <div class="profile card">
    <h2>Профиль</h2>
    <form @submit.prevent="saveProfile">
      <div class="form-row">
        <label>Имя *</label>
        <input v-model="form.first_name" type="text" required />
      </div>
      <div class="form-row">
        <label>Фамилия</label>
        <input v-model="form.last_name" type="text" />
      </div>
      <div class="form-row">
        <label>Телефон</label>
        <input v-model="form.phone" type="tel" />
      </div>
      <div class="form-row">
        <label>Email</label>
        <input :value="auth.user?.email" type="email" disabled />
      </div>
      <p v-if="success" class="success-msg">Профиль сохранён</p>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button type="submit" class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const form = reactive({ first_name: '', last_name: '', phone: '' });
const saving = ref(false);
const success = ref(false);
const error = ref('');

onMounted(() => {
  form.first_name = auth.user?.first_name || '';
  form.last_name = auth.user?.last_name || '';
  form.phone = auth.user?.phone || '';
});

const saveProfile = async () => {
  saving.value = true;
  success.value = false;
  error.value = '';
  try {
    await auth.updateProfile(form);
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.profile { max-width: 480px; }
.success-msg { color: var(--color-success); font-size: 13px; margin-bottom: 8px; }
input:disabled { background: var(--color-bg); color: var(--color-muted); }
</style>
