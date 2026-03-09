import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';



interface ApiConfig {
  apiBaseURL: string;
  apiTimeout: number;
  tmdbBaseUrl: string;
  tmdbApiKey: string;
}
const getConfig = (): ApiConfig => {
  return {
    apiBaseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    apiTimeout: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 10000,
    tmdbBaseUrl: import.meta.env.VITE_TMDB_API_BASE_URL || 'https://api.themoviedb.org/3',
    tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY || '',
  };
};

const config = getConfig();


export const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseURL,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});


export const tmdbApi: AxiosInstance = axios.create({
  baseURL: config.tmdbBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    ...(config.tmdbApiKey && { api_key: config.tmdbApiKey }),
  },
});


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);


export default api;
