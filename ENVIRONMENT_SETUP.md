# Environment Setup Guide

## Fix for "Error fetching projects: TypeError: fetch failed"

This error occurs because the Supabase environment variables are not configured. Follow these steps to fix it:

### Step 1: Create Environment File

Create a file named `.env.local` in the project root with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to **Settings > API**
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Setup Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the content from `supabase/schema.sql`
3. Click **Run** to create the tables

### Step 4: Restart Development Server

```bash
npm run dev
```

## What was fixed:

1. ✅ Updated `SupabaseService` to use `supabaseAdmin` client for server-side operations
2. ✅ Added proper error handling for missing environment variables
3. ✅ Created this setup guide

## Troubleshooting

- **"Invalid API key"**: Check that environment variables are correct
- **"relation does not exist"**: Run the SQL schema in Supabase
- **Still getting fetch errors**: Restart your development server after setting up .env.local
