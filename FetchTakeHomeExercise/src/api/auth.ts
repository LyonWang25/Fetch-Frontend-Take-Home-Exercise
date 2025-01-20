// src/api/auth.ts
import { API_BASE_URL, defaultConfig, LoginData } from './config';

export const authAPI = {
  login: async (data: LoginData): Promise<Response> => {
    // Ensure data is properly formatted
    const cleanData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase()
    };

    // Log the request for debugging
    console.log('Sending login request with data:', cleanData);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      ...defaultConfig,
      method: 'POST',
      body: JSON.stringify(cleanData),
    });

    // Log the response for debugging
    console.log('Login response status:', response.status);
    console.log('Login response headers:', response.headers);

    return response;
  }
};