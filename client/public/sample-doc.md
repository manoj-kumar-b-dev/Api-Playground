# Authentication & User Management API

## 1. Login User Endpoint
Authenticate user using email and password to receive JWT bearer token.

**Endpoint:** `POST https://api.example.com/v1/auth/login`

### Headers:
- `Content-Type: application/json`
- `X-App-Version: 2.1.0`

### Request Body:
```json
{
  "email": "developer@example.com",
  "password": "SuperSecretPassword123!",
  "rememberMe": true
}
```

### Responses:
- `200 OK`: Returns access token and user session object.

---

## 2. Register New Organization Member
Create a new user account within an existing workspace.

**Endpoint:** `POST https://api.example.com/v1/users/register`

### Headers:
- `Authorization: Bearer sample_jwt_token_here`
- `Content-Type: application/json`

### Query Parameters:
- `notifyAdmin`: `true` (optional)
- `sendWelcomeEmail`: `true` (optional)

### Request Body:
```json
{
  "firstName": "Alex",
  "lastName": "Rivera",
  "email": "alex.rivera@company.com",
  "role": "Manager",
  "age": 30,
  "website": "https://alexrivera.dev",
  "address": {
    "street": "456 Innovation Way",
    "city": "San Francisco",
    "country": "USA"
  },
  "skills": ["TypeScript", "Node.js", "React"]
}
```
