<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="page-title">Thông tin tài khoản</h1>

      <div class="profile-content">
        <!-- TODO: Add a sidebar for navigation (Profile, Orders, Addresses, etc.) -->

        <div class="profile-form-card">
          <h2>Thông tin cá nhân</h2>
          <form @submit.prevent="handleUpdateProfile">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" :value="authStore.user?.email" disabled />
              <small>Email không thể thay đổi.</small>
            </div>

            <div class="form-group">
              <label for="fullName">Họ và tên</label>
              <input type="text" id="fullName" v-model="form.full_name" required />
            </div>

            <div class="form-group">
              <label for="phone">Số điện thoại</label>
              <input type="tel" id="phone" v-model="form.phone_number" />
            </div>

            <div class="form-group">
              <label for="dob">Ngày sinh</label>
              <input type="date" id="dob" v-model="form.date_of_birth" />
            </div>

            <div class="form-group">
              <label for="gender">Giới tính</label>
              <select id="gender" v-model="form.gender">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const form = ref({
  full_name: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
});

onMounted(() => {
  const userProfile = authStore.user?.profile;
  if (userProfile) {
    form.value.full_name = userProfile.full_name || '';
    form.value.phone_number = userProfile.phone_number || '';
    form.value.gender = userProfile.gender || 'male';
    // Format date for the date input, which requires YYYY-MM-DD
    if (userProfile.date_of_birth) {
      form.value.date_of_birth = new Date(userProfile.date_of_birth).toISOString().split('T')[0];
    }
  }
});

const handleUpdateProfile = async () => {
  loading.value = true;
  try {
    // Create a payload with only the fields that have values
    const payload = {};
    for (const key in form.value) {
      if (form.value[key]) {
        payload[key] = form.value[key];
      }
    }

    // TODO: Create an `updateProfile` action in your authStore
    // await authStore.updateProfile(payload);

    // Mocking the API call for now
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Updating profile with:', payload);

    toast.success('Cập nhật thông tin thành công!');
  } catch (error) {
    console.error('Failed to update profile:', error);
    toast.error(error.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-page {
  padding: 40px 0;
  min-height: calc(100vh - 200px);
  background: #f9fafb;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 32px;
  margin-bottom: 30px;
}

.profile-content {
  /* In the future, you can use grid layout for a sidebar */
  /* display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px; */
}

.profile-form-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.profile-form-card h2 {
  font-size: 22px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #6b7280;
}

.btn-submit {
  display: inline-block;
  padding: 12px 30px;
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
</style>