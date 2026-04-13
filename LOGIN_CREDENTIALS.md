# Smart Campus Operations Hub - Login Credentials

## Demo Test Credentials

All demo accounts use the same password: **`password`**

### STUDENT Account
```
Username: student1
Password: password
Role: STUDENT
```

### LECTURER Account
```
Username: lecturer1
Password: password
Role: LECTURER
```

### TECHNICIAN Account
```
Username: technician1
Password: password
Role: TECHNICIAN
```

### ADMIN Account
```
Username: admin
Password: password
Role: ADMIN
```

## API Login Endpoint

**POST** `http://localhost:8083/api/auth/login`

### Request Body
```json
{
  "username": "admin",
  "password": "password"
}
```

### Response (Success)
```json
{
  "token": "demo-token-1681234567890",
  "username": "admin",
  "role": "ADMIN",
  "userId": 1
}
```

### Response (Invalid Password)
```
401 Unauthorized
```

## Using the Token

Store the token from login response and include it in subsequent requests:

```
Authorization: Bearer demo-token-1681234567890
```

Or in JavaScript:
```javascript
const loginResponse = await fetch('http://localhost:8083/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password' })
}).then(r => r.json());

// Use token in future requests
const headers = {
  'Authorization': `Bearer ${loginResponse.token}`,
  'Content-Type': 'application/json'
};
```

## Role Permissions

| Feature | STUDENT | LECTURER | TECHNICIAN | ADMIN |
|---------|---------|----------|-----------|-------|
| Create Tickets | ✅ | ✅ | ✅ | ✅ |
| View Own Tickets | ✅ | ✅ | ✅ | ✅ |
| View All Tickets | ❌ | ❌ | ❌ | ✅ |
| View Assigned Jobs | ❌ | ❌ | ✅ | ✅ |
| Assign Technician | ❌ | ❌ | ❌ | ✅ |
| Complete Ticket | ❌ | ❌ | ✅ | ✅ |
| Book Lecture Hall | ❌ | ✅ | ❌ | ❌ |
| Approve Bookings | ❌ | ❌ | ❌ | ✅ |
| View Notifications | ✅ | ✅ | ✅ | ✅ |
| Comment on Tickets | ✅ | ✅ | ✅ | ✅ |

## Testing Quick Links

### Test Login
```bash
curl -X POST http://localhost:8083/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Create Ticket (No Auth Required - Demo Mode)
```bash
curl -X POST http://localhost:8083/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "Testing the system",
    "category": "REPAIR",
    "priority": "MEDIUM",
    "locationCategory": "MAIN_BUILDING",
    "buildingName": "Main Building",
    "floorNumber": 2,
    "block": "L",
    "roomNumber": "201",
    "contactPhone": "0771234567"
  }'
```

### List My Notifications
```bash
curl http://localhost:8083/api/notifications/my \
  -H "Authorization: Bearer <your-token>"
```

### List Lecture Halls
```bash
curl http://localhost:8083/api/halls
```

### List Available Halls
```bash
curl "http://localhost:8083/api/halls/available?date=2026-04-15&startTime=09:00&endTime=11:00"
```

## Notes

- All endpoints are currently in **demo/development mode** - no strict authentication enforced
- Authentication tokens are demo tokens (not real JWTs) for testing purposes
- User ID is always hardcoded as `1L` for demo purposes
- Role detection is based on username contains: "admin", "tech", "lecturer"
- Password validation checks against literal string "password"
