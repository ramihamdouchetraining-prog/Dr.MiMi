import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  AlertOctagon,
  Clock,
  Database,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

// Types
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
    processes: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    cached: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    status: 'online' | 'offline' | 'degraded';
    latency: number;
    bandwidth: {
      download: number;
      upload: number;
    };
    requests: {
      total: number;
      failed: number;
      avgResponseTime: number;
    };
  };
}

interface APIHealth {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  uptime: number;
  errors24h: number;
}

interface BackupStatus {
  lastBackup: string;
  nextScheduled: string;
  size: number;
  status: 'success' | 'failed' | 'in_progress';
  backupType: 'full' | 'incremental';
  retention: number;
}

interface SecurityMetrics {
  failedLogins: {
    count: number;
    lastAttempt: string;
    topIPs: Array<{ ip: string; attempts: number }>;
  };
  suspiciousActivities: Array<{
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    userId?: string;
  }>;
  lastUpdate: string;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  certificates: Array<{
    domain: string;
    expiresIn: number;
    status: 'valid' | 'expiring' | 'expired';
  }>;
}

interface ErrorLog {
  id: string;
  statusCode: number;
  path: string;
  message: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  stack?: string;
}

interface SystemUpdate {
  id: string;
  package: string;
  currentVersion: string;
  latestVersion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'security' | 'feature' | 'bugfix';
}

// Utility functions
const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
  if (value <= thresholds.good) return 'text-green-600';
  if (value <= thresholds.warning) return 'text-yellow-600';
  return 'text-red-600';
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Components
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'critical';
  trend?: number;
}> = ({ title, value, subtitle, icon, status = 'good', trend }) => {
  const statusColors = {
    good: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    critical: 'from-red-500 to-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 bg-gradient-to-br ${statusColors[status]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center ${trend > 0 ? 'text-white/80' : 'text-white/80'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="ml-1 text-sm font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-white/80 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
    </motion.div>
  );
};

const PlatformHealth: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'api' | 'security' | 'backups' | 'errors'>('system');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Check permissions - Only owner can access
  const hasAccess = userRole === 'owner';

  // Fetch system metrics
  const { data: systemMetrics, refetch: refetchSystem } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/health/system', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch system metrics');
      return response.json();
    },
    enabled: hasAccess,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Fetch API health
  const { data: apiHealth } = useQuery({
    queryKey: ['apiHealth'],
    queryFn: async () => {
      const response = await fetch('/api/health/endpoints', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch API health');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'api',
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Fetch security metrics
  const { data: securityMetrics } = useQuery({
    queryKey: ['securityMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/health/security', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch security metrics');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'security',
    refetchInterval: autoRefresh ? 60000 : false // Refresh every minute
  });

  // Fetch backup status
  const { data: backupStatus } = useQuery({
    queryKey: ['backupStatus'],
    queryFn: async () => {
      const response = await fetch('/api/health/backups', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch backup status');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'backups'
  });

  // Fetch error logs
  const { data: errorLogs } = useQuery({
    queryKey: ['errorLogs'],
    queryFn: async () => {
      const response = await fetch('/api/health/errors?limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch error logs');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'errors'
  });

  // Performance history for charts
  const { data: performanceHistory } = useQuery({
    queryKey: ['performanceHistory'],
    queryFn: async () => {
      const response = await fetch('/api/health/performance-history', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch performance history');
      return response.json();
    },
    enabled: hasAccess
  });

  // Calculate overall health score
  const calculateHealthScore = () => {
    if (!systemMetrics) return 0;
    
    let score = 100;
    
    // CPU penalty
    if (systemMetrics.cpu.usage > 80) score -= 20;
    else if (systemMetrics.cpu.usage > 60) score -= 10;
    
    // Memory penalty
    if (systemMetrics.memory.percentage > 90) score -= 20;
    else if (systemMetrics.memory.percentage > 70) score -= 10;
    
    // Disk penalty
    if (systemMetrics.disk.percentage > 90) score -= 15;
    else if (systemMetrics.disk.percentage > 80) score -= 5;
    
    // Network penalty
    if (systemMetrics.network.status === 'offline') score -= 50;
    else if (systemMetrics.network.status === 'degraded') score -= 25;
    
    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();
  const healthStatus = healthScore >= 80 ? 'good' : healthScore >= 60 ? 'warning' : 'critical';

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Accès Refusé
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Cette section est réservée au propriétaire de la plateforme.
        </p>
      </div>
    );
  }

  const diskData = systemMetrics ? [
    { name: 'Utilisé', value: systemMetrics.disk.used, color: '#FF6B6B' },
    { name: 'Disponible', value: systemMetrics.disk.total - systemMetrics.disk.used, color: '#4ECDC4' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-8 h-8 mr-3 text-red-600" />
              Platform Health
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitoring système et sécurité en temps réel
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-lg font-bold text-white ${
              healthStatus === 'good' ? 'bg-green-600' :
              healthStatus === 'warning' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              Score: {healthScore}/100
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 border rounded-lg ${autoRefresh ? 'bg-green-100 border-green-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin text-green-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6 border-b overflow-x-auto">
          {['system', 'api', 'security', 'backups', 'errors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 px-1 capitalize whitespace-nowrap ${
                activeTab === tab ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'
              }`}
            >
              {tab === 'system' && <Server className="w-4 h-4 inline mr-2" />}
              {tab === 'api' && <Wifi className="w-4 h-4 inline mr-2" />}
              {tab === 'security' && <Shield className="w-4 h-4 inline mr-2" />}
              {tab === 'backups' && <Database className="w-4 h-4 inline mr-2" />}
              {tab === 'errors' && <AlertTriangle className="w-4 h-4 inline mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* System Metrics Tab */}
      {activeTab === 'system' && systemMetrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="CPU Usage"
              value={`${systemMetrics.cpu.usage.toFixed(1)}%`}
              subtitle={`${systemMetrics.cpu.cores} cores • ${systemMetrics.cpu.processes} processes`}
              icon={<Cpu className="w-6 h-6 text-white" />}
              status={systemMetrics.cpu.usage > 80 ? 'critical' : systemMetrics.cpu.usage > 60 ? 'warning' : 'good'}
              trend={-5}
            />
            <MetricCard
              title="Memory"
              value={`${systemMetrics.memory.percentage.toFixed(1)}%`}
              subtitle={`${formatBytes(systemMetrics.memory.used)} / ${formatBytes(systemMetrics.memory.total)}`}
              icon={<MemoryStick className="w-6 h-6 text-white" />}
              status={systemMetrics.memory.percentage > 90 ? 'critical' : systemMetrics.memory.percentage > 70 ? 'warning' : 'good'}
              trend={3}
            />
            <MetricCard
              title="Disk Usage"
              value={`${systemMetrics.disk.percentage.toFixed(1)}%`}
              subtitle={`${formatBytes(systemMetrics.disk.used)} / ${formatBytes(systemMetrics.disk.total)}`}
              icon={<HardDrive className="w-6 h-6 text-white" />}
              status={systemMetrics.disk.percentage > 90 ? 'critical' : systemMetrics.disk.percentage > 80 ? 'warning' : 'good'}
              trend={1}
            />
            <MetricCard
              title="Network"
              value={systemMetrics.network.status}
              subtitle={`Latency: ${systemMetrics.network.latency}ms`}
              icon={systemMetrics.network.status === 'online' ? <Wifi className="w-6 h-6 text-white" /> : <WifiOff className="w-6 h-6 text-white" />}
              status={systemMetrics.network.status === 'online' ? 'good' : systemMetrics.network.status === 'degraded' ? 'warning' : 'critical'}
            />
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Performance History
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#FF6B6B" name="CPU %" strokeWidth={2} />
                  <Line type="monotone" dataKey="memory" stroke="#4ECDC4" name="Memory %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Disk Usage Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Disk Usage Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={diskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatBytes(entry.value)}`}
                  >
                    {diskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatBytes(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Network Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Download Speed</span>
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xl font-bold">{systemMetrics.network.bandwidth.download.toFixed(2)} Mbps</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Upload Speed</span>
                  <Upload className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xl font-bold">{systemMetrics.network.bandwidth.upload.toFixed(2)} Mbps</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xl font-bold">{systemMetrics.network.requests.total.toLocaleString()}</p>
                <p className="text-xs text-red-600">{systemMetrics.network.requests.failed} failed</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* API Health Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* API Endpoints Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                API Endpoints Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Errors (24h)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Checked
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(apiHealth || []).map((endpoint: APIHealth) => (
                    <tr key={endpoint.endpoint} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {endpoint.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          endpoint.status === 'healthy' ? 'bg-green-100 text-green-800' :
                          endpoint.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {endpoint.status === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {endpoint.status === 'degraded' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {endpoint.status === 'down' && <XCircle className="w-3 h-3 mr-1" />}
                          {endpoint.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        endpoint.responseTime > 1000 ? 'text-red-600' :
                        endpoint.responseTime > 500 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {endpoint.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {endpoint.uptime.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {endpoint.errors24h}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(endpoint.lastChecked).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && securityMetrics && (
        <div className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Failed Logins</span>
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {securityMetrics.failedLogins.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last: {new Date(securityMetrics.failedLogins.lastAttempt).toLocaleTimeString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Vulnerabilities</span>
                <AlertOctagon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex space-x-2">
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                  {securityMetrics.vulnerabilities.critical} Critical
                </span>
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                  {securityMetrics.vulnerabilities.high} High
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">SSL Certificates</span>
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {securityMetrics.certificates.filter(c => c.status === 'valid').length} Valid
              </p>
              <p className="text-xs text-orange-600">
                {securityMetrics.certificates.filter(c => c.status === 'expiring').length} Expiring Soon
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(securityMetrics.lastUpdate).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Suspicious Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Activités Suspectes Récentes
            </h3>
            <div className="space-y-3">
              {securityMetrics.suspiciousActivities.map(activity => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(activity.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{activity.type}</h4>
                      <p className="text-sm mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(activity.timestamp).toLocaleString()}
                        {activity.userId && ` • User: ${activity.userId}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(activity.severity)}`}>
                      {activity.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Failed Login IPs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Top IPs - Tentatives de Connexion Échouées
            </h3>
            <div className="space-y-2">
              {securityMetrics.failedLogins.topIPs.map(ip => (
                <div key={ip.ip} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-mono text-sm">{ip.ip}</span>
                  <span className="text-red-600 font-bold">{ip.attempts} attempts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && backupStatus && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Backup Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Last Backup</span>
                  <span className="font-medium">{new Date(backupStatus.lastBackup).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Next Scheduled</span>
                  <span className="font-medium">{new Date(backupStatus.nextScheduled).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Backup Size</span>
                  <span className="font-medium">{formatBytes(backupStatus.size)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium capitalize">{backupStatus.backupType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Retention</span>
                  <span className="font-medium">{backupStatus.retention} days</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className={`text-center p-8 rounded-lg ${
                  backupStatus.status === 'success' ? 'bg-green-50 text-green-600' :
                  backupStatus.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {backupStatus.status === 'success' && <CheckCircle className="w-16 h-16 mx-auto mb-2" />}
                  {backupStatus.status === 'in_progress' && <RefreshCw className="w-16 h-16 mx-auto mb-2 animate-spin" />}
                  {backupStatus.status === 'failed' && <XCircle className="w-16 h-16 mx-auto mb-2" />}
                  <p className="text-lg font-semibold capitalize">{backupStatus.status}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Trigger Manual Backup
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                View Backup History
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Restore from Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Logs Tab */}
      {activeTab === 'errors' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Error Logs
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(errorLogs || []).map((error: ErrorLog) => (
                  <tr key={error.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        error.statusCode >= 500 ? 'bg-red-100 text-red-800' :
                        error.statusCode >= 400 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {error.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                        {error.path}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {error.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformHealth;