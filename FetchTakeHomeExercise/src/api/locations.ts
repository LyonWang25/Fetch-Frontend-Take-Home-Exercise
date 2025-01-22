import { API_BASE_URL, defaultConfig, Location, LocationSearchParams, LocationSearchResponse } from './config';

export const locationsAPI = {
  // Get locations by ZIP codes
  getLocations: async (zipCodes: string[]): Promise<Location[]> => {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      ...defaultConfig,
      method: 'POST',
      body: JSON.stringify(zipCodes),
    });
    return response.json();
  },

  // Search locations with filters
  searchLocations: async (params: LocationSearchParams): Promise<LocationSearchResponse> => {
    // console.log("searchLocations called with params:", params); 
    const response = await fetch(`${API_BASE_URL}/locations/search`, {
      ...defaultConfig,
      method: 'POST',
      body: JSON.stringify({
        ...(params.city && { city: params.city }),
        ...(params.states && { states: params.states }),
        ...(params.geoBoundingBox && { geoBoundingBox: params.geoBoundingBox }),
        ...(params.size && { size: params.size }),
        ...(params.from && { from: params.from }),
      }),
    });
    const data = await response.json();
    // console.log("searchLocations response:", data);
    return data;
  },
};