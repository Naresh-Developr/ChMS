import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  withCredentials: true,
});

// Interceptor
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    const exclude401Endpoints = ["/signin", "/signup"];

    const contains401ExcludedEndpoints = exclude401Endpoints.some((endpoint) =>
      url?.includes(endpoint),
    );

    if (status === 401 && !contains401ExcludedEndpoints) {
      alert("Session expired!, please login again.");
      window.location.href = "./signin";
      return Promise.reject(error);
    }
  },
);

export default API;
