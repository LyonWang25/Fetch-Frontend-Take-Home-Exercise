// src/api/dogs.ts
import { API_BASE_URL, defaultConfig, Dog, SearchParams } from './config';

export const dogsAPI = {
  getBreeds: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/dogs/breeds`, defaultConfig);
    return response.json();
  },

  search: async (params: SearchParams) => {
    // Convert params to URL search params
    const searchParams = new URLSearchParams();
    
    if (params.breeds) {
      params.breeds.forEach(breed => searchParams.append('breeds', breed));
    }
    if (params.zipCodes) {
      params.zipCodes.forEach(zip => searchParams.append('zipCodes', zip));
    }
    if (params.ageMin) searchParams.append('ageMin', params.ageMin.toString());
    if (params.ageMax) searchParams.append('ageMax', params.ageMax.toString());
    //query parameters
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.from) searchParams.append('from', params.from.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(
      `${API_BASE_URL}/dogs/search?${searchParams.toString()}`,
      defaultConfig
    );
    return response.json();
  },

  getDogs: async (dogIds: string[]): Promise<Dog[]> => {
    const response = await fetch(`${API_BASE_URL}/dogs`, {
      ...defaultConfig,
      method: 'POST',
      body: JSON.stringify(dogIds),
    });
    return response.json();
  },

  match: async (dogIds: string[]): Promise<{ match: string }> => {
    const response = await fetch(`${API_BASE_URL}/dogs/match`, {
      ...defaultConfig,
      method: 'POST',
      body: JSON.stringify(dogIds),
    });
    return response.json();
  },
};