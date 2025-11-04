import apiClient from "./api";

class AuthService {
  register(data) {
    return apiClient.post("/auth/register", data);
  }

  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  }

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}

export default new AuthService();
