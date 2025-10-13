import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, CreditCard, Check, AlertCircle, Clock, Send, FileText } from 'lucide-react';

type PaymentStatus = 'pending' | 'submitted' | 'validated' | 'rejected';

export default function PaymentDZD() {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 10 * 1024 * 1024) { // Max 10MB
        setProofFile(file);
      } else {
        alert('Le fichier est trop volumineux. Maximum 10MB.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proofFile && amount && paymentMethod && email) {
      setStatus('submitted');
      setTimeout(() => {
        setStatus('validated');
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'submitted':
        return <Clock className="animate-spin" size={24} />;
      case 'validated':
        return <Check size={24} />;
      case 'rejected':
        return <AlertCircle size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'submitted':
        return '#F59E0B';
      case 'validated':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Paiement en Dinar Algérien (DZD) 🇩🇿
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            Effectuez votre paiement hors-ligne et soumettez votre preuve
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Instructions de paiement */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl shadow-lg"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <CreditCard size={28} style={{ color: 'var(--color-primary)' }} />
              Instructions de paiement
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  💳 Virement bancaire
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <strong>RIB:</strong> 007 99999 0123456789 10<br />
                  <strong>Nom:</strong> Dr.MiMi Platform<br />
                  <strong>Banque:</strong> CPA - Crédit Populaire d'Algérie
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  📱 BaridiMob
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <strong>RIP:</strong> 00799999999999999<br />
                  <strong>Nom:</strong> BENNAMANE MERIEME
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  💰 CCP (Compte Chèque Postal)
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <strong>Compte:</strong> 12345678 Clé 90<br />
                  <strong>Nom:</strong> Dr.MiMi Education
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  ✉️ Chèque bancaire
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  À l'ordre de: <strong>Dr.MiMi Platform</strong><br />
                  Adresse: BP 123, Alger Centre, 16000 Alger
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 182, 193, 0.2)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                💡 Important:
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--color-textSecondary)' }}>
                <li>• Mentionnez votre email dans le motif de paiement</li>
                <li>• Gardez votre reçu/preuve de paiement</li>
                <li>• Validation sous 24-48h ouvrables</li>
              </ul>
            </div>
          </motion.div>

          {/* Formulaire de soumission */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl shadow-lg"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Send size={28} style={{ color: 'var(--color-primary)' }} />
              Soumettre la preuve
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Montant (DZD) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="Ex: 5000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Méthode de paiement *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="virement">Virement bancaire</option>
                  <option value="baridimob">BaridiMob</option>
                  <option value="ccp">CCP</option>
                  <option value="cheque">Chèque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Numéro de référence
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="Ex: TRX123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="votre.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="07 XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Preuve de paiement *
                </label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
                  style={{ 
                    borderColor: proofFile ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: 'var(--color-background)'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  {proofFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check size={20} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ color: 'var(--color-text)' }}>{proofFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload size={40} className="mx-auto mb-2" style={{ color: 'var(--color-textSecondary)' }} />
                      <p style={{ color: 'var(--color-textSecondary)' }}>
                        Cliquez pour télécharger<br />
                        <span className="text-xs">JPG, PNG ou PDF (Max 10MB)</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Message (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
              </div>

              <motion.button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!proofFile || !amount || !paymentMethod || !email}
              >
                Soumettre la preuve de paiement
              </motion.button>
            </form>

            {/* Status display */}
            {status !== 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg flex items-center gap-3"
                style={{ 
                  backgroundColor: `${getStatusColor()}20`,
                  borderLeft: `4px solid ${getStatusColor()}`
                }}
              >
                <div style={{ color: getStatusColor() }}>
                  {getStatusIcon()}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {status === 'submitted' && 'En cours de traitement...'}
                    {status === 'validated' && 'Paiement validé avec succès!'}
                    {status === 'rejected' && 'Paiement refusé'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {status === 'submitted' && 'Votre demande sera traitée sous 24-48h'}
                    {status === 'validated' && 'Merci pour votre soutien!'}
                    {status === 'rejected' && 'Veuillez vérifier les informations et réessayer'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}