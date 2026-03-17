# Registration Fix - FTS Project

## Problem
Registration was failing when creating new accounts because:
1. The `users` table has a `district_id` column that wasn't being populated
2. Frontend was collecting district information but not sending it to backend
3. Backend wasn't handling district parameter in registration

## Solution

### Backend Changes (`Backend/src/controllers/authController.js`)
- Added `district` parameter extraction from request body
- Added district lookup logic to convert district name to `district_id`
- Updated INSERT query to include `district_id` column
- Handles both core_body registrations (with district) and other roles (without district)

### Frontend Changes (`Frontend/src/pages/Register.tsx`)
- Added validation for core_body type and district selection
- Updated API call to send `district` parameter
- Changed `role_code` to send the actual selected type (core_body_a, core_body_b, dealer, businessman, customer)

### Database Setup

#### Step 1: Populate Districts
Run the SQL script to populate West Bengal districts:

```bash
cd Backend
psql -U postgres -d fts_db -f insert_districts.sql
```

Or manually run:
```sql
-- Check if districts exist
SELECT * FROM districts;

-- If empty, run the insert_districts.sql script
```

#### Step 2: Verify Database Schema
Ensure the users table has district_id column:
```sql
\d users
```

You should see `district_id` column with type `integer`.

## Testing

### Option 1: Using Test Script
```bash
cd Backend
node test-registration-fix.js
```

### Option 2: Manual Testing via Frontend
1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd Frontend && npm run dev`
3. Navigate to http://localhost:5173/register
4. Try registering:
   - **Businessman**: Select "Businessman" role (no district needed)
   - **Core Body A/B**: Select "Core Body / Dealer" → Choose type → Select district
   - **Customer**: Default role (no district needed)

### Option 3: Using cURL
```bash
# Test businessman registration (no district)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "password123",
    "role_code": "businessman",
    "district": null
  }'

# Test Core Body A registration (with district)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543211",
    "email": "corebody@example.com",
    "full_name": "Core Body User",
    "password": "password123",
    "role_code": "core_body_a",
    "district": "kolkata"
  }'
```

## District Name Mapping
The backend converts district names from the frontend format to database format:
- Frontend: `kolkata`, `north_24_parganas`, `cooch_behar`
- Database: `Kolkata`, `North 24 Parganas`, `Cooch Behar`

The conversion is case-insensitive and handles underscores/spaces automatically.

## Available Districts (West Bengal)
- Alipurduar
- Bankura
- Birbhum
- Cooch Behar
- Dakshin Dinajpur
- Darjeeling
- Hooghly
- Howrah
- Jalpaiguri
- Jhargram
- Kalimpong
- Kolkata
- Malda
- Murshidabad
- Nadia
- North 24 Parganas
- Paschim Bardhaman
- Paschim Medinipur
- Purba Bardhaman
- Purba Medinipur
- Purulia
- South 24 Parganas
- Uttar Dinajpur

## Role Codes
- `customer` - Default customer role
- `businessman` - Businessman role
- `core_body_a` - Core Body Type A (requires district)
- `core_body_b` - Core Body Type B (requires district)
- `dealer` - Dealer role (under Core Body)

## Troubleshooting

### Error: "Invalid role code"
- Check if `user_roles` table has the required roles
- Run: `SELECT * FROM user_roles;`
- If missing, run: `Backend/insert_roles.sql`

### Error: "User already exists"
- Phone or email is already registered
- Use different phone/email or delete test users:
```sql
DELETE FROM users WHERE email LIKE '%test%';
```

### Error: "district_id violates foreign key constraint"
- Districts table is empty
- Run: `Backend/insert_districts.sql`

### Backend not starting
- Check if PostgreSQL is running
- Verify `.env` file has correct database credentials
- Check port 5000 is not in use

### Frontend not connecting
- Ensure backend is running on port 5000
- Check CORS settings in `Backend/src/app.js`
- Verify frontend is running on port 5173

## Files Modified
1. `Backend/src/controllers/authController.js` - Added district handling
2. `Frontend/src/pages/Register.tsx` - Added validation and district parameter

## Files Created
1. `Backend/insert_districts.sql` - Populates West Bengal districts
2. `Backend/test-registration-fix.js` - Test script for registration
3. `Backend/REGISTRATION_FIX_README.md` - This documentation

## Next Steps
After registration works:
1. Test email verification flow
2. Test login with registered users
3. Verify role-based dashboard access
4. Test Core Body profile creation
