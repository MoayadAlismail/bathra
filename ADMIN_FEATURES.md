# Admin Dashboard Features

This document outlines the admin dashboard features implemented for user management and verification.

## Features Implemented

### 1. User Management System

- **Comprehensive User Listing**: View all startups and investors in a unified interface
- **Advanced Filtering**: Filter by user type, status, verification status, and search by name/email
- **Real-time Statistics**: Dashboard showing user counts, approval rates, and pending reviews

### 2. User Verification System

- **Status Management**: Approve, reject, flag, or mark users as pending
- **Visibility Controls**: Set users as "Featured", "Hot", or "Normal" for enhanced visibility
- **Admin Notes**: Add internal notes for tracking verification decisions
- **Verification Tracking**: Track who verified users and when

### 3. Profile Management

- **Detailed User Profiles**: View complete startup and investor information
- **Profile Editing**: Edit user information directly from the admin panel
- **Type-specific Data**: Different data views for startups vs investors
- **Financial Information**: View startup funding details and investor preferences

### 4. Access Control

- **Verification-based Access**: Only verified users can access certain features
- **Middleware Protection**: Built-in checks for user verification status
- **Status-based Restrictions**: Different access levels based on approval status

## Database Schema Updates

### Added Fields to `investors` and `startups` tables:

```sql
-- Admin Management Fields
verified BOOLEAN DEFAULT FALSE
status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')) DEFAULT 'pending'
visibility_status TEXT CHECK (visibility_status IN ('featured', 'hot', 'normal'))
admin_notes TEXT
verified_at TIMESTAMP
verified_by TEXT
updated_at TIMESTAMP
```

## Components Structure

### Admin Components (`src/components/admin/`)

- `UserManagement.tsx` - Main user management interface
- `UserDetailModal.tsx` - Detailed user profile viewer/editor
- `UserStatusModal.tsx` - User status management modal
- `DashboardStats.tsx` - Real-time dashboard statistics

### Auth Components (`src/components/auth/`)

- `VerificationBanner.tsx` - Shows verification status to users

### Services (`src/lib/`)

- `admin-service.ts` - Backend service for admin operations
- `auth-middleware.ts` - Verification check utilities
- `demo-admin-data.ts` - Demo data for testing

## Admin Dashboard Navigation

The admin dashboard includes:

1. **Dashboard Tab**: Overview statistics and recent activity
2. **User Management Tab**: Comprehensive user management interface

## User Status Types

- **Pending**: New users awaiting admin review
- **Approved**: Verified users with full platform access
- **Rejected**: Users who don't meet criteria
- **Flagged**: Users requiring special attention or investigation

## Visibility Status Types

- **Normal**: Standard visibility on the platform
- **Hot**: Marked as trending or in-demand
- **Featured**: Highlighted prominently on the platform

## Security Features

### Authorization Checks

- Only admin users can access admin features
- Profile-based permission checks
- Verification status enforcement

### Data Validation

- Input validation for status updates
- Secure profile editing with type checking
- Protected admin operations

## Usage Instructions

### For Admins:

1. Access `/admin` route (requires admin account type)
2. Use Dashboard tab for overview and statistics
3. Use User Management tab for detailed user operations
4. Click user actions to view details, edit profiles, or update status
5. Use quick actions for fast approve/reject operations

### For Users:

- Verification banner shows current status
- Access restrictions apply based on verification status
- Contact support for rejected/flagged accounts

## API Integration Notes

The admin system is designed to work with Supabase but includes demo data for testing. In production:

1. Update database tables with new schema
2. Configure row-level security policies
3. Set up admin user authentication
4. Replace demo data with real Supabase queries

## Future Enhancements

- Bulk user operations
- Advanced analytics and reporting
- User communication system
- Automated verification workflows
- Audit logging for admin actions
