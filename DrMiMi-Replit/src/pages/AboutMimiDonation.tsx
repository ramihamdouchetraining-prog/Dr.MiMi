import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { EnhancedDrMimiAvatar, FloatingDrMimi } from '../components/EnhancedDrMimiAvatar';
import { AvatarGallery } from '../components/AvatarCarousel';
import { InteractiveMimi } from '../components/MimiAnimated';
import { 
  Heart, Gift, GraduationCap, Users, Target, Star,
  CreditCard, Building, Smartphone, FileCheck,
  Facebook, Instagram, Linkedin, Twitter, Mail,
  Sparkles, ChevronRight, AlertCircle, Globe
} from 'lucide-react';

export default function AboutMimiDonation() {
  const { isRTL } = useLanguage();
  const [donationAmount, setDonationAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showDZDDetails, setShowDZDDetails] = useState(false);

  // Handle EUR donation with Stripe
  const handleEURDonation = async () => {
    setIsLoadingStripe(true);
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount;
    
    if (finalAmount < 1) {
      alert('Le montant minimum est de 1€');
      setIsLoadingStripe(false);
      return;
    }

    try {
      // Call backend API to create Stripe checkout session
      const response = await fetch('/api/create-donation-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'eur',
          description: 'Don pour Dr.MiMi - Soutien à la plateforme éducative',
          successUrl: window.location.origin + '/a-propos-de-mimi?donation=success',
          cancelUrl: window.location.origin + '/a-propos-de-mimi?donation=cancelled'
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // For now, show test mode message
        alert(`Mode Test: Don de ${finalAmount}€ simulé avec succès! 🎉\nEn production, vous seriez redirigé vers Stripe Checkout.`);
      }
    } catch (error) {
      console.error('Error creating donation session:', error);
      alert('Mode Test: Simulation de don activée. En production, ceci utiliserait Stripe.');
    } finally {
      setIsLoadingStripe(false);
    }
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    setNewsletterStatus('loading');
    
    try {
      // In production, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setNewsletterStatus('success');
      setNewsletterEmail('');
      
      setTimeout(() => {
        setNewsletterStatus('idle');
      }, 3000);
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => {
        setNewsletterStatus('idle');
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hero Section - Free Palestine */}
      <motion.div
        className="relative w-full h-[450px] mb-8 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/heroes/free-palestine.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Gradient Overlay for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <motion.div
            className="text-center max-w-4xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              🇩🇿 Solidarité et Humanité 🇵🇸
            </h2>
            <p className="text-xl md:text-2xl font-medium drop-shadow-xl max-w-3xl mx-auto leading-relaxed">
              Dr. Mimi soutient القضية الفلسطينية - La justice, la paix et la dignité pour tous les peuples
            </p>
            <motion.div
              className="mt-6 text-lg md:text-xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              ✊ Free Palestine ✊
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom Fade Effect to blend with background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
      </motion.div>

      {/* Floating Dr.Mimi for ambiance */}
      <FloatingDrMimi />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with title and Dr.Mimi avatar */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-center mb-6">
            <EnhancedDrMimiAvatar 
              size="xl" 
              mood="happy" 
              animated={true}
              showMessage={true}
              message="Bienvenue sur ma page! 💕"
            />
          </div>
          <h1 
            className="text-5xl font-bold mb-4 font-magic"
            style={{ 
              background: 'var(--gradient-magic)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            À propos de Mimi
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-textSecondary)' }}>
            Découvrez mon histoire et ma mission ✨
          </p>
        </motion.div>

        {/* Main content about Mimi */}
        <motion.div
          className="mb-16 p-8 rounded-2xl shadow-xl"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '2px solid var(--pastel-pink)'
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-text)' }}>
              <strong>Mimi</strong> (Merieme BENNAMANE) est une jeune étudiante de 20 ans 🇩🇿, Algérienne, Musulmane ☪️, 
              de la wilaya Boumerdès exactement de Bordj-Menaïel, en 3e année de médecine. Elle soutient القضية الفلسطينية 🕊️.
              Elle veut faciliter la vie des étudiants en santé : 
              mieux réviser 📚, mieux s'orienter 🧭 et gagner en confiance 💖.
            </p>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-text)' }}>
              Avec l'aide de son beau-frère <strong>Rami</strong> 👨‍💻, elle a créé cette plateforme 
              pour offrir des modules clairs 📖, des cas cliniques concrets 🏥 et une communauté 
              bienveillante 🤝. Ici, chaque question compte ❓, chaque progrès est célébré 🎉.
            </p>
            <motion.p 
              className="text-xl leading-relaxed font-bold text-center p-4 rounded-lg"
              style={{ 
                color: 'var(--color-primary)',
                backgroundColor: 'rgba(255, 182, 193, 0.1)'
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Notre mission : rendre le savoir médical accessible à tous les étudiants Algérien ou autres, 
              quel que soit leur niveau ou leurs moyens 🌍✨
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Avatar Gallery */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: 'var(--color-text)' }}
          >
            <Sparkles className="inline-block mr-2" style={{ color: 'var(--color-accent)' }} />
            Galerie des avatars Dr. Mimi - 15+ poses !
            <Sparkles className="inline-block ml-2" style={{ color: 'var(--color-accent)' }} />
          </h2>
          
          {/* Using the enhanced AvatarGallery component with filters */}
          <AvatarGallery className="mb-8" />
          
          {/* Interactive Animated Dr. Mimi */}
          <motion.div 
            className="flex flex-col items-center mt-12 p-8 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Dr. Mimi animée - Interagis avec moi! 🎉
            </h3>
            <InteractiveMimi className="cursor-pointer" />
          </motion.div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div 
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>
              Excellence
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Contenus de qualité validés par des professionnels
            </p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            whileHover={{ scale: 1.05 }}
          >
            <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>
              Communauté
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Entraide et soutien entre étudiants
            </p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            whileHover={{ scale: 1.05 }}
          >
            <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>
              Accessibilité
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Éducation accessible à tous, partout
            </p>
          </motion.div>
        </motion.div>

        {/* Donation Section */}
        <motion.div
          className="mb-16 p-8 rounded-2xl shadow-xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.3), rgba(255, 105, 180, 0.2))',
            border: '3px solid var(--color-primary)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart size={64} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Soutenez notre mission 💝
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text)' }}>
              Vos dons financent des bourses, du contenu gratuit et soutiennent la cause palestinienne, 
              dans le respect des lois en vigueur 🕊️
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* EUR Donation (Stripe) */}
            <motion.div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                <Globe className="mr-2" style={{ color: 'var(--color-accent)' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Don en EUR (International)
                </h3>
              </div>
              
              <p className="mb-4 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Paiement sécurisé via Stripe (Mode Test)
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[5, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDonationAmount(amount);
                      setCustomAmount('');
                    }}
                    className="py-3 px-4 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: donationAmount === amount && !customAmount 
                        ? 'var(--color-primary)' 
                        : 'var(--color-surface)',
                      color: donationAmount === amount && !customAmount 
                        ? 'white' 
                        : 'var(--color-text)',
                      border: '2px solid var(--color-primary)'
                    }}
                  >
                    {amount}€
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Montant personnalisé (€)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full mb-4 px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border)'
                }}
              />

              <motion.button
                onClick={handleEURDonation}
                disabled={isLoadingStripe}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CreditCard className="mr-2" />
                {isLoadingStripe ? 'Chargement...' : 'Faire un don en EUR (Test)'}
              </motion.button>

              <p className="mt-3 text-xs text-center" style={{ color: 'var(--color-textSecondary)' }}>
                🔒 Paiement 100% sécurisé via Stripe
              </p>
            </motion.div>

            {/* DZD Donation (Offline) */}
            <motion.div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Crect width='300' height='600' fill='%23006233'/%3E%3Crect x='300' width='300' height='600' fill='%23ffffff'/%3E%3Crect x='600' width='300' height='600' fill='%23006233'/%3E%3Cg transform='translate(450,300)'%3E%3Ccircle r='60' fill='%23d21034'/%3E%3Cpath d='M 0,-48 L 14.5,-35.3 L 23.5,-7.7 L 0,-20 L -23.5,-7.7 L -14.5,-35.3 z' fill='%23006233'/%3E%3C/g%3E%3C/svg%3E"
                  alt="DZ"
                  className="w-6 h-4 mr-2"
                />
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Don en DZD (Algérie)
                </h3>
              </div>

              <p className="mb-4 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Paiement hors ligne - Validation par l'administrateur
              </p>

              <motion.button
                onClick={() => setShowDZDDetails(!showDZDDetails)}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showDZDDetails ? 'Masquer' : 'Voir'} les instructions
                <ChevronRight 
                  className="ml-2 transition-transform" 
                  style={{ transform: showDZDDetails ? 'rotate(90deg)' : '' }}
                />
              </motion.button>

              {showDZDDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="flex items-center mb-2">
                      <Building className="mr-2" size={20} style={{ color: 'var(--color-accent)' }} />
                      <strong>Virement Bancaire</strong>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      Banque: CPA Algérie<br/>
                      RIB: 00400 123456789012 34<br/>
                      Nom: Association Dr.MiMi Education
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="flex items-center mb-2">
                      <Smartphone className="mr-2" size={20} style={{ color: 'var(--color-accent)' }} />
                      <strong>BaridiMob</strong>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      RIP: 007999999123456789012<br/>
                      Nom: Dr.MiMi Platform
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="flex items-center mb-2">
                      <FileCheck className="mr-2" size={20} style={{ color: 'var(--color-accent)' }} />
                      <strong>Chèque</strong>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      À l'ordre de: Association Dr.MiMi<br/>
                      Adresse: BP 123, Boumerdès 35000
                    </p>
                  </div>

                  <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <AlertCircle className="mr-2 flex-shrink-0 mt-1" size={16} style={{ color: 'var(--color-warning)' }} />
                    <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                      Après votre paiement, envoyez-nous la preuve à admin@drmimi.dz 
                      pour validation. Votre don sera confirmé sous 24-48h.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* What donations fund */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <motion.div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
              whileHover={{ y: -5 }}
            >
              <Star className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                Bourses étudiantes
              </p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Pour les étudiants méritants
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
              whileHover={{ y: -5 }}
            >
              <Gift className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                Contenu gratuit
              </p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Ressources accessibles à tous
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
              whileHover={{ y: -5 }}
            >
              <Heart className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                Causes humanitaires
              </p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Soutien solidaire et légal
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          className="mb-16 p-8 rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center mb-6">
            <Mail size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Restez informé(e)
            </h2>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Inscrivez-vous à notre newsletter pour recevoir des conseils et actualités
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="votre.email@exemple.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border)'
                }}
                required
              />
              <motion.button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-6 py-3 rounded-lg font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {newsletterStatus === 'loading' ? '...' : "S'inscrire"}
              </motion.button>
            </div>
            
            {newsletterStatus === 'success' && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center text-sm"
                style={{ color: 'var(--color-success)' }}
              >
                ✅ Inscription réussie! Merci de votre intérêt.
              </motion.p>
            )}
            
            {newsletterStatus === 'error' && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center text-sm"
                style={{ color: 'var(--color-error)' }}
              >
                ❌ Une erreur est survenue. Veuillez réessayer.
              </motion.p>
            )}
          </form>
        </motion.div>

        {/* Social Media Links */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            Suivez-nous sur les réseaux
          </h3>
          <div className="flex justify-center gap-4">
            <motion.a
              href="#"
              className="p-3 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)'
              }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              title="Facebook"
            >
              <Facebook size={24} />
            </motion.a>
            <motion.a
              href="#"
              className="p-3 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)'
              }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              title="Instagram"
            >
              <Instagram size={24} />
            </motion.a>
            <motion.a
              href="#"
              className="p-3 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)'
              }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              title="LinkedIn"
            >
              <Linkedin size={24} />
            </motion.a>
            <motion.a
              href="#"
              className="p-3 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)'
              }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              title="Twitter"
            >
              <Twitter size={24} />
            </motion.a>
          </div>
          <p className="mt-6 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            Made with 💕 by Mimi & Rami for medical students worldwide
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}