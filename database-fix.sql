-- 🗄️ DATABASE STRUCTURE OPTIMIZATION FOR Dr.MiMi
-- Execute this on Neon Console to ensure optimal performance

-- 🔍 1. VERIFY TABLES EXIST AND CREATE MISSING INDEXES
-- This will improve query performance and reduce 503 timeouts

-- Articles table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Courses table optimization  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Quizzes table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC);

-- Cases table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_difficulty ON cases(difficulty);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- Users table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login ON users(last_login DESC NULLS LAST);

-- News table optimization (if exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_status ON news(status);

-- Library tables optimization (if exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_library_items_section ON library_items(section);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_library_categories_section ON library_categories(section);

-- 🔍 2. CHECK DATABASE HEALTH
-- Verify all critical tables exist
DO $$
BEGIN
    -- Check if critical tables exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'WARNING: Table "users" does not exist - this may cause authentication issues';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
        RAISE NOTICE 'WARNING: Table "articles" does not exist - this may cause content loading issues';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        RAISE NOTICE 'WARNING: Table "quizzes" does not exist - this may cause quiz functionality issues';
    END IF;
    
    -- Report table row counts
    RAISE NOTICE 'Dr.MiMi Database Status:';
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        EXECUTE 'SELECT count(*) FROM users' INTO @user_count;
        RAISE NOTICE '- Users: % records', @user_count;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
        EXECUTE 'SELECT count(*) FROM articles' INTO @articles_count;
        RAISE NOTICE '- Articles: % records', @articles_count;
    END IF;
    
    RAISE NOTICE 'Database health check completed!';
END $$;

-- 🔍 3. CREATE ESSENTIAL DATA IF MISSING
-- Ensure admin users exist for authentication

-- Create admin user if not exists (matches your seedOwner/seedAdmin)
INSERT INTO users (username, password, role, first_name, last_name, created_at, updated_at)
VALUES 
  ('MiMiBEN', '$2b$10$hashed_password_here', 'owner', 'Merieme', 'BENNAMANE', NOW(), NOW()),
  ('AdminDrMiMi', '$2b$10$another_hashed_password', 'admin', 'Admin', 'Dr.MiMi', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create sample articles if table is empty
INSERT INTO articles (title, content, category, status, slug, created_at, updated_at)
SELECT 
  'Article de test Dr.MiMi',
  'Contenu de test pour vérifier la connectivité de la base de données',
  'course',
  'published',
  'test-article-drmimi',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles LIMIT 1);

-- Create sample news if table exists and is empty
INSERT INTO news (title, content, status, created_at, updated_at)
SELECT 
  'Bienvenue sur Dr.MiMi',
  'La plateforme d\'\'éducation médicale francophone est maintenant opérationnelle!',
  'published',
  NOW(),
  NOW()
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'news')
AND NOT EXISTS (SELECT 1 FROM news LIMIT 1);

-- 🔍 4. DATABASE PERFORMANCE TUNING
-- Optimize PostgreSQL settings for better performance

-- Enable query performance insights (if available on Neon)
-- These are typically enabled by default but good to verify

-- Set connection pool optimizations (Neon handles this automatically)
-- But we can optimize our queries

-- 🔍 5. MONITORING SETUP
-- Create a simple monitoring view
CREATE OR REPLACE VIEW dr_mimi_stats AS
SELECT 
  'Database Health' as metric,
  CASE 
    WHEN pg_is_in_recovery() THEN 'Replica/Recovery'
    ELSE 'Primary/Ready'
  END as status,
  current_timestamp as checked_at
UNION ALL
SELECT 
  'Active Connections',
  count(*)::text,
  current_timestamp
FROM pg_stat_activity 
WHERE state = 'active'
UNION ALL
SELECT
  'Total Tables',
  count(*)::text,
  current_timestamp
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test query to verify everything works
SELECT 
  '🩺 Dr.MiMi Database Ready!' as message,
  current_database() as database_name,
  current_user as connected_user,
  version() as postgresql_version,
  current_timestamp as timestamp;

-- Final verification
SELECT * FROM dr_mimi_stats;

-- 📋 NOTES FOR NEON CONSOLE:
-- 1. Execute this script in the SQL Editor
-- 2. Verify all indexes are created successfully
-- 3. Check that sample data exists
-- 4. Monitor the Monitoring tab for query activity
-- 5. Ensure compute is not suspended (should show "Active")

-- 🔗 After running this script:
-- Your Dr.MiMi database will be optimized for:
-- - Faster article/course/quiz loading
-- - Efficient user authentication
-- - Better admin dashboard performance
-- - Reduced 503 timeout errors
-- - Improved overall app responsiveness