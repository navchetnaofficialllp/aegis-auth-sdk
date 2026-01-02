export interface AegisConfig {
  apiKey: string;
  baseURL?: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  organization_id?: string;
  permissions?: string[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface WebAuthnCredential {
  id: string;
  rawId: number[];
  response: {
    attestationObject: number[];
    clientDataJSON: number[];
  };
  type: string;
}

export interface WebAuthnAssertion {
  id: string;
  rawId: number[];
  response: {
    authenticatorData: number[];
    clientDataJSON: number[];
    signature: number[];
    userHandle: number[] | null;
  };
  type: string;
}

export interface MFAResponse {
  qr_code?: string;
  secret?: string;
  backup_codes?: string[];
}

export type EventType = 'login' | 'logout' | 'tokenRefresh' | 'error';

export interface ErrorEvent {
  error: Error;
  endpoint?: string;
  type?: string;
}

export class AegisSDK {
  constructor(config: AegisConfig);
  
  // Event handling
  on(event: EventType, callback: (data: any) => void): void;
  emit(event: EventType, data: any): void;
  
  // HTTP requests
  request(endpoint: string, options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    skipAuth?: boolean;
    fetchOptions?: RequestInit;
  }): Promise<any>;
  
  // Authentication
  login(email: string, password: string): Promise<AuthResponse>;
  register(userData: RegisterData): Promise<any>;
  logout(): Promise<void>;
  refreshAccessToken(): Promise<AuthResponse>;
  
  // WebAuthn
  startWebAuthnRegistration(): Promise<any>;
  completeWebAuthnRegistration(credential: PublicKeyCredential): Promise<any>;
  startWebAuthnLogin(): Promise<AuthResponse>;
  completeWebAuthnLogin(assertion: PublicKeyCredential): Promise<AuthResponse>;
  
  // MFA
  enableMFA(): Promise<MFAResponse>;
  verifyMFA(code: string): Promise<any>;
  disableMFA(code: string): Promise<any>;
  
  // Password reset
  forgotPassword(email: string): Promise<any>;
  resetPassword(token: string, newPassword: string): Promise<any>;
  
  // Profile
  getProfile(): Promise<User>;
  updateProfile(profileData: ProfileData): Promise<any>;
  
  // Token management
  setTokens(authData: AuthResponse): void;
  clearTokens(): void;
  loadTokensFromStorage(): boolean;
  setupTokenRefresh(): void;
  
  // Utility methods
  isAuthenticated(): boolean;
  getUser(): User | null;
  getAccessToken(): string | null;
  isWebAuthnSupported(): boolean;
}

export interface AegisFactory {
  create(config: AegisConfig): AegisSDK;
  AegisSDK: typeof AegisSDK;
}

declare const Aegis: AegisFactory;
export default Aegis;