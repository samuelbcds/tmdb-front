import { api } from './api';


export interface User {
  id: string;
  name: string;
  email: string;
}


export interface LoginCredentials {
  email: string;
  password: string;
}


export interface RegisterData {
  name: string;
  email: string;
  password: string;
}


function normalizeUserResponse(data: any): User {
  if (data && typeof data === 'object' && 'user' in data) {
    return data.user as User;
  }
  return data as User;
}


export const userService = {
  
  async getMe(): Promise<User> {
    const { data } = await api.get('/users/me');
    return normalizeUserResponse(data);
  },

  
  async login(credentials: LoginCredentials): Promise<User> {
    const { data } = await api.post('/login', credentials);
    return normalizeUserResponse(data);
  },

  
  async register(userData: RegisterData): Promise<User> {
    const { data } = await api.post('/users', userData);
    return normalizeUserResponse(data);
  },

  
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
