# Reality Check — A Location-Based Civic Maintenance Platform

A full-stack civic reporting platform that lets citizens report municipal infrastructure issues (potholes, broken streetlights, sanitation problems, water leaks, and more) via a mobile app, and enables municipal authorities to track, filter, and resolve them through a real-time web dashboard.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Core Algorithms](#core-algorithms)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Scope](#future-scope)
- [Authors](#authors)
- [License](#license)

---

## Overview

Cities face a chronic gap between citizens noticing civic problems and municipal authorities resolving them. Complaint helplines are slow, social media posts get lost, and existing apps are fragmented by department.

**Reality Check** closes this gap by combining:

- A **citizen mobile app** for reporting issues with location and photographic evidence
- A **municipal web dashboard** for authorities to see all incoming reports on a live map and update their status in real time
- A **Node.js backend** that auto-routes reports to the correct municipal zone using geospatial queries, detects duplicates within a 15-meter radius, and syncs everything over WebSockets

---

## Features

### Citizen Mobile App
- 🗺️ Interactive map with pin-drop reporting
- 📷 Photo evidence via camera or gallery
- 🎯 Auto-routing of reports to the correct municipal zone
- 🔁 Duplicate detection (upvotes an existing report if one exists nearby)
- 📊 Real-time status tracking with color-coded badges
- 📰 Community feed with recent and popular sorting
- 👍 Upvote system for community-reported issues
- 🏅 Gamification: points, badges, and leaderboard
- 📢 City-wide announcements from the municipality
- ☎️ Emergency contacts with one-tap dialing

### Admin Web Dashboard
- 🗺️ Live map with status-colored markers
- 📋 Filterable ticket queue with search
- 👆 One-click status updates (Assigned, In Progress, Resolved, Rejected)
- 🗑️ Delete invalid or duplicate reports
- 📢 Announcements management (create, delete)
- 🏆 Leaderboard with top-three podium
- 📈 Analytics: KPIs, category breakdown, weekly trends, resolution rate
- ⚡ Real-time updates via WebSocket (no page refresh needed)

### Backend
- 🔐 JWT authentication with bcrypt password hashing
- 🌍 Geospatial routing using MongoDB 2dsphere indexes
- 📍 Point-in-polygon auto-routing with `$geoIntersects`
- 🔄 Proximity-based duplicate detection with `$near`
- ⚡ Socket.io real-time bidirectional updates
- 🖼️ Cloudinary integration for scalable image storage
- 🎮 Gamification service with points and badge rules

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native, Expo, React Navigation, AsyncStorage, expo-location, expo-image-picker |
| Web Dashboard | React, Vite, React Router, Tailwind CSS |
| Maps | Leaflet, OpenStreetMap tiles, Photon geocoder |
| Backend | Node.js, Express, Socket.io, Multer, JWT, bcryptjs |
| Database | MongoDB Atlas (2dsphere indexes) |
| File Storage | Cloudinary |
| Real-time | Socket.io (WebSocket) |
| Deployment | Render (backend), Vercel (dashboard), Expo Go (mobile) |

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Citizen Mobile    │         │   Admin Dashboard    │
│  React Native+Expo  │         │   React + Vite       │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           │      REST + WebSocket         │
           └─────────────┬─────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Express Backend    │
              │   Node.js + Socket.io│
              │  ┌────────────────┐  │
              │  │ Routing Service│  │
              │  │ Gamification   │  │
              │  └────────────────┘  │
              └────┬────────────┬────┘
                   │            │
         ┌─────────▼────┐   ┌───▼─────────┐
         │ MongoDB Atlas │   │ Cloudinary  │
         │ (2dsphere)    │   │ Image CDN   │
         └───────────────┘   └─────────────┘
```

---

## Project Structure

```
civic-platform/
├── backend/                          # Express API + Socket.io server
│   ├── src/
│   │   ├── config/                   # Database + Cloudinary config
│   │   ├── models/                   # Mongoose schemas
│   │   ├── controllers/              # Request handlers
│   │   ├── routes/                   # Express route definitions
│   │   ├── middleware/               # Auth, upload, error handling
│   │   ├── services/                 # Routing + gamification logic
│   │   ├── sockets/                  # Socket.io auth + rooms
│   │   └── utils/                    # Seed script
│   ├── .env.example
│   └── server.js
│
├── mobile/                           # React Native (Expo) citizen app
│   ├── src/
│   │   ├── api/                      # Axios client
│   │   ├── context/                  # Auth state
│   │   ├── hooks/                    # useSocket hook
│   │   ├── components/               # Leaflet WebView wrapper
│   │   ├── screens/                  # All screens
│   │   └── utils/                    # Theme + categories
│   ├── App.js
│   └── app.json
│
├── admin/                            # React web dashboard
│   ├── src/
│   │   ├── api/                      # Axios client
│   │   ├── context/                  # Auth state
│   │   ├── hooks/                    # useSocket hook
│   │   ├── components/               # Reusable UI
│   │   ├── pages/                    # Route pages
│   │   └── utils/                    # Design tokens + categories
│   ├── .env.example
│   └── vite.config.js
│
├── docs/                             # Screenshots, diagrams
│   ├── synopsis.pdf
│   └── screenshots/
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure you have these installed and set up before starting:

- **Node.js v20 or later** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com/downloads)
- **A MongoDB Atlas account** — free tier at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **A Cloudinary account** — free tier at [cloudinary.com](https://cloudinary.com)
- **Expo Go app** on your phone (Android: Play Store, iOS: App Store)
- **VS Code** (or your preferred editor)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/reality-check.git
cd reality-check
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/civic_platform
JWT_SECRET=make_this_a_long_random_string
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=*
```

Seed the database to create sample municipal zones and demo users:

```bash
npm run seed
```

### 3. Mobile App Setup

```bash
cd ../mobile
npm install
```

Find your computer's local IP address:

- **Windows:** Open a terminal and run `ipconfig`. Look for **IPv4 Address**.
- **Mac/Linux:** Run `ifconfig` and look for **inet** under your active network.

Open `src/api/client.js` and set the `SERVER_URL` to your IP:

```javascript
export const SERVER_URL = 'http://192.168.1.2:5000';  // Replace with your IP
export const API_URL = `${SERVER_URL}/api`;
```

### 4. Admin Dashboard Setup

```bash
cd ../admin
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your IP:

```env
VITE_API_URL=http://192.168.1.2:5000/api
VITE_SOCKET_URL=http://192.168.1.2:5000
```

---

## Running the Project

You need **three terminals** running simultaneously.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### Terminal 2 — Mobile App

```bash
cd mobile
npx expo start
```

A QR code will appear. Scan it with:
- **Android:** The Expo Go app
- **iOS:** The Camera app

**Important:** Your phone and computer must be on the same Wi-Fi network.

### Terminal 3 — Admin Dashboard

```bash
cd admin
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

---

## Demo Credentials

After running `npm run seed`, these accounts are created:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civic.com | admin123 |
| Citizen | citizen@civic.com | citizen123 |

You can also register a new citizen account directly from the mobile app.

---

## API Reference

All APIs are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new citizen |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | JWT | Current user profile |

### Reports

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/reports` | JWT | Create a report (multipart with photo) |
| GET | `/reports/nearby` | JWT | Reports within a radius |
| GET | `/reports/feed` | JWT | Community feed (recent or popular) |
| GET | `/reports/my` | JWT | Current user's reports |
| GET | `/reports` | Admin | All reports with filters |
| GET | `/reports/:id` | JWT | Single report details |
| PATCH | `/reports/:id/status` | Admin | Update report status |
| DELETE | `/reports/:id` | Admin | Delete a report |
| POST | `/reports/:id/upvote` | JWT | Upvote a report |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users/me/stats` | JWT | Points, badges, and stats |
| GET | `/users/leaderboard` | JWT | Top citizens by points |
| GET | `/users/:id` | JWT | Public user profile |

### Announcements

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/announcements` | Admin | Create announcement |
| GET | `/announcements` | JWT | List active announcements |
| DELETE | `/announcements/:id` | Admin | Delete announcement |

### Authorities

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/authorities` | JWT | List municipal zones |
| GET | `/authorities/locate` | JWT | Find zone for a coordinate |
| POST | `/authorities` | Admin | Create a new zone |

---

## Core Algorithms

### 1. Geospatial Auto-Routing

Every municipal zone is stored as a GeoJSON polygon with a 2dsphere index. When a report comes in, the backend finds which zone contains its coordinates:

```javascript
const authority = await Authority.findOne({
  boundary: {
    $geoIntersects: {
      $geometry: { type: 'Point', coordinates: [lng, lat] }
    }
  }
});
```

### 2. Duplicate Detection

Before creating a new report, the backend checks for a similar report within 15 meters:

```javascript
const duplicate = await Report.findOne({
  category,
  status: { $in: ['submitted', 'assigned', 'in_progress'] },
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: 15  // meters
    }
  }
});
```

If a match is found, the new submission is merged as an upvote instead of creating a duplicate ticket.

### 3. Real-Time Sync

Socket.io broadcasts events to targeted rooms:

```javascript
io.to(`user:${report.reporterId}`).emit('report:updated', report);
io.to('admins').emit('report:updated', report);
```

Events: `report:new`, `report:updated`, `report:deleted`, `announcement:new`.

---

## Testing

### Unit Tests (Postman)

Import the Postman collection from `docs/postman_collection.json` and run the requests in order. Test coverage:

| Category | Count | Pass Rate |
|----------|-------|-----------|
| Unit | 24 | 100% |
| Integration | 12 | 100% |
| User Acceptance | 8 | 100% |
| Non-Functional | 6 | 100% |

### Manual End-to-End Test

1. Log in as `citizen@civic.com` on the mobile app
2. Tap the map to drop a pin
3. Fill in the report form, attach a photo, submit
4. Open the admin dashboard at http://localhost:3000
5. Log in as `admin@civic.com`
6. The new report appears on the map and in the sidebar **in real time**
7. Click the report → change status to "In Progress"
8. Switch back to the mobile app → badge updates within 2 seconds

---

## Deployment

### Backend on Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `node src/server.js`
7. Add environment variables from your `.env` file
8. Deploy

### Admin Dashboard on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your repository
3. Set root directory to `admin`
4. Framework preset: **Vite**
5. Add environment variables `VITE_API_URL` and `VITE_SOCKET_URL` pointing to your Render URL
6. Deploy

### Mobile App

For a standalone build:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

This produces an APK you can install on any Android device.

---

## Future Scope

- **Offline support** — Queue reports locally and sync when connectivity returns
- **Push notifications** — Firebase Cloud Messaging for status updates
- **Field worker role** — Assign tickets to specific workers who mark them resolved on-site
- **Multilingual support** — Kannada, Hindi, Tamil, and other regional languages
- **Hotspot heatmaps** — Visualize recurring problem areas for city planning
- **Cost tracking** — Attach cost estimates and budgets to tickets
- **Municipal ERP integration** — Sync with existing government systems

---

## Authors

- Rupam Nitin Patil — [GitHub](https://github.com/rupamnpatil)


---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

It was built as an academic capstone project and is free to use, modify, and extend for educational purposes.

---

## Acknowledgments

- OpenStreetMap contributors for map tiles
- Photon (Komoot) for the free geocoding service
- MongoDB, Cloudinary, Render, and Vercel for their generous free tiers
- The React Native and Leaflet open-source communities