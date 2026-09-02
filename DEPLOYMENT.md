# Deployment Guide

## Overview

This application is deployed using:
- **Frontend**: Vercel
- **Backend**: Render  
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage

## Current Issue: "Could not load vacancies"

### Root Cause
The frontend doesn't know where the backend API is hosted. The environment variable `VITE_API_URL` is not set in Vercel.

### Solution

#### 1. Get Your Backend URL
Go to your Render dashboard and find your backend service URL. It should look like:
```
https://mentora-backend-xxxx.onrender.com
```

#### 2. Configure Vercel (Frontend)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend.onrender.com/api` (replace with your actual Render URL)
   - **Environment**: Production, Preview, Development (check all)
5. Click **Save**
6. Go to **Deployments** and click **Redeploy** on the latest deployment

#### 3. Configure Render (Backend)
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment**
4. Ensure these variables are set:
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app`
   - `DATABASE_URL` = (your Supabase connection string)
   - `JWT_SECRET` = (your JWT secret)
   - `SUPABASE_URL` = (your Supabase URL)
   - `SUPABASE_ANON_KEY` = (your Supabase anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your Supabase service role key)
   - `FILE_STORAGE` = `supabase`
   - `PORT` = `3001` (or leave default)
5. Click **Save Changes** (this will trigger a redeploy)

#### 4. Verify Deployment
After both redeploys complete:
1. Open your Vercel URL: `https://your-app.vercel.app`
2. Navigate to Browse Vacancies page
3. You should now see the vacancies loading

## CORS Configuration

Your backend is already configured to allow CORS from your frontend:

```typescript
// server/index.ts
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
```

Make sure `FRONTEND_URL` is set in Render to your Vercel URL.

## Troubleshooting

### Vacancies still not loading?

1. **Check backend is running**:
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check vacancies endpoint**:
   - Visit: `https://your-backend.onrender.com/api/tutor/vacancies`
   - Should return JSON array of vacancies (7 vacancies in your database)

3. **Check browser console**:
   - Open DevTools → Console
   - Look for CORS errors or network errors
   - Check the Network tab to see what URL it's calling

4. **Check Render logs**:
   - Go to Render dashboard → Your service → Logs
   - Look for any errors when the frontend tries to fetch vacancies

### Parent recruitment request error?

The issue we fixed earlier (foreign key constraint) happens when:
- User's account doesn't exist in the `users` table
- **Solution**: Log out and log back in to sync the user record

## Quick Reference

### Vercel Environment Variables (Frontend)
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

### Render Environment Variables (Backend)
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://your-frontend.vercel.app
FILE_STORAGE=supabase
PORT=3001
```

### Local Development
No need to set `VITE_API_URL` locally - the Vite proxy (configured in `vite.config.ts`) automatically forwards `/api/*` requests to `http://localhost:3001`.

Just run:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev
```

## Additional Notes

- Never commit `.env` file (it's in `.gitignore`)
- Use `.env.example` as a template for new developers
- Variables with `VITE_` prefix are accessible in the frontend
- Backend variables (without `VITE_`) are only accessible in Node.js
- Render free tier spins down after inactivity - first request may be slow
