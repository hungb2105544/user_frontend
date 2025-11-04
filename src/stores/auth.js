import { defineStore } from "pinia";
import authService from "@/services/auth.service";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    async register(data) {
      this.loading = true;
      try {
        const response = await authService.register(data);
        this.user = response.data.user;
        this.token = response.data.token;

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", this.token);

        toast.success("Đăng ký thành công!");
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.error || "Đăng ký thất bại");
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      try {
        const response = await authService.login(credentials);
        this.user = response.data.user;
        this.token = response.data.token;

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", this.token);

        toast.success("Đăng nhập thành công!");
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.error || "Đăng nhập thất bại");
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      authService.logout();
      toast.success("Đã đăng xuất");
    },
  },
});
