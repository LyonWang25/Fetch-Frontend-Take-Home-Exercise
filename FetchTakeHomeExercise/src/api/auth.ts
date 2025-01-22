// src/api/auth.ts
import { API_BASE_URL, defaultConfig, LoginData } from './config';

export const authAPI = {
  login: async (data: LoginData): Promise<Response> => {
    // Ensure data is properly formatted
    const cleanData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase()
    };


    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      ...defaultConfig,
      method: 'POST',
      body: JSON.stringify(cleanData),
    });

    // debugging
    // console.log('Login response status:', response.status);
    // console.log('Login response headers:', response.headers);

    return response;
  },
  logout: async (): Promise<Response> => {
    return fetch(`${API_BASE_URL}/auth/logout`, {
      ...defaultConfig,
      method: 'POST',
    });
  }
};