# Quick Fix Guide - Registration Issue

## Problem
Registration fails when creating new accounts.

## Solution (3 Simple Steps)

### Step 1: Setup Database
```bash
cd Backend
node setup-database.js
```

This will:
- ✓ Check if roles exist
- ✓ Insert India country
- ✓ Insert West Bengal state
- ✓ Insert all 23 districts of West Bengal

### Step 2: Restart Backend
```bash
cd Backend
npm start
```

Backend should start on http://localhost:5000

### Step 3: Test Registration
Open http://localhost:5173/register and try:

**Option A: Register as Businessman**
- Select "Businessman" from dropdown
- Fill in details
- Click "Create Account"

**Option B: Register as Core Body**
- Select "Core Body / Dealer" from dropdown
- Choose "Core Body A" or "Core Body B"
- Select a district (e.g., Kolkata)
- Fill in details
- Click "Create Account"

## What Was Fixed?

### Backend (`authController.js`)
- Now accepts `district` parameter
- Converts district name to `district_id`
- Inserts user with proper district reference

### Frontend (`Register.tsx`)
- Validates district selection for Core Body
- Sends district to backend
- Sends correct role_code (core_body_a, core_body_b, etc.)

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Linux/Mac: sudo systemctl status postgresql
```

### "Role not found"
```bash
cd Backend
psql -U postgres -d fts_db -f insert_roles.sql
```

### "Backend not starting"
```bash
# Check .env file exists with:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fts_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

## Test with Script
```bash
cd Backend
node test-registration-fix.js
```

This will test:
1. Businessman registration (no district)
2. Core Body A registration (with district)
3. Customer registration (no district)

## Success Indicators
✓ Backend logs: "User registered successfully"
✓ Frontend shows: "Registration Successful"
✓ Redirects to email verification page

## Need Help?
Check the detailed documentation:
- `Backend/REGISTRATION_FIX_README.md` - Full documentation
- `Backend/setup-database.js` - Database setup script
- `Backend/test-registration-fix.js` - Test script
