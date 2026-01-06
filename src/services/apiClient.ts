import axios from 'axios';

// Replace with your actual API base URL
const BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

apiClient.interceptors.request.use(
    async (config) => {
        // const token = await getToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle global errors (e.g. 401 unauthorized)
        return Promise.reject(error);
    }
);
