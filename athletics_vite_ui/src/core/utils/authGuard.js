import { jwtDecode } from "jwt-decode";

export const isTokenExpired = () => {
  const token = localStorage.getItem("access_token");

  if (!token) return true;

  try {
    const { exp } = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch {
    return true;
  }
};

export const forceLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.replace("/login");
};

export const checkSession = () => {
  if (isTokenExpired()) {
    forceLogout();
  }
};
