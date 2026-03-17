# Frontend Routes Summary - KYC & Device Management

## 📍 Routes Location

### Admin Panel Routes

#### KYC Management
- **Route:** `/admin/kyc/review`
- **Component:** `KYCReview.tsx`
- **Location:** `Frontend/src/pages/kyc/KYCReview.tsx`
- **Sidebar:** Users & Roles → KYC Review
- **Access:** Admin only
- **Features:**
  - View pending KYC documents
  - Approve/Reject documents
  - Add review notes
  - View user information

#### Device Management (Admin)
- **Route:** `/admin/settings/devices`
- **Component:** `DeviceManagement.tsx`
- **Location:** `Frontend/src/pages/settings/DeviceManagement.tsx`
- **Sidebar:** Settings → Device Management
- **Access:** Admin only
- **Features:**
  - View all user devices
  - Flag suspicious devices
  - Remove devices
  - Device tracking

---

### Businessman Panel Routes

#### KYC Management (Businessman)
- **Route:** `/businessman/kyc`
- **Component:** `KYCManagement.tsx`
- **Location:** `Frontend/src/pages/kyc/KYCManagement.tsx`
- **Sidebar:** Settings → KYC Management
- **Access:** Businessman (authenticated)
- **Features:**
  - Upload KYC documents
  - View document status
  - Track approval status
  - Document history

#### Device Management (Businessman)
- **Route:** `/businessman/settings/devices`
- **Component:** `DeviceManagement.tsx`
- **Location:** `Frontend/src/pages/settings/DeviceManagement.tsx`
- **Sidebar:** Settings → Device Management
- **Access:** Businessman (authenticated)
- **Features:**
  - View logged-in devices
  - Remove devices
  - Device security

---

### Customer Panel Routes

#### KYC Management (Customer)
- **Route:** `/customer/kyc`
- **Component:** `KYCManagement.tsx`
- **Location:** `Frontend/src/pages/kyc/KYCManagement.tsx`
- **Access:** Customer (authenticated)
- **Features:**
  - Upload identity documents
  - View verification status

#### Device Management (Customer)
- **Route:** `/customer/settings/devices`
- **Component:** `DeviceManagement.tsx`
- **Location:** `Frontend/src/pages/settings/DeviceManagement.tsx`
- **Access:** Customer (authenticated)
- **Features:**
  - View active sessions
  - Remove devices

---

## 🗂️ Sidebar Menu Structure

### Admin Sidebar (`sidebarConfig.ts`)
```
Users & Roles
├── All Businessmen
├── Entry Mode Users
├── Advance Mode Users
├── Bulk Users
├── Stock Point List
├── Role Permissions
├── Feature Access Control
└── KYC Review ✅ NEW

Settings
├── Platform Settings
├── Notification Rules
├── API & Integration
├── Language & Localization
├── Maintenance Mode
└── Device Management ✅ NEW
```

### Businessman Sidebar (`businessmanSidebarConfig.ts`)
```
Settings ✅ NEW
├── KYC Management
└── Device Management
```

---

## 🔗 API Endpoints Used

### KYC APIs
- `POST /api/kyc/upload` - Upload document
- `GET /api/kyc/status` - Get user's KYC status
- `GET /api/kyc/audit-log` - Get audit history
- `GET /api/kyc/pending` - Get pending KYC (Admin)
- `POST /api/kyc/review` - Review KYC (Admin)

### Device APIs
- `GET /api/devices` - Get user devices
- `DELETE /api/devices/:device_id` - Remove device
- `POST /api/devices/flag` - Flag device (Admin)

### Roles API
- `GET /api/roles` - Get all system roles
- `GET /api/roles/:role_code` - Get specific role

---

## 📱 Component Reusability

### Shared Components
- **KYCManagement.tsx** - Used by Businessman & Customer
- **DeviceManagement.tsx** - Used by Admin, Businessman & Customer
- **DeviceCard.tsx** - Reusable device display component
- **RolesList.tsx** - Display system roles

### Component Locations
```
Frontend/src/
├── pages/
│   ├── kyc/
│   │   ├── KYCManagement.tsx (User upload)
│   │   ├── KYCReview.tsx (Admin review)
│   │   └── index.ts
│   └── settings/
│       └── DeviceManagement.tsx
└── components/
    ├── roles/
    │   ├── RolesList.tsx
    │   └── index.ts
    └── devices/
        ├── DeviceCard.tsx
        └── index.ts
```

---

## 🎯 Access Control

| Route | Admin | Core Body | Businessman | Customer |
|-------|-------|-----------|-------------|----------|
| `/admin/kyc/review` | ✅ | ❌ | ❌ | ❌ |
| `/admin/settings/devices` | ✅ | ❌ | ❌ | ❌ |
| `/businessman/kyc` | ❌ | ❌ | ✅ | ❌ |
| `/businessman/settings/devices` | ❌ | ❌ | ✅ | ❌ |
| `/customer/kyc` | ❌ | ❌ | ❌ | ✅ |
| `/customer/settings/devices` | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 How to Access

### For Admin:
1. Login as Admin
2. Navigate to **Users & Roles** → **KYC Review**
3. Or **Settings** → **Device Management**

### For Businessman:
1. Login as Businessman
2. Navigate to **Settings** → **KYC Management**
3. Or **Settings** → **Device Management**

### For Customer:
1. Login as Customer
2. Navigate to Profile/Settings
3. Access KYC or Device Management

---

## 📝 Next Steps

To fully integrate these routes, you need to:

1. **Add routes to React Router** in `App.tsx` or routing config
2. **Add Core Body sidebar** - Similar to Businessman
3. **Add Customer sidebar** - Create customer panel navigation
4. **Implement route guards** - Protect routes based on user role
5. **Add breadcrumbs** - For better navigation

Example route configuration:
```tsx
// In App.tsx or routes config
<Route path="/admin/kyc/review" element={<KYCReview />} />
<Route path="/admin/settings/devices" element={<DeviceManagement />} />
<Route path="/businessman/kyc" element={<KYCManagement />} />
<Route path="/businessman/settings/devices" element={<DeviceManagement />} />
```
