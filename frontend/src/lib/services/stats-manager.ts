import { api } from './api-client';
import type { UserStats } from './api';
import { getApiErrorDetail, getApiErrorStatus, type ApiResponse } from '$lib/types/api';

export class StatsManager {
	/**
	 * Získání statistik aktuálního uživatele
	 */
	static async getUserStats(): Promise<ApiResponse<UserStats>> {
		try {
			const response = await api.users.getCurrentUserStatsUsersMeStatsGet();
			return { data: response.data };
		} catch (error: unknown) {
			console.error('API error getting user stats:', error);
			const status = getApiErrorStatus(error);

			if (status === 401) {
				return {
					error: {
						detail: 'Nejste přihlášeni. Přihlaste se prosím.',
						status: 401
					}
				};
			}

			return {
				error: {
					detail: getApiErrorDetail(error, 'Chyba při načítání statistik'),
					status: status || 500
				}
			};
		}
	}
}
