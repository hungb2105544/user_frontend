<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <RouterLink to="/" class="logo">
          <h1>{{ appName }}</h1>
        </RouterLink>

        <nav class="nav">
          <RouterLink to="/" class="nav-link">Trang chủ</RouterLink>
          <RouterLink to="/products" class="nav-link">Sản phẩm</RouterLink>
          <RouterLink to="/vouchers" class="nav-link">Vouchers</RouterLink>
        </nav>

        <div class="header-actions">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
          </div>

          <RouterLink 
            v-if="isAuthenticated" 
            to="/wishlist" 
            class="icon-btn"
            title="Danh sách yêu thích"
          >
            ❤️
          </RouterLink>

          <RouterLink 
            v-if="isAuthenticated" 
            to="/cart" 
            class="icon-btn cart-btn"
            title="Giỏ hàng"
          >
            🛒
            <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
          </RouterLink>

          <div v-if="isAuthenticated" class="user-menu">
            <button class="user-btn" @click="toggleUserMenu">
              👤 {{ user?.email }}
            </button>
            <div v-if="showUserMenu" class="dropdown">
              <RouterLink to="/profile" class="dropdown-item" @click="showUserMenu = false">
                Tài khoản
              </RouterLink>
              <RouterLink to="/orders" class="dropdown-item" @click="showUserMenu = false">
                Đơn hàng
              </RouterLink>
              
              <button class="dropdown-item" @click="handleLogout">
                Đăng xuất
              </button>
            </div>
          </div>

          <div v-else class="auth-buttons">
            <RouterLink to="/login" class="btn btn-outline">Đăng nhập</RouterLink>
            <RouterLink to="/register" class="btn btn-primary">Đăng ký</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const appName = import.meta.env.VITE_APP_NAME;
const searchQuery = ref('');
const showUserMenu = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const user = computed(() => authStore.user);
const cartCount = computed(() => cartStore.cartCount);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'products', query: { search: searchQuery.value } });
  }
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  router.push('/');
};
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  gap: 20px;
}

.logo h1 {
  font-size: 24px;
  color: #2563eb;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  color: #2563eb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box input {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  width: 250px;
  outline: none;
}

.search-box input:focus {
  border-color: #2563eb;
}

.icon-btn {
  position: relative;
  padding: 8px;
  font-size: 20px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.user-menu {
  position: relative;
}

.user-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 180px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  text-decoration: none;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-outline {
  border: 1px solid #2563eb;
  color: #2563eb;
  background: transparent;
}

.btn-outline:hover {
  background: #eff6ff;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>