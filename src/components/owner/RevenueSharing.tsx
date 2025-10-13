import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  Download,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  BarChart3,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Agreement {
  id: string;
  contractId: string;
  agreementType: string;
  owner: { id: string; firstName: string; lastName: string; email: string } | null;
  admin: { id: string; firstName: string; lastName: string; email: string } | null;
  editor: { id: string; firstName: string; lastName: string; email: string } | null;
  contract: { id: string; title: string; status: string } | null;
  ownerDefaultPercentage: string;
  adminDefaultPercentage: string;
  editorDefaultPercentage: string;
  isActive: boolean;
  tiersCount: number;
  createdAt: string;
}

interface Tier {
  id: string;
  agreementId: string;
  userId: string;
  userRole: string;
  tierLevel: number;
  percentage: string;
  isActive: boolean;
  user: { id: string; firstName: string; lastName: string; email: string; role: string } | null;
}

interface LedgerEntry {
  id: string;
  saleId: string;
  recipientId: string;
  recipientRole: string;
  shareAmount: string;
  sharePercentage: string;
  currency: string;
  contentType: string;
  contentId: string;
  contentTitle: string;
  originalAmount: string;
  payoutStatus: string;
  createdAt: string;
  recipient: { id: string; firstName: string; lastName: string; email: string } | null;
}

interface Analytics {
  timeRange: string;
  revenueByRole: Array<{ role: string; totalAmount: number; count: number; currency: string }>;
  revenueByContent: Array<{ contentType: string; totalAmount: number; count: number }>;
  topEarners: Array<{
    recipientId: string;
    recipientRole: string;
    totalAmount: number;
    count: number;
    user: { id: string; firstName: string; lastName: string; email: string } | null;
  }>;
}

const RevenueSharing: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'agreements' | 'ledger' | 'analytics'>('agreements');
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tierPercentages, setTierPercentages] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAgreements();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (selectedAgreement) {
      loadTiers(selectedAgreement.id);
      loadLedger(selectedAgreement.id);
    }
  }, [selectedAgreement]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAgreements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/revenue-sharing/agreements', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAgreements(data.agreements || []);
        if (data.agreements?.length > 0 && !selectedAgreement) {
          setSelectedAgreement(data.agreements[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTiers = async (agreementId: string) => {
    try {
      const response = await fetch(`/api/revenue-sharing/tiers?agreementId=${agreementId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTiers(data.tiers || []);
        
        const percentages: Record<string, number> = {};
        data.tiers.forEach((tier: Tier) => {
          percentages[tier.id] = parseFloat(tier.percentage);
        });
        setTierPercentages(percentages);
      }
    } catch (error) {
      console.error('Failed to load tiers:', error);
    }
  };

  const loadLedger = async (agreementId: string) => {
    try {
      const response = await fetch(`/api/revenue-sharing/ledger?limit=100`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLedgerEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load ledger:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/revenue-sharing/analytics?timeRange=${timeRange}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleUpdateTier = async (tierId: string) => {
    try {
      const tier = tiers.find(t => t.id === tierId);
      if (!tier) return;

      const response = await fetch('/api/revenue-sharing/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agreementId: tier.agreementId,
          userId: tier.userId,
          userRole: tier.userRole,
          tierLevel: tier.tierLevel,
          percentage: tierPercentages[tierId],
        }),
      });

      if (response.ok) {
        showNotification('success', 'Pourcentage mis à jour avec succès!');
        setEditingTier(null);
        loadTiers(tier.agreementId);
      } else {
        showNotification('error', 'Échec de la mise à jour');
      }
    } catch (error) {
      console.error('Failed to update tier:', error);
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const exportLedgerToCSV = () => {
    const headers = ['Date', 'Bénéficiaire', 'Rôle', 'Montant', 'Pourcentage', 'Devise', 'Type Contenu', 'Titre', 'Statut'];
    const rows = ledgerEntries.map(entry => [
      new Date(entry.createdAt).toLocaleDateString('fr-FR'),
      entry.recipient ? `${entry.recipient.firstName} ${entry.recipient.lastName}` : 'N/A',
      entry.recipientRole,
      entry.shareAmount,
      entry.sharePercentage + '%',
      entry.currency,
      entry.contentType,
      entry.contentTitle || 'N/A',
      entry.payoutStatus,
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'editor': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'processing': return 'text-blue-600 dark:text-blue-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            💸 {language === 'en' ? 'Revenue Sharing' : language === 'ar' ? 'مشاركة الإيرادات' : 'Partage des Revenus'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'en' 
              ? 'Manage pyramidal revenue distribution across your team'
              : language === 'ar'
              ? 'إدارة توزيع الإيرادات الهرمي عبر فريقك'
              : 'Gérez la distribution pyramidale des revenus dans votre équipe'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLedgerToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {notification.message}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('agreements')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'agreements'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Accords
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ledger'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Journal des Revenus
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analytics
        </button>
      </div>

      {/* Agreements Tab */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          {/* Agreement Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sélectionner un accord</h3>
            <select
              value={selectedAgreement?.id || ''}
              onChange={(e) => {
                const agreement = agreements.find(a => a.id === e.target.value);
                setSelectedAgreement(agreement || null);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {agreements.map(agreement => (
                <option key={agreement.id} value={agreement.id}>
                  {agreement.contract?.title || 'Accord sans titre'} - {agreement.agreementType}
                </option>
              ))}
            </select>
          </div>

          {/* Tiers Configuration */}
          {selectedAgreement && tiers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Configuration des Pourcentages</h3>
              <div className="space-y-4">
                {tiers.map(tier => (
                  <div key={tier.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(tier.userRole)}`}>
                        {tier.userRole.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {tier.user ? `${tier.user.firstName} ${tier.user.lastName}` : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tier.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {editingTier === tier.id ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={tierPercentages[tier.id] || 0}
                            onChange={(e) => setTierPercentages({ ...tierPercentages, [tier.id]: parseFloat(e.target.value) })}
                            className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                          <button
                            onClick={() => handleUpdateTier(tier.id)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {tier.percentage}%
                          </div>
                          <button
                            onClick={() => setEditingTier(tier.id)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les rôles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="completed">Complété</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          {/* Ledger Entries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bénéficiaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contenu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Part
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ledgerEntries
                    .filter(entry => filterRole === 'all' || entry.recipientRole === filterRole)
                    .filter(entry => filterStatus === 'all' || entry.payoutStatus === filterStatus)
                    .map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {entry.recipient ? `${entry.recipient.firstName} ${entry.recipient.lastName}` : 'N/A'}
                            </p>
                            <p className={`text-xs ${getRoleColor(entry.recipientRole)}`}>
                              {entry.recipientRole}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          <p className="font-medium">{entry.contentTitle || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{entry.contentType}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.shareAmount} {entry.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {entry.sharePercentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPayoutStatusColor(entry.payoutStatus)}`}>
                            {entry.payoutStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="week">Dernière semaine</option>
              <option value="month">Dernier mois</option>
              <option value="quarter">Dernier trimestre</option>
              <option value="year">Dernière année</option>
            </select>
          </div>

          {/* Revenue by Role */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenus par Rôle</h3>
            <div className="space-y-4">
              {analytics.revenueByRole.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(item.role)}`}>
                      {item.role.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} transactions</span>
                  </div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {item.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {item.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Earners */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top Bénéficiaires</h3>
            <div className="space-y-3">
              {analytics.topEarners.map((earner, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {earner.user ? `${earner.user.firstName} ${earner.user.lastName}` : 'N/A'}
                      </p>
                      <p className={`text-xs ${getRoleColor(earner.recipientRole)}`}>
                        {earner.recipientRole}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {earner.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DZD
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{earner.count} ventes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueSharing;
