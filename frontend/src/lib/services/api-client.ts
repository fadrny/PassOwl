import { Api } from './api';
import { PUBLIC_API_URL } from '$env/static/public';

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