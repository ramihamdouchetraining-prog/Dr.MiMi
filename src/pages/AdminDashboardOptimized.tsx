import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  Users,
  FileText,
  DollarSign,
  Package,
  Activity,
  MessageSquare,
  Megaphone,
  Route,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AdvancedAnalytics from '../components/dashboard/AdvancedAnalytics';
import ContentManagementHub from '../components/dashboard/ContentManagementHub';
import SupportTickets from '../components/dashboard/SupportTickets';
import PlatformHealth from '../components/dashboard/PlatformHealth';
import CommunicationsCenter from '../components/dashboard/CommunicationsCenter';
import LearningPaths from '../components/dashboard/LearningPaths';

// Types
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  revenue: number;
  growth: number;
  tickets: number;
}

// API fonctions
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/admin/dashboard-stats', {
    credentials: 'include'
  });
  if (!response.ok) {
    // Retourner des données mockées si l'API échoue (temporaire)
    return {
      totalUsers: 1250,
      activeUsers: 856,
      totalContent: 342,
      revenue: 125000,
      growth: 18,
      tickets: 12
    };
  }
  return response.json();
};

const AdminDashboardOptimized: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Quick stats cards
  const quickStats = [
    {
      title: 'Utilisateurs Actifs',
      value: stats?.activeUsers || 0,
      change: '+12%',
      icon: <Users size={20} />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Contenu Total',
      value: stats?.totalContent || 0,
      change: '+23%',
      icon: <FileText size={20} />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'Revenus (Mois)',
      value: `${stats?.revenue || 0} DZD`,
      change: '+18%',
      icon: <DollarSign size={20} />,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Tickets Support',
      value: stats?.tickets || 0,
      change: '-5%',
      icon: <MessageSquare size={20} />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  // Dashboard sections
  const sections = [
    {
      id: 'analytics',
      title: 'Analytics Avancées',
      icon: <BarChart3 size={24} />,
      component: AdvancedAnalytics,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'content',
      title: 'Gestion de Contenu',
      icon: <Package size={24} />,
      component: ContentManagementHub,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'support',
      title: 'Tickets de Support',
      icon: <MessageSquare size={24} />,
      component: SupportTickets,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'platform',
      title: 'Santé Plateforme',
      icon: <Activity size={24} />,
      component: PlatformHealth,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'communications',
      title: 'Communications',
      icon: <Megaphone size={24} />,
      component: CommunicationsCenter,
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'learning',
      title: "Parcours d'Apprentissage",
      icon: <Route size={24} />,
      component: LearningPaths,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre plateforme médicale</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Section Grid - Compact View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedSection(section.id)}
          >
            <div className={`h-2 bg-gradient-to-r ${section.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color} text-white`}>
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              
              {/* Mini Preview */}
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Cliquez pour voir les détails</p>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock size={14} />
                  Mis à jour il y a 5 min
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={14} />
                  Actif
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for Selected Section */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedSection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sections.find(s => s.id === selectedSection)?.icon}
                    <h2 className="text-2xl font-bold">
                      {sections.find(s => s.id === selectedSection)?.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedSection(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Modal Content with Scrolling */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] custom-scrollbar">
                {(() => {
                  const section = sections.find(s => s.id === selectedSection);
                  if (section) {
                    const Component = section.component;
                    return <Component userRole="admin" />;
                  }
                  return null;
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} />
          Activité Récente
        </h3>
        <div className="space-y-3">
          {[
            { user: 'Sarah M.', action: 'a complété', target: 'Quiz Cardiologie', time: 'Il y a 2 min' },
            { user: 'Ahmed B.', action: 's\'est inscrit à', target: 'Module Neurologie', time: 'Il y a 15 min' },
            { user: 'Fatima L.', action: 'a téléchargé', target: 'Résumé Anatomie', time: 'Il y a 1 heure' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {activity.user[0]}
                </div>
                <div>
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-600"> {activity.action} </span>
                  <span className="font-medium text-purple-600">{activity.target}</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOptimized;

// Custom scrollbar styles
const scrollbarStyles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ec4899, #8b5cf6);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #d946a6, #7c3aed);
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}