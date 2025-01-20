// src/api/config.ts
export const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

// Common fetch configuration
export const defaultConfig = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Interface definitions
export interface LoginData {
  name: string;
  email: string;
}

export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export interface SearchParams {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: number;
  sort?: string;
}