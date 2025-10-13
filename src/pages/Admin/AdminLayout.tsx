import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Crown,
  ChevronRight,
  Sparkles,
  Heart,
  BookOpen
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../config/api';


interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  permission?: string;
  badge?: string;
  children?: NavItem[];
}

const AdminLayout: React.FC = () => {
  const { isFeminine, isMagical } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is admin
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['adminCheck'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/admin/check'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Not authorized');
      return response.json();
    },
    retry: false
  });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location, isMobile]);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !adminData?.isAdmin) {
      navigate('/');
    }
  }, [adminData, isLoading, navigate]);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin'
    },
    {
      id: 'content',
      title: 'Content',
      icon: <FileText className="w-5 h-5" />,
      children: [
        {
          id: 'articles',
          title: 'Articles',
          icon: <FileText className="w-4 h-4" />,
          href: '/admin/articles',
          permission: 'manage_content'
        },
        {
          id: 'courses',
          title: 'Courses',
          icon: <BookOpen className="w-4 h-4" />,
          href: '/admin/courses',
          permission: 'manage_content'
        },
        {
          id: 'cms',
          title: 'CMS Editor',
          icon: <FileText className="w-4 h-4" />,
          href: '/admin/cms',
          permission: 'manage_content'
        }
      ]
    },
    {
      id: 'users',
      title: 'Users',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/users',
      permission: 'manage_users',
      badge: adminData?.role === 'owner' ? 'Full' : undefined
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/admin/analytics',
      permission: 'view_analytics'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings',
      permission: 'manage_settings'
    }
  ];

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return adminData?.permissions?.includes(permission) || false;
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleLogout = () => {
    // Clear session and redirect
    fetch(getApiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' })
      .then(() => navigate('/'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = location.pathname === item.href;
    const isExpanded = expandedItems.includes(item.id);
    const canAccess = hasPermission(item.permission);

    if (!canAccess) return null;

    if (item.children) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpand(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
              depth > 0 ? 'ml-4' : ''
            } hover:bg-white/10`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {item.children.map(child => renderNavItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.href!}
        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
          depth > 0 ? 'ml-4' : ''
        } ${
          isActive
            ? 'bg-white/20 shadow-lg'
            : 'hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.title}</span>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 text-xs bg-yellow-400 text-gray-800 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b ${
              isFeminine
                ? 'from-pink-600 via-purple-600 to-indigo-600'
                : 'from-purple-700 via-indigo-700 to-blue-700'
            } text-white shadow-2xl z-40 overflow-y-auto`}
          >
            {/* Admin Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center gap-3 mb-4">
                {adminData?.role === 'owner' ? (
                  <Crown className="w-8 h-8 text-yellow-400" />
                ) : (
                  <Shield className="w-8 h-8 text-blue-300" />
                )}
                <div>
                  <h2 className="text-xl font-bold">Admin Panel</h2>
                  <p className="text-sm opacity-75 capitalize">{adminData?.role}</p>
                </div>
              </div>
              {isMagical && (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute top-4 right-4"
                >
                  <Heart className="w-6 h-6 text-pink-300 fill-current" />
                </motion.div>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navItems.map(item => renderNavItem(item))}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">
                    {adminData?.firstName} {adminData?.lastName}
                  </p>
                  <p className="text-xs opacity-75">{adminData?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-72' : ''
      } p-6`}>
        <div className="max-w-7xl mx-auto">
          {isMagical && (
            <div className="fixed top-10 right-10 pointer-events-none">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="w-24 h-24 text-purple-400/30" />
              </motion.div>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;