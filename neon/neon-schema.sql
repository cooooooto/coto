-- Schema para Neon Database (sin dependencias de Supabase Auth)
-- Ejecuta este script en tu consola de Neon

-- Create profiles table for user management (sin referencia a auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  password_hash VARCHAR(255), -- Para NextAuth
  role VARCHAR(20) CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) CHECK (status IN ('To-Do', 'In-Progress', 'Done')) NOT NULL DEFAULT 'To-Do',
  phase VARCHAR(10) CHECK (phase IN ('DEV', 'INT', 'PRE', 'PROD')) NOT NULL DEFAULT 'DEV',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  requires_approval BOOLEAN DEFAULT TRUE,
  current_transition_id UUID,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table for collaboration
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create phase transitions table for approval workflow
CREATE TABLE IF NOT EXISTS phase_transitions (
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

-- Add foreign key constraint for current_transition_id
ALTER TABLE projects ADD CONSTRAINT fk_projects_current_transition 
  FOREIGN KEY (current_transition_id) REFERENCES phase_transitions(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_transition ON projects(current_transition_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_project_status ON phase_transitions(project_id, status);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_pending ON phase_transitions(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_phase_transitions_requested_by ON phase_transitions(requested_by);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_approved_by ON phase_transitions(approved_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (opcional)
INSERT INTO profiles (email, full_name, role) VALUES 
  ('admin@ejemplo.com', 'Administrador', 'admin'),
  ('usuario@ejemplo.com', 'Usuario Demo', 'member')
ON CONFLICT (email) DO NOTHING;

-- Insert sample project (opcional)
INSERT INTO projects (name, description, deadline, status, phase, progress, owner_id) 
SELECT 
  'Proyecto Demo',
  'Proyecto de ejemplo para probar la migración a Neon',
  NOW() + INTERVAL '30 days',
  'In-Progress',
  'DEV',
  25,
  profiles.id
FROM profiles 
WHERE profiles.email = 'admin@ejemplo.com'
ON CONFLICT DO NOTHING;
