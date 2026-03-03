import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // need to change after backend setup
  withCredentials: true,
});

export const loginApi = (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

export const signupApi = (data: {
  name: string;
  email: string;
  password: string;
}) => API.post("/auth/signup", data);