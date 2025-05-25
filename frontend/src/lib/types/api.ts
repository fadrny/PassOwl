export interface ApiError {
	detail: string;
	status?: number;
}

export interface ApiResponse<T = any> {
	data?: T;
	error?: ApiError;
}
