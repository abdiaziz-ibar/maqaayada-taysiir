import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE = "https://maqaayda.idraakict.com/api";

// Parent-portal client — reads the parent token, mirrors the web app's
// separate axios instance so a parent session never collides with staff.
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("parentToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
