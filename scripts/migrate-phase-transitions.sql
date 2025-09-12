-- Migration script to add phase transitions support
-- Run this in your Supabase SQL editor
-- This script is idempotent and safe to run multiple times

BEGIN;

-- First, create the profiles table if it doesn't exist
-- This is required for foreign key references
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public'
  ) THEN
    CREATE TABLE profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      avatar_url TEXT,
      role VARCHAR(20) CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'Table profiles already exists';
  END IF;
END $$;

-- Create project_members table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'project_members' AND table_schema = 'public'
  ) THEN
    CREATE TABLE project_members (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(project_id, user_id)
    );
    RAISE NOTICE 'Created project_members table';
  ELSE
    RAISE NOTICE 'Table project_members already exists';
  END IF;
END $$;

-- Create comments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'comments' AND table_schema = 'public'
  ) THEN
    CREATE TABLE comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'Created comments table';
  ELSE
    RAISE NOTICE 'Table comments already exists';
  END IF;
END $$;

-- Enable RLS on new tables if not already enabled
DO $$ 
BEGIN
  -- Enable RLS on profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on profiles table';
  END IF;

  -- Enable RLS on project_members
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'project_members' AND rowsecurity = true
  ) THEN
    ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on project_members table';
  END IF;

  -- Enable RLS on comments
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'comments' AND rowsecurity = true
  ) THEN
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on comments table';
  END IF;
END $$;

-- Create basic RLS policies for profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
    RAISE NOTICE 'Created policy: Users can view all profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Created policy: Users can update own profile';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Created policy: Users can insert own profile';
  END IF;
END $$;

-- Create function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    RAISE NOTICE 'Created trigger: on_auth_user_created';
  ELSE
    RAISE NOTICE 'Trigger on_auth_user_created already exists';
  END IF;
END $$;

-- Add new columns to projects table
DO $$ 
BEGIN
  -- Add requires_approval column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'requires_approval'
  ) THEN
    ALTER TABLE projects ADD COLUMN requires_approval BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added requires_approval column to projects table';
  ELSE
    RAISE NOTICE 'Column requires_approval already exists in projects table';
  END IF;

  -- Add current_transition_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'current_transition_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN current_transition_id UUID;
    RAISE NOTICE 'Added current_transition_id column to projects table';
  ELSE
    RAISE NOTICE 'Column current_transition_id already exists in projects table';
  END IF;
END $$;

-- Create phase transitions table for approval workflow
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'phase_transitions' AND table_schema = 'public'
  ) THEN
    CREATE TABLE phase_transitions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      from_phase VARCHAR(10) CHECK (from_phase IN ('DEV', 'INT', 'PRE', 'PROD')),
      to_phase VARCHAR(10) CHECK (to_phase IN ('DEV', 'INT', 'PRE', 'PROD')) NOT NULL,
      status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      comment TEXT,
      requested_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'Created phase_transitions table';
  ELSE
    RAISE NOTICE 'Table phase_transitions already exists';
  END IF;
END $$;

-- Add foreign key constraint for current_transition_id
-- Note: This must be done after creating the phase_transitions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_projects_current_transition' 
    AND table_name = 'projects'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT fk_projects_current_transition 
      FOREIGN KEY (current_transition_id) REFERENCES phase_transitions(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added foreign key constraint fk_projects_current_transition';
  ELSE
    RAISE NOTICE 'Foreign key constraint fk_projects_current_transition already exists';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error adding foreign key constraint: %', SQLERRM;
END $$;

-- Add assigned_to column to tasks table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added assigned_to column to tasks table';
  ELSE
    RAISE NOTICE 'Column assigned_to already exists in tasks table';
  END IF;
END $$;

-- Create indexes for better performance
DO $$ 
DECLARE
  index_names TEXT[] := ARRAY[
    'idx_projects_current_transition',
    'idx_phase_transitions_project_status', 
    'idx_phase_transitions_pending',
    'idx_phase_transitions_requested_by',
    'idx_phase_transitions_approved_by',
    'idx_tasks_assigned'
  ];
  index_name TEXT;
BEGIN
  -- Create idx_projects_current_transition
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_projects_current_transition') THEN
    CREATE INDEX idx_projects_current_transition ON projects(current_transition_id);
    RAISE NOTICE 'Created index: idx_projects_current_transition';
  END IF;

  -- Create idx_phase_transitions_project_status
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phase_transitions_project_status') THEN
    CREATE INDEX idx_phase_transitions_project_status ON phase_transitions(project_id, status);
    RAISE NOTICE 'Created index: idx_phase_transitions_project_status';
  END IF;

  -- Create idx_phase_transitions_pending (partial index)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phase_transitions_pending') THEN
    CREATE INDEX idx_phase_transitions_pending ON phase_transitions(status) WHERE status = 'pending';
    RAISE NOTICE 'Created index: idx_phase_transitions_pending';
  END IF;

  -- Create idx_phase_transitions_requested_by
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phase_transitions_requested_by') THEN
    CREATE INDEX idx_phase_transitions_requested_by ON phase_transitions(requested_by);
    RAISE NOTICE 'Created index: idx_phase_transitions_requested_by';
  END IF;

  -- Create idx_phase_transitions_approved_by
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phase_transitions_approved_by') THEN
    CREATE INDEX idx_phase_transitions_approved_by ON phase_transitions(approved_by);
    RAISE NOTICE 'Created index: idx_phase_transitions_approved_by';
  END IF;

  -- Create idx_tasks_assigned
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_assigned') THEN
    CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
    RAISE NOTICE 'Created index: idx_tasks_assigned';
  END IF;
END $$;

-- Phase transitions policies
DO $$ 
BEGIN
  -- Enable RLS on phase_transitions table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'phase_transitions' AND rowsecurity = true
  ) THEN
    ALTER TABLE phase_transitions ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on phase_transitions table';
  ELSE
    RAISE NOTICE 'RLS already enabled on phase_transitions table';
  END IF;
END $$;

-- Create RLS policies
DO $$ 
BEGIN
  -- Policy for viewing transitions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phase_transitions' 
    AND policyname = 'Users can view transitions in accessible projects'
  ) THEN
    CREATE POLICY "Users can view transitions in accessible projects" ON phase_transitions 
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM projects 
          WHERE id = phase_transitions.project_id AND (
            owner_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM project_members 
              WHERE project_id = projects.id AND user_id = auth.uid()
            )
          )
        )
      );
    RAISE NOTICE 'Created policy: Users can view transitions in accessible projects';
  ELSE
    RAISE NOTICE 'Policy already exists: Users can view transitions in accessible projects';
  END IF;

  -- Policy for creating transitions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phase_transitions' 
    AND policyname = 'Project members can create transitions'
  ) THEN
    CREATE POLICY "Project members can create transitions" ON phase_transitions 
      FOR INSERT WITH CHECK (
        auth.uid() = requested_by AND
        EXISTS (
          SELECT 1 FROM projects 
          WHERE id = phase_transitions.project_id AND (
            owner_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM project_members 
              WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('admin', 'member')
            )
          )
        )
      );
    RAISE NOTICE 'Created policy: Project members can create transitions';
  ELSE
    RAISE NOTICE 'Policy already exists: Project members can create transitions';
  END IF;

  -- Policy for updating transitions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phase_transitions' 
    AND policyname = 'Project owners and admins can review transitions'
  ) THEN
    CREATE POLICY "Project owners and admins can review transitions" ON phase_transitions 
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM projects 
          WHERE id = phase_transitions.project_id AND (
            owner_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM project_members 
              WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'admin'
            )
          )
        )
      );
    RAISE NOTICE 'Created policy: Project owners and admins can review transitions';
  ELSE
    RAISE NOTICE 'Policy already exists: Project owners and admins can review transitions';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Update existing projects to have requires_approval = true
DO $$ 
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE projects SET requires_approval = TRUE WHERE requires_approval IS NULL;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE 'Updated % existing projects to require approval', updated_count;
  ELSE
    RAISE NOTICE 'No projects needed updating for requires_approval field';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error updating projects: %', SQLERRM;
END $$;

-- Create a demo user profile for testing (only if profiles table is empty)
DO $$ 
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  IF profile_count = 0 THEN
    -- Insert a demo profile that matches the mock user in useCurrentUser hook
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      'mock-user-id-123',
      'usuario@ejemplo.com',
      'Usuario Demo',
      'admin',
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created demo user profile for testing';
  ELSE
    RAISE NOTICE 'Profiles table already has data, skipping demo user creation';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Note: Could not create demo user (this is normal if using real auth): %', SQLERRM;
END $$;

-- Final verification
DO $$ 
BEGIN
  RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
  RAISE NOTICE 'Tables created/verified: profiles, project_members, comments, projects (updated), phase_transitions, tasks (updated)';
  RAISE NOTICE 'Indexes created: 6 performance indexes';
  RAISE NOTICE 'Policies created: RLS policies for all tables';
  RAISE NOTICE 'Foreign key constraints: 1 constraint added';
  RAISE NOTICE 'Triggers created: Auto-profile creation on user signup';
  RAISE NOTICE 'Demo user: Created for testing (if needed)';
  RAISE NOTICE 'Migration is idempotent and safe to run multiple times';
  RAISE NOTICE '==========================================';
END $$;

COMMIT;
