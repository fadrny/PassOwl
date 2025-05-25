export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	passwordConfirm: string;
}

export interface LoginRequest {
	username: string;
	login_password_hash: string;
}

export interface RegisterRequest {
	username: string;
	login_password_hash: string;
	login_salt: string;
	encryption_salt: string;
}

export interface LoginResponse {
	access_token: string;
	token_type: string;
}

export interface SaltsResponse {
	login_salt: string;
	encryption_salt: string;
}

export interface AuthUser {
	username: string;
	isLoggedIn: boolean;
}
