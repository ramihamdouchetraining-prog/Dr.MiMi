import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Palette,
  Shield,
  Save,
  CheckCircle,
  Sparkles,
  Languages,
  CreditCard
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('appearance');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Appearance
    defaultTheme: 'feminine_light',
    enableMagicalEffects: true,
    enableAnimations: true,
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    
    // Language
    defaultLanguage: 'fr',
    enabledLanguages: ['fr', 'en', 'ar'],
    autoDetectLanguage: false,
    
    // Pricing
    defaultCurrency: 'DZD',
    taxRate: 19,
    enablePromoCodes: true,
    stripeEnabled: false,
    
    // Security
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    requireEmailVerification: false,
    enableTwoFactor: false,
    passwordMinLength: 8,
    forcePasswordChange: true
  });

  const sections: SettingSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of the platform',
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: 'language',
      title: 'Language & Localization',
      description: 'Configure language settings and translations',
      icon: <Languages className="w-5 h-5" />
    },
    {
      id: 'pricing',
      title: 'Pricing & Payment',
      description: 'Manage pricing, currencies, and payment methods',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Configure security settings and access controls',
      icon: <Shield className="w-5 h-5" />
    }
  ];

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSettings)
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Theme
        </label>
        <select
          value={settings.defaultTheme}
          onChange={(e) => handleSettingChange('defaultTheme', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="feminine_light">Feminine Light</option>
          <option value="feminine_dark">Feminine Dark</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableMagicalEffects}
            onChange={(e) => handleSettingChange('enableMagicalEffects', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium flex items-center gap-2">
              Enable Magical Effects
              <Sparkles className="w-4 h-4 text-purple-600" />
            </span>
            <p className="text-sm text-gray-500">Show sparkles, floating elements, and magical animations</p>
          </div>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableAnimations}
            onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Enable Animations</span>
            <p className="text-sm text-gray-500">Show page transitions and element animations</p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Language
        </label>
        <select
          value={settings.defaultLanguage}
          onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enabled Languages
        </label>
        <div className="space-y-2">
          {['fr', 'en', 'ar'].map(lang => (
            <label key={lang} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabledLanguages.includes(lang)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSettingChange('enabledLanguages', [...settings.enabledLanguages, lang]);
                  } else {
                    handleSettingChange('enabledLanguages', settings.enabledLanguages.filter(l => l !== lang));
                  }
                }}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span>
                {lang === 'fr' && 'Français'}
                {lang === 'en' && 'English'}
                {lang === 'ar' && 'العربية'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoDetectLanguage}
            onChange={(e) => handleSettingChange('autoDetectLanguage', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Auto-detect Language</span>
            <p className="text-sm text-gray-500">Automatically detect user's preferred language</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Currency
        </label>
        <select
          value={settings.defaultCurrency}
          onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="DZD">DZD - Algerian Dinar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="USD">USD - US Dollar</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tax Rate (%)
        </label>
        <input
          type="number"
          value={settings.taxRate}
          onChange={(e) => handleSettingChange('taxRate', parseInt(e.target.value))}
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enablePromoCodes}
            onChange={(e) => handleSettingChange('enablePromoCodes', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Enable Promo Codes</span>
            <p className="text-sm text-gray-500">Allow users to apply promotional codes at checkout</p>
          </div>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.stripeEnabled}
            onChange={(e) => handleSettingChange('stripeEnabled', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Enable Stripe Payments</span>
            <p className="text-sm text-gray-500">Accept online payments via Stripe</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Timeout (seconds)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
          min="300"
          max="86400"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">How long before inactive sessions expire</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Login Attempts
        </label>
        <input
          type="number"
          value={settings.maxLoginAttempts}
          onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
          min="3"
          max="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Password Length
        </label>
        <input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
          min="6"
          max="32"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireEmailVerification}
            onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Require Email Verification</span>
            <p className="text-sm text-gray-500">Users must verify email before accessing platform</p>
          </div>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableTwoFactor}
            onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Enable Two-Factor Authentication</span>
            <p className="text-sm text-gray-500">Add an extra layer of security for admin accounts</p>
          </div>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.forcePasswordChange}
            onChange={(e) => handleSettingChange('forcePasswordChange', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium">Force Password Change on First Login</span>
            <p className="text-sm text-gray-500">Require new admin users to change their password</p>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Platform Settings
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4 sticky top-6">
            <nav className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {section.icon}
                  <div className="text-left">
                    <div className="font-medium">{section.title}</div>
                    {activeSection === section.id && (
                      <div className="text-xs opacity-75">{section.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              {sections.find(s => s.id === activeSection)?.icon}
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
            
            {activeSection === 'appearance' && renderAppearanceSettings()}
            {activeSection === 'language' && renderLanguageSettings()}
            {activeSection === 'pricing' && renderPricingSettings()}
            {activeSection === 'security' && renderSecuritySettings()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;