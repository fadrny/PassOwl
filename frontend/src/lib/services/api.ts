import { getApiUrl } from '$lib/config';
import type { ApiResponse, ApiError } from '$lib/types/api';

/**
 * Centralizované API volání s error handlingem
 */
export class ApiService {
	private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
		try {
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
				return {
					error: {
						detail: errorData.detail || `HTTP Error ${response.status}`,
						status: response.status
					}
				};
			}

			const data = await response.json();
			return { data };
		} catch (error) {
			return {
				error: {
					detail: error instanceof Error ? error.message : 'Network error'
				}
			};
		}
	}

	static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		const response = await fetch(getApiUrl(endpoint));
		return this.handleResponse<T>(response);
	}

	static async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
		const response = await fetch(getApiUrl(endpoint), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		return this.handleResponse<T>(response);
	}

	static async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
		const response = await fetch(getApiUrl(endpoint), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		return this.handleResponse<T>(response);
	}

	static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		const response = await fetch(getApiUrl(endpoint), {
			method: 'DELETE'
		});
		return this.handleResponse<T>(response);
	}
}
