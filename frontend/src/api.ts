import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  timeout: 5000,
    headers: {
    Authorization: `Bearer ${localStorage.getItem('access')}`,
    },
});

export default api;
