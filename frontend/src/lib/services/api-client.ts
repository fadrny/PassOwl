import { Api } from './api';
import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

/**
 * Globální instance API klienta s automatickou autentizací
 */
export const api = new Api({
  baseUrl: PUBLIC_API_URL || 'http://localhost:8000',
  securityWorker: (token: string | null) => {
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }
    return {};
  }
});

// Inicializace tokenu při načtení - pouze v browseru
if (browser) {
  // Získat token z localStorage a nastavit ho
  const token = localStorage.getItem('access_token');
  if (token) {
    api.setSecurityData(token);
  }
}