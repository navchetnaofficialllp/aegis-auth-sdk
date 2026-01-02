/**
 * Aegis Authentication SDK
 * Client-side JavaScript SDK for Aegis Authentication System
 * Version: 1.0.0
 */

(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.Aegis = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    class AegisSDK {
        constructor(config) {
            this.apiKey = config.apiKey;
            this.baseURL = config.baseURL || 'https://05card1j5b.execute-api.ap-south-1.amazonaws.com/prod';
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            this.tokenExpiry = null;
            
            // Event listeners
            this.listeners = {
                login: [],
                logout: [],
                tokenRefresh: [],
                error: []
            };

            // Auto-refresh token setup
            this.refreshInterval = null;
            this.setupTokenRefresh();
        }

        // Event handling
        on(event, callback) {
            if (this.listeners[event]) {
                this.listeners[event].push(callback);
            }
        }

        emit(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => callback(data));
            }
        }

        // HTTP request helper
        async request(endpoint, options = {}) {
            const url = `${this.baseURL}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            if (this.apiKey) {
                headers['X-API-Key'] = this.apiKey;
            }

            if (this.accessToken && !options.skipAuth) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            try {
                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers,
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    ...options.fetchOptions
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP ${response.status}`);
                }

                return data;
            } catch (error) {
                this.emit('error', { error, endpoint });
                throw error;
            }
        }

        // Authentication methods
        async login(email, password) {
            try {
                const response = await this.request('/auth/login', {
                    method: 'POST',
                    body: { email, password },
                    skipAuth: true
                });

                this.setTokens(response.data);
                this.emit('login', this.user);
                return response.data;
            } catch (error) {
                throw new Error(`Login failed: ${error.message}`);
            }
        }

        async register(userData) {
            try {
                const response = await this.request('/auth/register', {
                    method: 'POST',
                    body: userData,
                    skipAuth: true
                });

                return response.data;
            } catch (error) {
                throw new Error(`Registration failed: ${error.message}`);
            }
        }

        async logout() {
            try {
                if (this.accessToken) {
                    await this.request('/auth/logout', {
                        method: 'POST'
                    });
                }
            } catch (error) {
                console.warn('Logout request failed:', error.message);
            } finally {
                this.clearTokens();
                this.emit('logout');
            }
        }

        async refreshAccessToken() {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            try {
                const response = await this.request('/auth/refresh', {
                    method: 'POST',
                    body: { refresh_token: this.refreshToken },
                    skipAuth: true
                });

                this.setTokens(response.data);
                this.emit('tokenRefresh', this.user);
                return response.data;
            } catch (error) {
                this.clearTokens();
                throw new Error(`Token refresh failed: ${error.message}`);
            }
        }

        // WebAuthn methods
        async startWebAuthnRegistration() {
            try {
                const response = await this.request('/auth/webauthn/register/start', {
                    method: 'POST'
                });

                const credential = await navigator.credentials.create({
                    publicKey: response.data.options
                });

                return await this.completeWebAuthnRegistration(credential);
            } catch (error) {
                throw new Error(`WebAuthn registration failed: ${error.message}`);
            }
        }

        async completeWebAuthnRegistration(credential) {
            const credentialData = {
                id: credential.id,
                rawId: Array.from(new Uint8Array(credential.rawId)),
                response: {
                    attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
                    clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
                },
                type: credential.type
            };

            return await this.request('/auth/webauthn/register/complete', {
                method: 'POST',
                body: { credential: credentialData }
            });
        }

        async startWebAuthnLogin() {
            try {
                const response = await this.request('/auth/webauthn/login/start', {
                    method: 'POST',
                    skipAuth: true
                });

                const assertion = await navigator.credentials.get({
                    publicKey: response.data.options
                });

                return await this.completeWebAuthnLogin(assertion);
            } catch (error) {
                throw new Error(`WebAuthn login failed: ${error.message}`);
            }
        }

        async completeWebAuthnLogin(assertion) {
            const assertionData = {
                id: assertion.id,
                rawId: Array.from(new Uint8Array(assertion.rawId)),
                response: {
                    authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
                    clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
                    signature: Array.from(new Uint8Array(assertion.response.signature)),
                    userHandle: assertion.response.userHandle ? Array.from(new Uint8Array(assertion.response.userHandle)) : null
                },
                type: assertion.type
            };

            const response = await this.request('/auth/webauthn/login/complete', {
                method: 'POST',
                body: { assertion: assertionData },
                skipAuth: true
            });

            this.setTokens(response.data);
            this.emit('login', this.user);
            return response.data;
        }

        // MFA methods
        async enableMFA() {
            return await this.request('/auth/mfa/enable', {
                method: 'POST'
            });
        }

        async verifyMFA(code) {
            return await this.request('/auth/mfa/verify', {
                method: 'POST',
                body: { code }
            });
        }

        async disableMFA(code) {
            return await this.request('/auth/mfa/disable', {
                method: 'POST',
                body: { code }
            });
        }

        // Password reset
        async forgotPassword(email) {
            return await this.request('/auth/forgot-password', {
                method: 'POST',
                body: { email },
                skipAuth: true
            });
        }

        async resetPassword(token, newPassword) {
            return await this.request('/auth/reset-password', {
                method: 'POST',
                body: { token, new_password: newPassword },
                skipAuth: true
            });
        }

        // User profile
        async getProfile() {
            return await this.request('/auth/profile');
        }

        async updateProfile(profileData) {
            return await this.request('/auth/profile', {
                method: 'PATCH',
                body: profileData
            });
        }

        // Token management
        setTokens(authData) {
            this.accessToken = authData.access_token;
            this.refreshToken = authData.refresh_token;
            this.user = authData.user;
            this.tokenExpiry = Date.now() + (authData.expires_in * 1000);

            // Store in localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('aegis_access_token', this.accessToken);
                localStorage.setItem('aegis_refresh_token', this.refreshToken);
                localStorage.setItem('aegis_user', JSON.stringify(this.user));
                localStorage.setItem('aegis_token_expiry', this.tokenExpiry.toString());
            }

            this.setupTokenRefresh();
        }

        clearTokens() {
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            this.tokenExpiry = null;

            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }

            // Clear from localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('aegis_access_token');
                localStorage.removeItem('aegis_refresh_token');
                localStorage.removeItem('aegis_user');
                localStorage.removeItem('aegis_token_expiry');
            }
        }

        loadTokensFromStorage() {
            if (typeof localStorage === 'undefined') return false;

            const accessToken = localStorage.getItem('aegis_access_token');
            const refreshToken = localStorage.getItem('aegis_refresh_token');
            const user = localStorage.getItem('aegis_user');
            const tokenExpiry = localStorage.getItem('aegis_token_expiry');

            if (accessToken && refreshToken && user && tokenExpiry) {
                this.accessToken = accessToken;
                this.refreshToken = refreshToken;
                this.user = JSON.parse(user);
                this.tokenExpiry = parseInt(tokenExpiry);

                // Check if token is expired
                if (Date.now() >= this.tokenExpiry) {
                    this.clearTokens();
                    return false;
                }

                this.setupTokenRefresh();
                return true;
            }

            return false;
        }

        setupTokenRefresh() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }

            if (this.tokenExpiry) {
                const refreshTime = this.tokenExpiry - Date.now() - 60000; // Refresh 1 minute before expiry
                if (refreshTime > 0) {
                    this.refreshInterval = setTimeout(async () => {
                        try {
                            await this.refreshAccessToken();
                        } catch (error) {
                            this.emit('error', { error, type: 'token_refresh' });
                        }
                    }, refreshTime);
                }
            }
        }

        // Utility methods
        isAuthenticated() {
            return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
        }

        getUser() {
            return this.user;
        }

        getAccessToken() {
            return this.accessToken;
        }

        // WebAuthn support check
        isWebAuthnSupported() {
            return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get);
        }
    }

    // Factory function
    function createAegisSDK(config) {
        if (!config || !config.apiKey) {
            throw new Error('Aegis SDK requires an API key');
        }

        const sdk = new AegisSDK(config);
        
        // Try to load existing tokens
        sdk.loadTokensFromStorage();

        return sdk;
    }

    // Export
    return {
        create: createAegisSDK,
        AegisSDK
    };
}));