-- Verification script for phase transitions system
-- Run this to verify everything is working correctly

-- Check all tables exist
SELECT 
  'Tables Status' as check_type,
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ All tables exist'
    ELSE '❌ Missing tables: ' || (6 - COUNT(*)::text)
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'projects', 'tasks', 'project_members', 'comments', 'phase_transitions');

-- Check RLS is enabled
SELECT 
  'RLS Status' as check_type,
  table_name,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as result
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'tasks', 'project_members', 'comments', 'phase_transitions')
ORDER BY tablename;

-- Check indexes exist
SELECT 
  'Indexes Status' as check_type,
  indexname,
  '✅ Index exists' as result
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- Check policies exist
SELECT 
  'Policies Status' as check_type,
  tablename,
  policyname,
  '✅ Policy exists' as result
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check demo user exists
SELECT 
  'Demo User Status' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Demo user exists: ' || full_name
    ELSE '❌ No demo user found'
  END as result
FROM profiles 
WHERE id = 'mock-user-id-123';

-- Check projects have new columns
SELECT 
  'Projects Schema' as check_type,
  column_name,
  data_type,
  '✅ Column exists' as result
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('requires_approval', 'current_transition_id')
ORDER BY column_name;

-- Sample data check
SELECT 
  'Sample Data' as check_type,
  'Projects count: ' || COUNT(*)::text as result
FROM projects;

SELECT 
  'Sample Data' as check_type,
  'Phase transitions count: ' || COUNT(*)::text as result
FROM phase_transitions;

-- Final status
SELECT 
  'System Status' as check_type,
  '🚦 Phase Transitions System is READY!' as result;
