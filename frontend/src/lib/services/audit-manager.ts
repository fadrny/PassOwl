import { api } from './api-client';
import type { AuditLog } from './api';
import { getApiErrorDetail, getApiErrorStatus, type ApiResponse } from '$lib/types/api';

export class AuditManager {
	/**
	 * Získání audit logů s pagination
	 */
	static async getAuditLogs(params?: {
		skip?: number;
		limit?: number;
		user_id?: number | null;
	}): Promise<ApiResponse<AuditLog[]>> {
		try {
			const response = await api.admin.getAuditLogsAdminAuditLogsGet(params);
			return { data: response.data };
		} catch (error: unknown) {
			console.error('API error getting audit logs:', error);
			const status = getApiErrorStatus(error);

			if (status === 401) {
				return {
					error: {
						detail: 'Nejste přihlášeni nebo nemáte oprávnění.',
						status: 401
					}
				};
			}

			if (status === 403) {
				return {
					error: {
						detail: 'Nemáte oprávnění k přístupu k audit logům.',
						status: 403
					}
				};
			}

			return {
				error: {
					detail: getApiErrorDetail(error, 'Chyba při načítání audit logů'),
					status: status || 500
				}
			};
		}
	}
}
