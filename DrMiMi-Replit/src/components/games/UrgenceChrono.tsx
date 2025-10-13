import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Heart,
  Activity,
  Zap,
  Timer,
  Trophy,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Siren,
  Stethoscope,
  Pill,
  Phone,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmergencyScenario {
  id: string;
  title: string;
  titleEn: string;
  titleAr: string;
  description: string;
  descriptionEn: string;
  descriptionAr: string;
  actions: EmergencyAction[];
  correctSequence: string[];
  timeLimit: number;
  severity: 'critical' | 'urgent' | 'moderate';
}

interface EmergencyAction {
  id: string;
  label: string;
  labelEn: string;
  labelAr: string;
  icon: React.ElementType;
  isCorrect?: boolean;
}

const scenarios: EmergencyScenario[] = [
  {
    id: '1',
    title: 'Arrêt cardiaque',
    titleEn: 'Cardiac Arrest',
    titleAr: 'توقف القلب',
    description: 'Patient inconscient, ne respire pas normalement',
    descriptionEn: 'Patient unconscious, not breathing normally',
    descriptionAr: 'المريض فاقد الوعي، لا يتنفس بشكل طبيعي',
    actions: [
      { id: 'call', label: 'Appeler les secours', labelEn: 'Call emergency', labelAr: 'اتصل بالطوارئ', icon: Phone },
      { id: 'check', label: 'Vérifier la respiration', labelEn: 'Check breathing', labelAr: 'تحقق من التنفس', icon: Stethoscope },
      { id: 'cpr', label: 'Commencer RCP', labelEn: 'Start CPR', labelAr: 'ابدأ الإنعاش', icon: Heart },
      { id: 'aed', label: 'Utiliser DEA si disponible', labelEn: 'Use AED if available', labelAr: 'استخدم مزيل الرجفان', icon: Zap },
      { id: 'medication', label: 'Donner médicaments', labelEn: 'Give medication', labelAr: 'أعط الدواء', icon: Pill },
    ],
    correctSequence: ['call', 'check', 'cpr', 'aed'],
    timeLimit: 60,
    severity: 'critical',
  },
  {
    id: '2',
    title: 'Crise d\'asthme sévère',
    titleEn: 'Severe Asthma Attack',
    titleAr: 'نوبة ربو شديدة',
    description: 'Dyspnée intense, cyanose, patient paniqué',
    descriptionEn: 'Severe dyspnea, cyanosis, panicked patient',
    descriptionAr: 'ضيق تنفس شديد، زرقة، مريض مذعور',
    actions: [
      { id: 'position', label: 'Position assise', labelEn: 'Sitting position', labelAr: 'وضعية الجلوس', icon: Activity },
      { id: 'inhaler', label: 'Bronchodilatateur', labelEn: 'Bronchodilator', labelAr: 'موسع الشعب', icon: Pill },
      { id: 'oxygen', label: 'Oxygène', labelEn: 'Oxygen', labelAr: 'الأكسجين', icon: Heart },
      { id: 'call', label: 'Appeler secours', labelEn: 'Call help', labelAr: 'اتصل بالمساعدة', icon: Phone },
      { id: 'reassure', label: 'Rassurer', labelEn: 'Reassure', labelAr: 'طمأنة', icon: Stethoscope },
    ],
    correctSequence: ['position', 'inhaler', 'oxygen', 'call'],
    timeLimit: 45,
    severity: 'urgent',
  },
  {
    id: '3',
    title: 'Hémorragie externe',
    titleEn: 'External Hemorrhage',
    titleAr: 'نزيف خارجي',
    description: 'Saignement abondant au niveau du bras',
    descriptionEn: 'Heavy bleeding from the arm',
    descriptionAr: 'نزيف شديد من الذراع',
    actions: [
      { id: 'pressure', label: 'Compression directe', labelEn: 'Direct pressure', labelAr: 'ضغط مباشر', icon: Activity },
      { id: 'elevate', label: 'Surélever membre', labelEn: 'Elevate limb', labelAr: 'رفع الطرف', icon: Stethoscope },
      { id: 'bandage', label: 'Pansement compressif', labelEn: 'Pressure bandage', labelAr: 'ضمادة ضاغطة', icon: Heart },
      { id: 'call', label: 'Appeler secours', labelEn: 'Call help', labelAr: 'اتصل بالمساعدة', icon: Phone },
      { id: 'tourniquet', label: 'Garrot', labelEn: 'Tourniquet', labelAr: 'عاصبة', icon: Zap },
    ],
    correctSequence: ['pressure', 'elevate', 'bandage', 'call'],
    timeLimit: 40,
    severity: 'urgent',
  },
];

export const UrgenceChrono: React.FC = () => {
  const { isFeminine } = useTheme();
  const { t, locale } = useLanguage();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isScenarioComplete, setIsScenarioComplete] = useState(false);

  const currentScenario = scenarios[currentScenarioIndex];

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setCurrentScenarioIndex(0);
    setSelectedActions([]);
    setTimeLeft(scenarios[0].timeLimit);
    setFeedback(null);
    setIsScenarioComplete(false);
  };

  // Timer effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !isScenarioComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying && !isScenarioComplete) {
      handleScenarioEnd(false);
    }
  }, [timeLeft, isPlaying, isScenarioComplete]);

  // Handle action selection
  const handleActionClick = (actionId: string) => {
    if (selectedActions.includes(actionId) || isScenarioComplete) return;

    const newSelectedActions = [...selectedActions, actionId];
    setSelectedActions(newSelectedActions);

    // Check if action is in correct position
    const correctIndex = currentScenario.correctSequence.indexOf(actionId);
    const selectedIndex = newSelectedActions.length - 1;

    if (correctIndex === selectedIndex) {
      setFeedback({ type: 'success', message: 'Action correcte !' });
      
      // Check if scenario is complete
      if (newSelectedActions.length === currentScenario.correctSequence.length) {
        handleScenarioEnd(true);
      }
    } else if (correctIndex === -1) {
      setFeedback({ type: 'error', message: 'Action inutile !' });
      setScore(Math.max(0, score - 5));
    } else {
      setFeedback({ type: 'error', message: 'Mauvais ordre !' });
      setScore(Math.max(0, score - 10));
      
      // Reset after wrong order
      setTimeout(() => {
        setSelectedActions([]);
        setFeedback(null);
      }, 1500);
    }

    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 1000);
  };

  // Handle scenario completion
  const handleScenarioEnd = (success: boolean) => {
    setIsScenarioComplete(true);

    if (success) {
      const timeBonus = Math.floor(timeLeft / 2);
      const scenarioScore = 50 + timeBonus;
      setScore(score + scenarioScore);
      setFeedback({ type: 'success', message: `Excellent ! +${scenarioScore} points` });

      // Move to next scenario after delay
      setTimeout(() => {
        if (currentScenarioIndex < scenarios.length - 1) {
          nextScenario();
        } else {
          endGame();
        }
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: 'Temps écoulé !' });
      setTimeout(() => {
        if (currentScenarioIndex < scenarios.length - 1) {
          nextScenario();
        } else {
          endGame();
        }
      }, 2000);
    }
  };

  // Next scenario
  const nextScenario = () => {
    const nextIndex = currentScenarioIndex + 1;
    setCurrentScenarioIndex(nextIndex);
    setSelectedActions([]);
    setTimeLeft(scenarios[nextIndex].timeLimit);
    setFeedback(null);
    setIsScenarioComplete(false);
  };

  // End game
  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    saveScore();
  };

  // Save score
  const saveScore = async () => {
    try {
      await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          gameType: 'urgence_chrono',
          score,
          timeSpent: scenarios.reduce((acc, s) => acc + s.timeLimit, 0) - timeLeft,
        }),
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'urgent':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/games"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux jeux
          </Link>
          
          {isPlaying && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{score} pts</span>
              </div>
              
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                <Timer className="w-5 h-5 text-red-500" />
                <span className="font-bold text-lg">{timeLeft}s</span>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                <Siren className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-lg">
                  Scénario {currentScenarioIndex + 1}/{scenarios.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Game Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-10 h-10 text-red-600 animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Urgence Chrono
            </h1>
            <AlertCircle className="w-10 h-10 text-red-600 animate-pulse" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Prenez les bonnes décisions en situation d'urgence !
          </p>
        </motion.div>

        {/* Start Screen */}
        {!isPlaying && !isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Siren className="w-6 h-6 inline mr-2 animate-pulse" />
              Commencer l'urgence
            </button>
          </motion.div>
        )}

        {/* Game Area */}
        {isPlaying && currentScenario && (
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            {/* Scenario Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {locale === 'ar' ? currentScenario.titleAr : 
                   locale === 'en' ? currentScenario.titleEn : 
                   currentScenario.title}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSeverityColor(currentScenario.severity)}`}>
                  {currentScenario.severity === 'critical' ? 'CRITIQUE' :
                   currentScenario.severity === 'urgent' ? 'URGENT' : 'MODÉRÉ'}
                </span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {locale === 'ar' ? currentScenario.descriptionAr :
                 locale === 'en' ? currentScenario.descriptionEn :
                 currentScenario.description}
              </p>
            </div>

            {/* Action Selection */}
            <div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">
                Sélectionnez les actions dans le bon ordre :
              </h3>
              
              {/* Selected Actions */}
              {selectedActions.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Actions sélectionnées :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedActions.map((actionId, index) => {
                      const action = currentScenario.actions.find(a => a.id === actionId);
                      if (!action) return null;
                      const Icon = action.icon;
                      return (
                        <div
                          key={`${actionId}-${index}`}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-800 rounded-lg"
                        >
                          <span className="text-sm font-bold text-blue-800 dark:text-blue-100">
                            {index + 1}.
                          </span>
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          <span className="text-sm text-blue-800 dark:text-blue-100">
                            {locale === 'ar' ? action.labelAr :
                             locale === 'en' ? action.labelEn :
                             action.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Actions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentScenario.actions.map((action) => {
                  const Icon = action.icon;
                  const isSelected = selectedActions.includes(action.id);
                  
                  return (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: isSelected ? 1 : 1.05 }}
                      whileTap={{ scale: isSelected ? 1 : 0.95 }}
                      onClick={() => handleActionClick(action.id)}
                      disabled={isSelected || isScenarioComplete}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-gray-300 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                          : 'border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        isSelected ? 'text-gray-400' : 'text-red-600 dark:text-red-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        isSelected ? 'text-gray-500' : 'text-gray-800 dark:text-white'
                      }`}>
                        {locale === 'ar' ? action.labelAr :
                         locale === 'en' ? action.labelEn :
                         action.label}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div
                className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                  feedback.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <span className="font-bold text-lg">{feedback.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Mission terminée !
            </h2>
            <p className="text-5xl font-bold text-red-600 mb-2">{score}</p>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">points</p>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Scénarios complétés : {currentScenarioIndex + 1}/{scenarios.length}
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Rejouer
              </button>
              <Link
                to="/games"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <ChevronRight className="w-5 h-5 inline mr-2" />
                Autres jeux
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UrgenceChrono;