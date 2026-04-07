import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export type UserRole = "admin" | "kerani";

type TokenPayload = {
  user_id: number;
  role: UserRole;
  exp?: number;
};

export const getToken = () => Cookies.get("token") ?? "";

export const clearToken = () => {
  Cookies.remove("token");
};

export const getRoleFromToken = (): UserRole | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode<TokenPayload>(token);
    return payload.role;
  } catch {
    return null;
  }
};

export const hasValidToken = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
