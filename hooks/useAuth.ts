import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const useAuth = {
  saveToken: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  getToken: async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  clearToken: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};