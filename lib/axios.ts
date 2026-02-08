import axios from "axios";

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const appApi = axios.create({
  baseURL: "",
  withCredentials: true,
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
