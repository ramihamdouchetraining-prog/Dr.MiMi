import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  Download,
  FileSignature,
  CheckCircle,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Contract {
  id: string;
  title: string;
  type: 'owner_admin' | 'owner_editor' | 'admin_editor';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'terminated';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  signers: {
    id: string;
    name: string;
    role: 'owner' | 'admin' | 'editor';
    signed: boolean;
    signedAt?: string;
    ipAddress?: string;
  }[];
  clauses: {
    id: string;
    title: string;
    content: string;
  }[];
  revenueShare?: {
    ownerPercent: number;
    adminPercent: number;
    editorPercent: number;
  };
}

const ContractManagement: React.FC = () => {
  const { language } = useLanguage();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contracts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }

      const data = await response.json();
      
      if (data.success && data.contracts) {
        const transformedContracts: Contract[] = data.contracts.map((contract: any) => {
          const mapStatus = (status: string): Contract['status'] => {
            if (status === 'pending_signature_a' || status === 'pending_signature_b') return 'pending';
            if (status === 'expired') return 'completed';
            return status as Contract['status'];
          };

          const mapType = (type: string): Contract['type'] => {
            if (type === 'editor_consultant') return 'owner_editor';
            if (type === 'custom') return 'owner_admin';
            return type as Contract['type'];
          };

          const partyAName = contract.partyA 
            ? `${contract.partyA.firstName || ''} ${contract.partyA.lastName || ''} (${contract.partyA.role})`.trim()
            : 'Unknown';
          
          const partyBName = contract.partyB 
            ? `${contract.partyB.firstName || ''} ${contract.partyB.lastName || ''} (${contract.partyB.role})`.trim()
            : 'Unknown';

          const signers = [
            {
              id: contract.partyAId,
              name: partyAName,
              role: contract.partyARole || 'owner',
              signed: !!contract.signedByAAt,
              signedAt: contract.signedByAAt,
            },
            {
              id: contract.partyBId,
              name: partyBName,
              role: contract.partyBRole || 'admin',
              signed: !!contract.signedByBAt,
              signedAt: contract.signedByBAt,
            },
          ];

          return {
            id: contract.id,
            title: contract.title,
            type: mapType(contract.contractType),
            status: mapStatus(contract.status),
            createdAt: contract.createdAt,
            startDate: contract.startDate,
            endDate: contract.endDate,
            signers,
            clauses: [], 
            revenueShare: contract.revenueSharePercentageA && contract.revenueSharePercentageB ? {
              ownerPercent: parseFloat(contract.revenueSharePercentageA),
              adminPercent: parseFloat(contract.revenueSharePercentageB),
              editorPercent: 0,
            } : undefined,
          };
        });

        setContracts(transformedContracts);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Contract['status']) => {
    const styles = {
      draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
      active: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      completed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      terminated: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    };

    const labels = {
      draft: language === 'en' ? 'Draft' : language === 'ar' ? 'مسودة' : 'Brouillon',
      pending: language === 'en' ? 'Pending' : language === 'ar' ? 'قيد الانتظار' : 'En attente',
      active: language === 'en' ? 'Active' : language === 'ar' ? 'نشط' : 'Actif',
      completed: language === 'en' ? 'Completed' : language === 'ar' ? 'مكتمل' : 'Terminé',
      terminated: language === 'en' ? 'Terminated' : language === 'ar' ? 'منتهي' : 'Résilié',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type: Contract['type']) => {
    const labels = {
      owner_admin: 'Owner ↔ Admin',
      owner_editor: 'Owner ↔ Editor',
      admin_editor: 'Admin ↔ Editor',
    };
    return labels[type];
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.signers.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    {
      label: 'Contrats actifs',
      value: contracts.filter(c => c.status === 'active').length,
      icon: FileText,
      color: 'green',
    },
    {
      label: 'En attente',
      value: contracts.filter(c => c.status === 'pending').length,
      icon: Clock,
      color: 'yellow',
    },
    {
      label: 'Brouillons',
      value: contracts.filter(c => c.status === 'draft').length,
      icon: Edit,
      color: 'gray',
    },
    {
      label: 'Total',
      value: contracts.length,
      icon: FileSignature,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileSignature className="w-7 h-7 text-purple-600" />
            {language === 'en' ? 'Contract Management' : language === 'ar' ? 'إدارة العقود' : 'Gestion des Contrats'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'en' 
              ? 'Create, manage and track contracts between roles'
              : language === 'ar'
              ? 'إنشاء وإدارة وتتبع العقود بين الأدوار'
              : 'Créez, gérez et suivez les contrats entre rôles'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === 'en' ? 'New Contract' : language === 'ar' ? 'عقد جديد' : 'Nouveau Contrat'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm opacity-90">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search contracts...' : language === 'ar' ? 'البحث في العقود...' : 'Rechercher des contrats...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="pending">En attente</option>
          <option value="active">Actifs</option>
          <option value="completed">Terminés</option>
          <option value="terminated">Résiliés</option>
        </select>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucun contrat trouvé avec ces filtres'
                : 'Aucun contrat créé. Commencez par créer votre premier contrat !'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Contrat</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Signataires</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Période</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{contract.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Créé le {new Date(contract.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                        {getTypeLabel(contract.type)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex -space-x-2">
                        {contract.signers.map((signer) => (
                          <div
                            key={signer.id}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800 ${
                              signer.signed
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                            title={`${signer.name} - ${signer.signed ? 'Signé' : 'En attente'}`}
                          >
                            {signer.signed ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {contract.startDate && contract.endDate ? (
                        <div className="text-sm">
                          <p className="text-gray-600 dark:text-gray-400">
                            {new Date(contract.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs">
                            → {new Date(contract.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowPreviewModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="Prévisualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {contract.status === 'pending' && (
                          <button
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                            title="Signer"
                          >
                            <FileSignature className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateContractModal
            onClose={() => {
              setShowCreateModal(false);
              setCurrentStep(1);
            }}
            onSuccess={loadContracts}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
      </AnimatePresence>

      {/* Preview Contract Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedContract && (
          <PreviewContractModal
            contract={selectedContract}
            onClose={() => {
              setShowPreviewModal(false);
              setSelectedContract(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create Contract Modal with Wizard
const CreateContractModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}> = ({ onClose, onSuccess, currentStep, setCurrentStep }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    type: 'owner_admin' as Contract['type'],
    startDate: '',
    endDate: '',
    ownerPercent: 70,
    adminPercent: 20,
    editorPercent: 10,
    clauses: [] as { title: string; content: string }[],
  });

  const steps = [
    { number: 1, title: 'Informations générales', icon: FileText },
    { number: 2, title: 'Répartition des revenus', icon: DollarSign },
    { number: 3, title: 'Clauses contractuelles', icon: FileSignature },
    { number: 4, title: 'Révision et création', icon: CheckCircle },
  ];

  const handleSubmit = async () => {
    try {
      const mapType = (type: Contract['type']): string => {
        if (type === 'owner_admin') return 'owner_admin';
        if (type === 'owner_editor') return 'admin_editor';
        if (type === 'admin_editor') return 'admin_editor';
        return 'owner_admin';
      };

      const contractData = {
        title: formData.title,
        contractType: mapType(formData.type),
        partyAId: 'temp-owner-id',
        partyBId: 'temp-admin-id', 
        revenueSharePercentageA: formData.ownerPercent,
        revenueSharePercentageB: formData.adminPercent,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        description: `Contract between parties with revenue share: ${formData.ownerPercent}% / ${formData.adminPercent}%`,
        clauses: formData.clauses.map((clause, index) => ({
          clauseNumber: `${index + 1}`,
          title: clause.title,
          content: clause.content,
          clauseType: 'other' as const,
          isMandatory: true,
          orderIndex: index,
        })),
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create contract');
      }

      const result = await response.json();
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(result.message || 'Failed to create contract');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Erreur lors de la création du contrat. Veuillez réessayer.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Create New Contract' : language === 'ar' ? 'إنشاء عقد جديد' : 'Créer un Nouveau Contrat'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep >= step.number
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="hidden md:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.number
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      currentStep > step.number
                        ? 'bg-purple-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre du contrat
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Contrat Owner-Admin 2025"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de contrat
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Contract['type'] })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="owner_admin">Owner ↔ Admin</option>
                  <option value="owner_editor">Owner ↔ Editor</option>
                  <option value="admin_editor">Admin ↔ Editor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 La somme des pourcentages doit être égale à 100%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part Owner (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ownerPercent}
                  onChange={(e) => setFormData({ ...formData, ownerPercent: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part Admin (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.adminPercent}
                  onChange={(e) => setFormData({ ...formData, adminPercent: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part Editor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.editorPercent}
                  onChange={(e) => setFormData({ ...formData, editorPercent: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total: {formData.ownerPercent + formData.adminPercent + formData.editorPercent}%
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden flex">
                  <div
                    className="bg-teal-500"
                    style={{ width: `${formData.ownerPercent}%` }}
                    title={`Owner: ${formData.ownerPercent}%`}
                  />
                  <div
                    className="bg-blue-500"
                    style={{ width: `${formData.adminPercent}%` }}
                    title={`Admin: ${formData.adminPercent}%`}
                  />
                  <div
                    className="bg-amber-500"
                    style={{ width: `${formData.editorPercent}%` }}
                    title={`Editor: ${formData.editorPercent}%`}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ajoutez les clauses contractuelles importantes
              </p>
              {/* Placeholder pour les clauses */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Fonctionnalité en développement
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Votre contrat est prêt à être créé !
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <p><strong>Titre:</strong> {formData.title}</p>
                <p><strong>Type:</strong> {formData.type}</p>
                <p><strong>Période:</strong> {formData.startDate} → {formData.endDate}</p>
                <p><strong>Répartition:</strong> Owner {formData.ownerPercent}% / Admin {formData.adminPercent}% / Editor {formData.editorPercent}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Créer le Contrat
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Preview Contract Modal
const PreviewContractModal: React.FC<{
  contract: Contract;
  onClose: () => void;
}> = ({ contract, onClose }) => {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-600" />
            Aperçu du Contrat
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Contract Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{contract.title}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {contract.type === 'owner_admin' ? 'Owner ↔ Admin' : 
                   contract.type === 'owner_editor' ? 'Owner ↔ Editor' : 
                   'Admin ↔ Editor'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{contract.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Période</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {contract.startDate && contract.endDate
                    ? `${new Date(contract.startDate).toLocaleDateString()} - ${new Date(contract.endDate).toLocaleDateString()}`
                    : 'Non définie'}
                </p>
              </div>
            </div>
          </div>

          {/* Signers */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Signataires</h4>
            <div className="space-y-2">
              {contract.signers.map((signer) => (
                <div
                  key={signer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        signer.signed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {signer.signed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{signer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{signer.role}</p>
                    </div>
                  </div>
                  {signer.signed && signer.signedAt && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Signé le {new Date(signer.signedAt).toLocaleDateString()}
                      </p>
                      {signer.ipAddress && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">IP: {signer.ipAddress}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Share */}
          {contract.revenueShare && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Répartition des revenus</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Owner</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {contract.revenueShare.ownerPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Admin</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {contract.revenueShare.adminPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Editor</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {contract.revenueShare.editorPercent}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Clauses */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Clauses contractuelles</h4>
            <div className="space-y-3">
              {contract.clauses.map((clause, index) => (
                <div key={clause.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {index + 1}. {clause.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{clause.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Fermer
          </button>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
            {contract.status === 'pending' && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                Signer
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContractManagement;
