import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Pill,
  Heart,
  Brain,
  AlertCircle,
  Check,
  X,
  Timer,
  Trophy,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface Medication {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  indication: string;
  indicationEn: string;
  indicationAr: string;
  category: string;
}

const medicationData: Medication[] = [
  {
    id: '1',
    name: 'Amoxicilline',
    nameEn: 'Amoxicillin',
    nameAr: 'أموكسيسيلين',
    indication: 'Infections bactériennes',
    indicationEn: 'Bacterial infections',
    indicationAr: 'الالتهابات البكتيرية',
    category: 'Antibiotique',
  },
  {
    id: '2',
    name: 'Paracétamol',
    nameEn: 'Paracetamol',
    nameAr: 'باراسيتامول',
    indication: 'Douleur et fièvre',
    indicationEn: 'Pain and fever',
    indicationAr: 'الألم والحمى',
    category: 'Antalgique',
  },
  {
    id: '3',
    name: 'Oméprazole',
    nameEn: 'Omeprazole',
    nameAr: 'أوميبرازول',
    indication: 'Reflux gastro-œsophagien',
    indicationEn: 'Gastroesophageal reflux',
    indicationAr: 'ارتجاع المريء',
    category: 'IPP',
  },
  {
    id: '4',
    name: 'Metformine',
    nameEn: 'Metformin',
    nameAr: 'ميتفورمين',
    indication: 'Diabète type 2',
    indicationEn: 'Type 2 diabetes',
    indicationAr: 'السكري النوع 2',
    category: 'Antidiabétique',
  },
  {
    id: '5',
    name: 'Amlodipine',
    nameEn: 'Amlodipine',
    nameAr: 'أملوديبين',
    indication: 'Hypertension artérielle',
    indicationEn: 'High blood pressure',
    indicationAr: 'ارتفاع ضغط الدم',
    category: 'Antihypertenseur',
  },
  {
    id: '6',
    name: 'Salbutamol',
    nameEn: 'Salbutamol',
    nameAr: 'سالبوتامول',
    indication: 'Asthme bronchique',
    indicationEn: 'Bronchial asthma',
    indicationAr: 'الربو الشعبي',
    category: 'Bronchodilatateur',
  },
];

export const MedicamentMatch: React.FC = () => {
  const { isFeminine } = useTheme();
  const { t, locale } = useLanguage();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [correctMatches, setCorrectMatches] = useState<string[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedIndication, setSelectedIndication] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [shuffledMedications, setShuffledMedications] = useState<Medication[]>([]);
  const [shuffledIndications, setShuffledIndications] = useState<{ id: string; text: string }[]>([]);

  // Shuffle arrays
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setCurrentRound(0);
    setCorrectMatches([]);
    setSelectedMedication(null);
    setSelectedIndication(null);
    setFeedback(null);
    
    const shuffledMeds = shuffleArray(medicationData);
    setShuffledMedications(shuffledMeds);
    
    const indications = shuffledMeds.map(med => ({
      id: med.id,
      text: locale === 'ar' ? med.indicationAr : locale === 'en' ? med.indicationEn : med.indication,
    }));
    setShuffledIndications(shuffleArray(indications));
  };

  // Timer effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [timeLeft, isPlaying, isGameOver]);

  // Check match
  const checkMatch = () => {
    if (selectedMedication && selectedIndication) {
      if (selectedMedication.id === selectedIndication) {
        setScore(score + 10);
        setCorrectMatches([...correctMatches, selectedMedication.id]);
        setFeedback({ type: 'success', message: 'Correct ! +10 points' });
        
        // Remove matched items
        setShuffledMedications(prev => prev.filter(m => m.id !== selectedMedication.id));
        setShuffledIndications(prev => prev.filter(i => i.id !== selectedIndication));
        
        // Check if all matched
        if (correctMatches.length === medicationData.length - 1) {
          endGame();
        }
      } else {
        setScore(Math.max(0, score - 5));
        setFeedback({ type: 'error', message: 'Incorrect ! -5 points' });
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedMedication(null);
        setSelectedIndication(null);
        setFeedback(null);
      }, 1000);
    }
  };

  // Select medication
  const handleMedicationClick = (medication: Medication) => {
    if (correctMatches.includes(medication.id)) return;
    setSelectedMedication(medication);
    if (selectedIndication) {
      checkMatch();
    }
  };

  // Select indication
  const handleIndicationClick = (indicationId: string) => {
    if (correctMatches.includes(indicationId)) return;
    setSelectedIndication(indicationId);
    if (selectedMedication) {
      checkMatch();
    }
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
          gameType: 'medicament_match',
          score,
          timeSpent: 120 - timeLeft,
        }),
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-emerald-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/games"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
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
                <span className="font-bold text-lg">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
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
            <Pill className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Médicament Match
            </h1>
            <Pill className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Associez chaque médicament à son indication thérapeutique
          </p>
        </motion.div>

        {/* Game Area */}
        {!isPlaying && !isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Commencer le jeu
            </button>
          </motion.div>
        )}

        {isPlaying && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Medications Column */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                Médicaments
              </h2>
              <div className="space-y-3">
                {shuffledMedications.map((medication) => (
                  <motion.button
                    key={medication.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMedicationClick(medication)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      correctMatches.includes(medication.id)
                        ? 'bg-green-200 dark:bg-green-800 opacity-50 cursor-not-allowed'
                        : selectedMedication?.id === medication.id
                        ? 'bg-blue-200 dark:bg-blue-800 ring-4 ring-blue-400'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } shadow-md`}
                    disabled={correctMatches.includes(medication.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                          {locale === 'ar' ? medication.nameAr : locale === 'en' ? medication.nameEn : medication.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {medication.category}
                        </p>
                      </div>
                      {correctMatches.includes(medication.id) && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Indications Column */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                Indications
              </h2>
              <div className="space-y-3">
                {shuffledIndications.map((indication) => (
                  <motion.button
                    key={indication.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIndicationClick(indication.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      correctMatches.includes(indication.id)
                        ? 'bg-green-200 dark:bg-green-800 opacity-50 cursor-not-allowed'
                        : selectedIndication === indication.id
                        ? 'bg-blue-200 dark:bg-blue-800 ring-4 ring-blue-400'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } shadow-md`}
                    disabled={correctMatches.includes(indication.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {indication.text}
                      </p>
                      {correctMatches.includes(indication.id) && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
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
                  <Check className="w-6 h-6" />
                ) : (
                  <X className="w-6 h-6" />
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
              Partie terminée !
            </h2>
            <p className="text-5xl font-bold text-emerald-600 mb-2">{score}</p>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">points</p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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

export default MedicamentMatch;