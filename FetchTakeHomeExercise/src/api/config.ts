//baseUrl for the API
export const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

// Common fetch configuration
export const defaultConfig = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Interface
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

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeoBoundingBox {
  top?: Coordinates;
  left?: Coordinates;
  bottom?: Coordinates;
  right?: Coordinates;
  bottom_left?: Coordinates;
  top_right?: Coordinates;
  bottom_right?: Coordinates;
  top_left?: Coordinates;
}

export interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

export interface LocationSearchParams {
  city?: string;
  states?: string[];
  geoBoundingBox?: GeoBoundingBox;
  size?: number;
  from?: number;
}

export interface LocationSearchResponse {
  results: Location[];
  total: number;
}