<template>
  <div class="public-layout">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
</script>

<style scoped>
.public-layout { min-height: 100vh; display: flex; flex-direction: column; }
.main-content { flex: 1; padding: 24px 0; }
</style>