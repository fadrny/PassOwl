import { PUBLIC_API_URL } from '$env/static/public';

export const API_CONFIG = {
	baseUrl: PUBLIC_API_URL || 'http://localhost:8000',
	endpoints: {
		auth: {
			register: '/auth/register',
			login: '/auth/login',
			salts: '/auth/salts'
		},
		users: {
			me: '/users/me',
			avatar: '/users/me/avatar'
		},
		credentials: '/credentials',
		notes: '/secure-notes',
		categories: '/categories'
	}
} as const;

export function getApiUrl(endpoint: string): string {
	return `${API_CONFIG.baseUrl}${endpoint}`;
}
