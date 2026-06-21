import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  // Публичная часть
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'catalog', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
      { path: 'catalog/:slug', name: 'catalog-category', component: () => import('@/views/CatalogView.vue') },
      { path: 'product/:id', name: 'product', component: () => import('@/views/ProductView.vue') },
      { path: 'search', name: 'search', component: () => import('@/views/CatalogView.vue') },
      { path: 'cart', name: 'cart', component: () => import('@/views/CartView.vue') },
      { path: 'checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue') },
      { path: 'checkout/success/:id', name: 'checkout-success', component: () => import('@/views/CheckoutSuccessView.vue') },
      { path: 'login', name: 'login', component: () => import('@/views/LoginView.vue') },
      { path: 'register', name: 'register', component: () => import('@/views/RegisterView.vue') },
      {
        path: 'account',
        component: () => import('@/views/AccountView.vue'),
        meta: { requiresAuth: true },
        children: [
          { path: '', name: 'account', component: () => import('@/views/account/ProfileView.vue') },
          { path: 'orders', name: 'account-orders', component: () => import('@/views/account/OrdersView.vue') },
          { path: 'orders/:id', name: 'account-order', component: () => import('@/views/account/OrderDetailView.vue') }
        ]
      }
    ]
  },
  // Админ-панель
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLogin.vue')
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboard.vue') },
      { path: 'products', name: 'admin-products', component: () => import('@/views/admin/AdminProducts.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/AdminCategories.vue') },
      { path: 'orders', name: 'admin-orders', component: () => import('@/views/admin/AdminOrders.vue') },
      { path: 'orders/:id', name: 'admin-order', component: () => import('@/views/admin/AdminOrderDetail.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/AdminUsers.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; }
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    if (to.path.startsWith('/admin')) return next('/admin/login');
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/');
  }
  next();
});

export default router;