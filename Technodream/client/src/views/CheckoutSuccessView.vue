<template>
  <div class="success-page container text-center">
    <div class="success-card card">
      <div class="success-icon">✅</div>
      <h1>Заказ оформлен!</h1>
      <p class="text-muted">Заказ №{{ orderId }} успешно создан.</p>
      <p>Мы свяжемся с вами для подтверждения.</p>
      <div class="success-actions">
        <router-link to="/" class="btn btn-primary">На главную</router-link>
        <router-link v-if="auth.isAuthenticated" to="/account/orders" class="btn">Мои заказы</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const auth = useAuthStore();
const orderId = route.params.id;
</script>

<style scoped>
.success-page { padding: 60px 20px; }
.success-card { max-width: 480px; margin: 0 auto; padding: 48px 32px; }
.success-icon { font-size: 72px; margin-bottom: 16px; }
h1 { margin-bottom: 12px; }
p { margin-bottom: 8px; }
.success-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
</style>
