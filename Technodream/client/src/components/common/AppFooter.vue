<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-col">
        <h3 class="footer-title">TechnoDream</h3>
        <p class="text-muted">Магазин электроники и бытовой техники.</p>
      </div>
      <div class="footer-col">
        <h4>Каталог</h4>
        <ul>
          <li><router-link to="/catalog/smartfony">Смартфоны</router-link></li>
          <li><router-link to="/catalog/noutbuki">Ноутбуки</router-link></li>
          <li><router-link to="/catalog/televizory">Телевизоры</router-link></li>
          <li><router-link to="/catalog/naushniki">Наушники</router-link></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Информация</h4>
        <ul>
          <li><a href="#">Доставка и оплата</a></li>
          <li><a href="#">Гарантия</a></li>
          <li><a href="#">Контакты</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Контакты</h4>
        <p>📞 +7 (343) 123-45-67</p>
        <p>📧 info@technodream.ru</p>
        <p class="text-muted">Ежедневно 10:00 – 21:00</p>
      </div>
    </div>
    <div class="footer-bottom container">
      © {{ year }} TechnoDream. Все права защищены.
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  background: #1F2937;
  color: #D1D5DB;
  margin-top: 40px;
  padding: 36px 0 18px;
}
.footer-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}
.footer-title { color: white; font-size: 18px; margin-bottom: 8px; }
.footer-col h4 {
  color: white;
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.footer-col ul { list-style: none; padding: 0; }
.footer-col li { margin-bottom: 6px; }
.footer-col a { color: #D1D5DB; font-size: 14px; text-decoration: none; }
.footer-col a:hover { color: white; }
.footer-col p { font-size: 14px; margin-bottom: 6px; }
.footer-bottom {
  border-top: 1px solid #374151;
  margin-top: 26px;
  padding-top: 16px;
  font-size: 13px;
  text-align: center;
  color: #9CA3AF;
}
@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .footer-inner { grid-template-columns: 1fr; }
}
</style>