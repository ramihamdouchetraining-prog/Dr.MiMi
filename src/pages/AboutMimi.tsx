import { motion } from 'framer-motion';
import { AvatarDrMimi, type AvatarPose } from '../components/AvatarDrMimi';
import { Link } from 'react-router-dom';
import { Heart, Gift, GraduationCap, Users, Star, Target } from 'lucide-react';

export default function AboutMimi() {
  
  const allPoses: AvatarPose[] = [
    'greeting', 'reading', 'stethoscope', 'medicine', 'idea',
    'pointing', 'writing', 'thinking', 'smiling', 'laptop'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Hero Section - Free Palestine */}
      <motion.div
        className="relative w-full h-[400px] mb-12 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/heroes/free-palestine.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-2xl">
              Solidarité et Humanité 🇩🇿 🇵🇸
            </h2>
            <p className="text-xl md:text-2xl font-medium drop-shadow-lg max-w-3xl mx-auto">
              Dr. Mimi soutient la justice, la paix et la dignité pour tous les peuples
            </p>
          </motion.div>
        </div>
        
        {/* Bottom Fade Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-6 text-center"
          style={{ color: 'var(--color-primary)' }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          À propos de Dr. Mimi 👩‍⚕️
        </motion.h1>
        
        <motion.div
          className="max-w-4xl mx-auto mb-12 p-8 rounded-xl shadow-lg"
          style={{ backgroundColor: 'var(--color-surface)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="prose max-w-none" style={{ color: 'var(--color-text)' }}>
            <p className="text-lg leading-relaxed mb-6">
              <strong>Mimi</strong> est une étudiante algérienne 🇩🇿, musulmane ☪️, motivée et dynamique 💪, 
              aujourd'hui en 3e année de médecine. Elle veut faciliter la vie des 
              étudiants en santé : mieux réviser 📚, mieux s'orienter 🧭, et gagner en 
              confiance chaque jour ✨.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Avec l'aide de son beau-frère <strong>Rami</strong> 👨‍💻, elle a 
              créé cette plateforme pour offrir des modules clairs 📖, des cas cliniques 
              concrets 🏥 et une communauté bienveillante 🤝. Ici, chaque question compte, 
              chaque progrès est célébré 🎉.
            </p>
            <p className="text-lg leading-relaxed font-semibold text-center">
              Notre mission : offrir une éducation de qualité 🎓, 
              accessible et inclusive 🌍, pour que chaque étudiant trouve sa voie 🌟.
            </p>
          </div>
        </motion.div>

        {/* Galerie des 10 avatars */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>
            Découvrez tous les avatars de Dr. Mimi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {allPoses.map((pose, index) => (
              <motion.div
                key={pose}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.1 }}
              >
                <AvatarDrMimi pose={pose} size="medium" animated={true} />
                <span className="mt-2 text-sm font-medium capitalize" style={{ color: 'var(--color-textSecondary)' }}>
                  {pose === 'greeting' && 'Salut'}
                  {pose === 'reading' && 'Lecture'}
                  {pose === 'stethoscope' && 'Stéthoscope'}
                  {pose === 'medicine' && 'Médicaments'}
                  {pose === 'idea' && 'Idée'}
                  {pose === 'pointing' && 'Explication'}
                  {pose === 'writing' && 'Écriture'}
                  {pose === 'thinking' && 'Réflexion'}
                  {pose === 'smiling' && 'Sourire'}
                  {pose === 'laptop' && 'Ordinateur'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Nos valeurs */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <GraduationCap size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>Excellence</h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Contenus de qualité validés par des professionnels de santé
            </p>
          </div>
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>Communauté</h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Entraide et soutien entre étudiants en médecine
            </p>
          </div>
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>Accessibilité</h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Éducation médicale accessible à tous, partout
            </p>
          </div>
        </motion.div>

        {/* Section Dons */}
        <motion.div
          className="p-8 rounded-2xl shadow-xl mb-12"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.2), rgba(255, 105, 180, 0.2))',
            border: '2px solid var(--color-primary)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <Heart size={64} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Soutenir la plateforme 💝
            </h2>
          </div>
          
          <p className="mb-6 text-lg text-center" style={{ color: 'var(--color-text)' }}>
            Vos dons permettent de financer :
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <Star className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Bourses étudiants</p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Pour les étudiants en difficulté financière
              </p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <Gift className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Contenu gratuit</p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Modules et ressources accessibles à tous
              </p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <Heart className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Causes humanitaires</p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Soutien aux causes justes et légales
              </p>
            </div>
          </div>

          <p className="mb-8 text-center italic" style={{ color: 'var(--color-textSecondary)' }}>
            Une partie des dons soutient également la cause palestinienne 🇵🇸, dans le respect des lois en vigueur.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="px-8 py-4 rounded-xl font-bold text-white shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #10B981, #059669)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💶 Faire un don (EUR)
            </motion.button>
            
            <Link to="/payment-dzd">
              <motion.button
                className="px-8 py-4 rounded-xl font-bold text-white shadow-lg w-full"
                style={{ 
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🇩🇿 Promesse de don (DZD)
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p style={{ color: 'var(--color-textSecondary)' }}>
            Créé avec ❤️ par <strong>Mimi</strong> et <strong>Rami</strong> pour les étudiants en médecine
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}