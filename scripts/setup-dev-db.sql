-- Configuración inicial para base de datos de desarrollo
-- Este script debe ejecutarse en la nueva DB de desarrollo

-- Usar el esquema existente del archivo supabase/schema.sql
-- pero con datos de prueba en lugar de datos reales

-- Primero, ejecutar todo el contenido de supabase/schema.sql
-- Luego, poblar con datos de prueba:

-- Insertar usuarios de prueba (después de crear perfiles via auth)
INSERT INTO profiles (id, email, full_name, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@test.dev', 'Admin Test User', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user@test.dev', 'Regular Test User', 'member'),
  ('00000000-0000-0000-0000-000000000003', 'viewer@test.dev', 'Viewer Test User', 'viewer');

-- Proyectos de prueba
INSERT INTO projects (id, name, description, deadline, status, phase, progress, owner_id) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Proyecto Test 1', 'Descripción del proyecto de prueba 1', '2025-12-31', 'In-Progress', 'DEV', 45, '00000000-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222222', 'Proyecto Test 2', 'Descripción del proyecto de prueba 2', '2025-11-30', 'To-Do', 'DEV', 0, '00000000-0000-0000-0000-000000000002'),
  ('33333333-3333-3333-3333-333333333333', 'Proyecto Test 3', 'Descripción del proyecto de prueba 3', '2025-10-15', 'Done', 'PROD', 100, '00000000-0000-0000-0000-000000000001');

-- Tareas de prueba
INSERT INTO tasks (project_id, name, completed, assigned_to) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Tarea de desarrollo 1', false, '00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', 'Tarea de desarrollo 2', true, '00000000-0000-0000-0000-000000000002'),
  ('22222222-2222-2222-2222-222222222222', 'Tarea de análisis', false, '00000000-0000-0000-0000-000000000002');

-- Miembros del proyecto
INSERT INTO project_members (project_id, user_id, role) VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'member'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'admin');

-- Comentarios de prueba
INSERT INTO comments (project_id, user_id, content) VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Este es un comentario de prueba para desarrollo'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Otro comentario para testing');
