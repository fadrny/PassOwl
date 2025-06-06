import { api } from './api-client';
import type { UserStats } from './api';
import type { ApiResponse } from '$lib/types/api';

export class StatsManager {
    /**
     * Získání statistik aktuálního uživatele
     */
    static async getUserStats(): Promise<ApiResponse<UserStats>> {
        try {
            const response = await api.users.getCurrentUserStatsUsersMeStatsGet();
            return { data: response.data };
        } catch (error: any) {
            console.error('API error getting user stats:', error);
            
            if (error.status === 401) {
                return {
                    error: {
                        detail: 'Nejste přihlášeni. Přihlaste se prosím.',
                        status: 401
                    }
                };
            }
            
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Chyba při načítání statistik',
                    status: error.status || 500
                }
            };
        }
    }
}