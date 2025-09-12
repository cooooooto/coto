-- Test script for phase transitions system
-- This creates sample data to test the semaphore functionality

BEGIN;

-- Create a test project (only if no projects exist)
INSERT INTO projects (name, description, deadline, status, phase, progress, requires_approval, owner_id)
SELECT 
  'Proyecto de Prueba - E-commerce',
  'Proyecto de prueba para demostrar el sistema de semáforos de control',
  NOW() + INTERVAL '30 days',
  'In-Progress',
  'DEV',
  25,
  true,
  'mock-user-id-123'
WHERE NOT EXISTS (SELECT 1 FROM projects);

-- Create some sample tasks for the test project
INSERT INTO tasks (project_id, name, completed, assigned_to)
SELECT 
  p.id,
  task_name,
  task_completed,
  'mock-user-id-123'
FROM projects p,
(VALUES 
  ('Configurar base de datos', true),
  ('Implementar autenticación', true),
  ('Crear API REST', false),
  ('Diseñar interfaz de usuario', false),
  ('Escribir tests unitarios', false)
) AS t(task_name, task_completed)
WHERE p.name = 'Proyecto de Prueba - E-commerce'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE project_id = p.id);

-- Create a sample phase transition request
INSERT INTO phase_transitions (project_id, from_phase, to_phase, status, requested_by, comment, requested_at)
SELECT 
  p.id,
  'DEV',
  'INT',
  'pending',
  'mock-user-id-123',
  'Funcionalidades básicas completadas. Listo para integración con tests automatizados.',
  NOW()
FROM projects p
WHERE p.name = 'Proyecto de Prueba - E-commerce'
AND NOT EXISTS (
  SELECT 1 FROM phase_transitions 
  WHERE project_id = p.id AND status = 'pending'
);

-- Update the project to reference the transition
UPDATE projects 
SET current_transition_id = (
  SELECT pt.id 
  FROM phase_transitions pt 
  WHERE pt.project_id = projects.id 
  AND pt.status = 'pending' 
  LIMIT 1
)
WHERE name = 'Proyecto de Prueba - E-commerce'
AND current_transition_id IS NULL;

COMMIT;

-- Verification queries
SELECT 
  '🎯 TEST DATA CREATED' as status,
  'Project: ' || name as project_name,
  'Phase: ' || phase as current_phase,
  'Status: ' || status as project_status,
  'Progress: ' || progress::text || '%' as progress
FROM projects 
WHERE name = 'Proyecto de Prueba - E-commerce';

SELECT 
  '📋 TASKS CREATED' as status,
  name as task_name,
  CASE WHEN completed THEN '✅ Completed' ELSE '⏳ Pending' END as task_status
FROM tasks 
WHERE project_id = (SELECT id FROM projects WHERE name = 'Proyecto de Prueba - E-commerce');

SELECT 
  '🚦 TRANSITION CREATED' as status,
  from_phase || ' → ' || to_phase as transition,
  status as transition_status,
  comment as request_comment,
  requested_at::date as requested_date
FROM phase_transitions 
WHERE project_id = (SELECT id FROM projects WHERE name = 'Proyecto de Prueba - E-commerce');

SELECT '✅ Test data created successfully! You can now test the phase transitions semaphore.' as final_message;
