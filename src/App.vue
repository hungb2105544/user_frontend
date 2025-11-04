<script setup>
import { RouterView } from 'vue-router';
import Header from '@/components/layout/Header.vue';
// import Footer from '@/components/layout/Footer.vue'; // Uncomment this when you create a Footer component
</script>

<template>
  <div id="app-layout">
    <Header />
    <main class="main-content">
      <RouterView />
    </main>
    <!-- <Footer /> -->
  </div>
</template>

<style scoped>
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 70px; /* Height of the sticky header */
}
</style>
