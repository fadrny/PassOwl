export interface ApiError {
	detail: string;
	status?: number;
}

export interface ApiErrorLike {
	status?: number;
	message?: string;
	error?: {
		detail?: string;
	};
}

export interface ApiResponse<T = unknown> {
	data?: T;
	error?: ApiError;
}

export function getApiErrorStatus(error: unknown): number | undefined {
	return (error as ApiErrorLike)?.status;
}

export function getApiErrorDetail(error: unknown, fallback: string): string {
	const candidate = error as ApiErrorLike;
	return candidate?.error?.detail || candidate?.message || fallback;
}

export function toApiError(
	error: unknown,
	fallback: string,
	fallbackStatus: number = 500
): ApiError {
	return {
		detail: getApiErrorDetail(error, fallback),
		status: getApiErrorStatus(error) || fallbackStatus
	};
}
