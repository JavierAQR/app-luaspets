import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuth = {
  saveSession: async (token: string, user: any) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  getToken: async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  getUser: async () => {
    const stored = await SecureStore.getItemAsync(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};