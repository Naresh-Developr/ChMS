import axios from "axios";
import { getAccessToken } from "~/utils/services/tokenServices";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  withCredentials: true,
});

const excludedEndpoints = ["/signin", "/signup"];

// Interceptor
API.interceptors.response.use(
  (req) => {
    const url = req.config?.url;

    const containsExcludedEndpoints = excludedEndpoints.some((endpoint) =>
      url?.includes(endpoint),
    );

    if (!containsExcludedEndpoints) {
      const token = getAccessToken();

      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    return req;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    const containsExcludedEndpoints = excludedEndpoints.some((endpoint) =>
      url?.includes(endpoint),
    );

    if (status === 401 && !containsExcludedEndpoints) {
      alert("Session expired!, please login again.");
      window.location.href = "./signin";
    }

    return Promise.reject(error);
  },
);

export default API;
