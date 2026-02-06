import axios from "axios";

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const appApi = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

appApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
