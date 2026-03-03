# Daar - Reverse Real Estate Marketplace for Oman

## Overview
Daar is a mobile app (Expo/React Native) where tenants/buyers post property requests and brokers send matching offers. Users can chat, call, or WhatsApp each other directly.

## Architecture
- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: Express server (port 5000) for landing page and future API
- **Data**: AsyncStorage for local persistence (MVP)
- **State**: React Context for auth, AsyncStorage-based store for data

## Key Directories
- `app/` - Expo Router screens
  - `(auth)/` - Phone login, OTP, role selection, profile setup
  - `(requester)/` - Requester tabs: My Requests, Messages, Profile
  - `(broker)/` - Broker tabs: Matched, Browse, Messages, Profile
  - `request/` - Create request, request detail
  - `offer/` - Create offer
  - `chat/` - Chat thread
  - `admin/` - Admin panel
- `contexts/` - AuthContext
- `lib/` - Types, storage helpers, query client, helpers
- `constants/` - Colors/theme
- `components/` - Shared components (ErrorBoundary, KeyboardAware)
- `server/` - Express backend

## User Roles
- **Requester**: Posts property requests, views offers, chats with brokers
- **Broker**: Browses/matches requests, sends offers, chats with requesters
- **Admin**: Phone-allowlisted users can moderate (disable users, remove content)

## Color Scheme
- Primary: #006B5E (deep teal, Oman-inspired)
- Accent: #C4975A (golden sand)
- Background: #F8F6F3 (warm off-white)

## Admin Phones
- +96899999999 and +96800000000 are admin-allowlisted

## Important Notes
- Seed data auto-loads on first launch with sample brokers and requests
- Authentication is simulated (phone + OTP flow, any 4 digits work)
- All data persisted in AsyncStorage
