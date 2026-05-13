import axios from 'axios';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function geocodeCity(cityName) {
  try {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        name: cityName,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });

    const results = response.data.results;
    if (!results || results.length === 0) {
      throw new Error(`City '${cityName}' not found`);
    }

    const location = results[0];
    return {
      lat: location.latitude,
      lon: location.longitude,
      name: location.name,
      country: location.country
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Geocoding failed: ${error.response.status} ${error.response.statusText}`);
    }
    throw error;
  }
}
