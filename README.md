<<<<<<< HEAD
# Aegis Auth - JavaScript SDK

**Aegis Auth is a unified identity management system providing memory-safe Rust-based authentication. Consolidation of disparate identity providers into a single canonical source.**

*Aegis Auth by Navchetna Technologies.*  
*Securing the future of decentralized identity.*  
*© 2026 Standard Core v3.*

---

Official JavaScript SDK for the Aegis Authentication System. Supports traditional authentication, WebAuthn/Passkeys, MFA, and more.

## Installation

### Via CDN
```html
<script src="https://cdn.jsdelivr.net/npm/aegis-auth-navchetna@latest/aegis-sdk.min.js"></script>
```

### Via npm
```bash
npm install aegis-auth-navchetna
```

### Via yarn
```bash
yarn add aegis-auth-navchetna
```

## Quick Start

### CDN Usage
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/@aegis/auth-sdk@latest/aegis-sdk.min.js"></script>
</head>
<body>
    <script>
        const aegis = Aegis.create({
            apiKey: 'your-api-key-here'
        });

        // Login example
        aegis.login('user@example.com', 'password')
            .then(response => {
                console.log('Logged in:', response.user);
            })
            .catch(error => {
                console.error('Login failed:', error);
            });
    </script>
</body>
</html>
```

### ES6 Module Usage
```javascript
import Aegis from 'aegis-auth-navchetna';

const aegis = Aegis.create({
    apiKey: 'your-api-key-here',
    baseURL: 'https://your-aegis-instance.com' // Optional
});
```

### CommonJS Usage
```javascript
const Aegis = require('aegis-auth-navchetna');

const aegis = Aegis.create({
    apiKey: 'your-api-key-here'
});
```

## Configuration

```javascript
const aegis = Aegis.create({
    apiKey: 'your-api-key-here',           // Required: Your project API key
    baseURL: 'https://your-instance.com'   // Optional: Custom Aegis instance URL
});
```

## Authentication Methods

### Email/Password Authentication

#### Login
```javascript
try {
    const response = await aegis.login('user@example.com', 'password');
    console.log('User:', response.user);
    console.log('Access Token:', response.access_token);
} catch (error) {
    console.error('Login failed:', error.message);
}
```

#### Register
```javascript
try {
    const response = await aegis.register({
        email: 'user@example.com',
        password: 'securePassword123',
        first_name: 'John',
        last_name: 'Doe'
    });
    console.log('Registration successful:', response);
} catch (error) {
    console.error('Registration failed:', error.message);
}
```

#### Logout
```javascript
await aegis.logout();
```

### WebAuthn/Passkeys

#### Check WebAuthn Support
```javascript
if (aegis.isWebAuthnSupported()) {
    console.log('WebAuthn is supported');
} else {
    console.log('WebAuthn is not supported');
}
```

#### Register WebAuthn Credential
```javascript
try {
    const response = await aegis.startWebAuthnRegistration();
    console.log('WebAuthn credential registered:', response);
} catch (error) {
    console.error('WebAuthn registration failed:', error.message);
}
```

#### Login with WebAuthn
```javascript
try {
    const response = await aegis.startWebAuthnLogin();
    console.log('WebAuthn login successful:', response.user);
} catch (error) {
    console.error('WebAuthn login failed:', error.message);
}
```

### Multi-Factor Authentication (MFA)

#### Enable MFA
```javascript
try {
    const response = await aegis.enableMFA();
    console.log('QR Code:', response.qr_code);
    console.log('Secret:', response.secret);
    console.log('Backup Codes:', response.backup_codes);
} catch (error) {
    console.error('MFA enable failed:', error.message);
}
```

#### Verify MFA Code
```javascript
try {
    const response = await aegis.verifyMFA('123456');
    console.log('MFA verified:', response);
} catch (error) {
    console.error('MFA verification failed:', error.message);
}
```

#### Disable MFA
```javascript
try {
    await aegis.disableMFA('123456');
    console.log('MFA disabled');
} catch (error) {
    console.error('MFA disable failed:', error.message);
}
```

### Password Reset

#### Request Password Reset
```javascript
try {
    await aegis.forgotPassword('user@example.com');
    console.log('Password reset email sent');
} catch (error) {
    console.error('Password reset request failed:', error.message);
}
```

#### Reset Password
```javascript
try {
    await aegis.resetPassword('reset-token', 'newPassword123');
    console.log('Password reset successful');
} catch (error) {
    console.error('Password reset failed:', error.message);
}
```

## User Profile Management

### Get User Profile
```javascript
try {
    const profile = await aegis.getProfile();
    console.log('User profile:', profile);
} catch (error) {
    console.error('Failed to get profile:', error.message);
}
```

### Update User Profile
```javascript
try {
    const response = await aegis.updateProfile({
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890'
    });
    console.log('Profile updated:', response);
} catch (error) {
    console.error('Profile update failed:', error.message);
}
```

## Token Management

### Check Authentication Status
```javascript
if (aegis.isAuthenticated()) {
    console.log('User is authenticated');
    console.log('Current user:', aegis.getUser());
} else {
    console.log('User is not authenticated');
}
```

### Get Access Token
```javascript
const token = aegis.getAccessToken();
if (token) {
    console.log('Access token:', token);
}
```

### Manual Token Refresh
```javascript
try {
    const response = await aegis.refreshAccessToken();
    console.log('Token refreshed:', response);
} catch (error) {
    console.error('Token refresh failed:', error.message);
}
```

## Event Handling

The SDK emits events for various authentication states:

```javascript
// Listen for login events
aegis.on('login', (user) => {
    console.log('User logged in:', user);
});

// Listen for logout events
aegis.on('logout', () => {
    console.log('User logged out');
});

// Listen for token refresh events
aegis.on('tokenRefresh', (user) => {
    console.log('Token refreshed for user:', user);
});

// Listen for error events
aegis.on('error', (errorData) => {
    console.error('SDK Error:', errorData.error);
    console.error('Endpoint:', errorData.endpoint);
});
```

## Advanced Usage

### Custom Request Headers
```javascript
const response = await aegis.request('/custom/endpoint', {
    method: 'POST',
    headers: {
        'Custom-Header': 'value'
    },
    body: { data: 'example' }
});
```

### Skip Authentication for Public Endpoints
```javascript
const response = await aegis.request('/public/endpoint', {
    skipAuth: true
});
```

## Error Handling

The SDK throws descriptive errors that you can catch and handle:

```javascript
try {
    await aegis.login('user@example.com', 'wrongpassword');
} catch (error) {
    if (error.message.includes('Invalid credentials')) {
        // Handle invalid credentials
        console.log('Please check your email and password');
    } else if (error.message.includes('Network')) {
        // Handle network errors
        console.log('Please check your internet connection');
    } else {
        // Handle other errors
        console.log('An unexpected error occurred');
    }
}
```

## Browser Compatibility

- Chrome 67+
- Firefox 60+
- Safari 13+
- Edge 79+

WebAuthn features require HTTPS in production.

## TypeScript Support

The SDK includes TypeScript definitions:

```typescript
import Aegis, { AegisConfig, User, AuthResponse } from 'aegis-auth-navchetna';

const config: AegisConfig = {
    apiKey: 'your-api-key'
};

const aegis = Aegis.create(config);

aegis.login('user@example.com', 'password')
    .then((response: AuthResponse) => {
        const user: User = response.user;
        console.log('Logged in user:', user);
    });
```

## Security Best Practices

1. **Never expose your API key** in client-side code in production
2. **Use HTTPS** in production environments
3. **Implement proper error handling** to avoid exposing sensitive information
4. **Store tokens securely** - the SDK uses localStorage by default
5. **Implement logout functionality** to clear tokens when users sign out

## Support

- Documentation: [https://docs.aegis.com](https://docs.aegis.com)
- Issues: [https://github.com/navchetna/aegis-auth-sdk/issues](https://github.com/navchetna/aegis-auth-sdk/issues)
- Email: support@navchetna.com

---

**Aegis Auth by Navchetna Technologies**  
*Securing the future of decentralized identity*  
© 2026 Standard Core v3

## License

MIT License - see LICENSE file for details.
=======
# aegis-auth-sdk
Aegis Auth is a unified identity management system providing memory-safe Rust-based authentication. Consolidation of disparate identity providers into a single canonical source.
>>>>>>> 746fc2c4376c26a198a776b3dbc55aa02e19befa
