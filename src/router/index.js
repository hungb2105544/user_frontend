import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue"),
    },
    {
      path: "/products",
      name: "products",
      component: () => import("@/views/Products.vue"),
    },
    {
      path: "/products/:id",
      name: "product-detail",
      component: () => import("@/views/ProductDetail.vue"), // Giữ lại route này
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("@/views/Cart.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import("@/views/Checkout.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/orders",
      name: "orders",
      component: () => import("@/views/Orders.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/orders/:id",
      name: "order-detail",
      component: () => import("@/views/OrderDetail.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/wishlist",
      name: "wishlist",
      component: () => import("@/views/Wishlist.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/Login.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/Register.vue"),
      meta: { guest: true },
    },
    {
      path: "/vouchers",
      name: "vouchers",
      component: () => import("@/views/Voucher.vue"),
      meta: { requiresAuth: true },
    },
    // Xóa bỏ route bị trùng lặp
    // {
    //   path: "/product/:id",
    //   name: "product-detail",
    //   component: () => import("@/views/admin/Dashboard.vue"),
    // },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.guest && isAuthenticated) {
    next({ name: "home" });
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
