<template>
  <div class="login-page">
    <div class="container">
      <div class="login-box">
        <h1>Đăng nhập</h1>
        <p class="subtitle">Chào mừng bạn quay trở lại!</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              required
              placeholder="Nhập email của bạn"
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              v-model="form.password"
              required
              placeholder="Nhập mật khẩu"
            />
            <span v-if="errors.password" class="error">{{ errors.password }}</span>
          </div>

          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading"
          >
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>
        </form>

        <div class="divider">
          <span>hoặc</span>
        </div>

        <p class="register-link">
          Chưa có tài khoản? 
          <RouterLink to="/register">Đăng ký ngay</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
});

const errors = ref({});
const loading = ref(false);

const handleLogin = async () => {
  errors.value = {};
  loading.value = true;

  try {
    await authStore.login(form.value);
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (error) {
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        errors.value[err.path] = err.msg;
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  width: 100%;
  max-width: 450px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #111827;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #2563eb;
}

.error {
  display: block;
  margin-top: 5px;
  color: #ef4444;
  font-size: 14px;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 25px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 15px;
  color: #6b7280;
}

.register-link {
  text-align: center;
  color: #6b7280;
}

.register-link a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>