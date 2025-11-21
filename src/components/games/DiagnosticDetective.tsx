import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Timer,
  Trophy,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Thermometer,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Medical cases data
const medicalCases = [
  {
    id: 1,
    difficulty: 'facile',
    diagnosis: 'Angine streptococcique',
    symptoms: [
      'Mal de gorge intense',
      'Fièvre élevée (39-40°C)',
      'Ganglions cervicaux gonflés',
      'Difficultés à avaler',
    ],
    hints: [
      { text: 'Examen de la gorge : amygdales rouges avec points blancs', cost: 20 },
      { text: 'Test rapide streptocoque positif', cost: 30 },
      { text: 'Infection bactérienne nécessitant antibiotiques', cost: 40 },
    ],
    explanation: 'L\'angine streptococcique est une infection bactérienne causée par le streptocoque du groupe A. Elle nécessite un traitement antibiotique.',
    labResults: {
      'NFS': 'Leucocytose avec prédominance neutrophile',
      'CRP': 'Élevée (>50 mg/L)',
    },
  },
  {
    id: 2,
    difficulty: 'moyen',
    diagnosis: 'Infarctus du myocarde',
    symptoms: [
      'Douleur thoracique oppressante',
      'Irradiation dans le bras gauche et la mâchoire',
      'Sueurs froides',
      'Nausées',
      'Dyspnée',
    ],
    hints: [
      { text: 'ECG : sus-décalage du segment ST', cost: 25 },
      { text: 'Troponines cardiaques élevées', cost: 35 },
      { text: 'Urgence vitale - Cathétérisme cardiaque urgent', cost: 50 },
    ],
    explanation: 'L\'infarctus du myocarde (crise cardiaque) est une urgence médicale causée par l\'obstruction d\'une artère coronaire.',
    labResults: {
      'Troponines': 'Très élevées',
      'CPK-MB': 'Élevées',
      'ECG': 'STEMI antérieur',
    },
  },
  {
    id: 3,
    difficulty: 'moyen',
    diagnosis: 'Pneumonie communautaire',
    symptoms: [
      'Fièvre avec frissons',
      'Toux productive (crachats purulents)',
      'Douleur thoracique pleurale',
      'Dyspnée',
      'Fatigue intense',
    ],
    hints: [
      { text: 'Auscultation : crépitants en base droite', cost: 20 },
      { text: 'Radio thorax : infiltrat lobaire', cost: 30 },
      { text: 'Pneumocoque le plus fréquent', cost: 40 },
    ],
    explanation: 'La pneumonie communautaire est une infection du parenchyme pulmonaire, souvent causée par Streptococcus pneumoniae.',
    labResults: {
      'Radio thorax': 'Condensation lobaire inférieure droite',
      'NFS': 'Hyperleucocytose',
      'CRP': '150 mg/L',
    },
  },
  {
    id: 4,
    difficulty: 'difficile',
    diagnosis: 'Embolie pulmonaire',
    symptoms: [
      'Dyspnée brutale',
      'Douleur thoracique augmentée à l\'inspiration',
      'Tachycardie',
      'Angoisse',
      'Hémoptysie possible',
    ],
    hints: [
      { text: 'D-dimères élevés', cost: 25 },
      { text: 'Angio-scanner thoracique : défaut de perfusion', cost: 40 },
      { text: 'Facteurs de risque : immobilisation, chirurgie récente', cost: 30 },
    ],
    explanation: 'L\'embolie pulmonaire est l\'obstruction d\'une artère pulmonaire par un caillot sanguin, généralement d\'origine veineuse.',
    labResults: {
      'D-dimères': '>2000 µg/L',
      'Gaz du sang': 'Hypoxémie, hypocapnie',
      'Angio-TDM': 'Thrombus artère pulmonaire',
    },
  },
];

interface HintProps {
  hint: { text: string; cost: number };
  onUse: () => void;
  disabled: boolean;
  revealed: boolean;
}

const HintCard: React.FC<HintProps> = ({ hint, onUse, disabled, revealed }) => {
  return (
    <motion.div
      className="p-3 rounded-lg mb-2 cursor-pointer"
      style={{
        backgroundColor: revealed ? 'var(--color-primary)' : 'var(--color-surface)',
        opacity: revealed ? 1 : 0.8,
      }}
      whileHover={!revealed && !disabled ? { scale: 1.02 } : {}}
      whileTap={!revealed && !disabled ? { scale: 0.98 } : {}}
      onClick={() => !revealed && !disabled && onUse()}
    >
      {revealed ? (
        <div className="text-white">
          <Lightbulb size={16} className="inline mr-2" />
          {hint.text}
        </div>
      ) : (
        <div style={{ color: 'var(--color-text)' }}>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Lightbulb size={16} />
              Indice #{hint.cost / 10 - 1}
            </span>
            <span className="font-bold">-{hint.cost} pts</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export function DiagnosticDetective() {
  const { isFeminine } = useTheme();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'guessing' | 'result'>('intro');
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [guess, setGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [casesCompleted, setCasesCompleted] = useState(0);
  const [showLabResults, setShowLabResults] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    // Select a random case
    const randomCase = medicalCases[Math.floor(Math.random() * medicalCases.length)];
    setCurrentCase(randomCase);
    setGameState('playing');
    setRevealedHints([]);
    setScore(200); // Base score
    setTimeElapsed(0);
    setGuess('');
    setShowLabResults(false);
  };

  const handleUseHint = (index: number, cost: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
      setScore(Math.max(0, score - cost));
    }
  };

  const showLab = () => {
    setShowLabResults(true);
    setScore(Math.max(0, score - 30));
  };

  const submitGuess = () => {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedDiagnosis = currentCase.diagnosis.toLowerCase();

    setIsCorrect(normalizedGuess.includes(normalizedDiagnosis) ||
      normalizedDiagnosis.includes(normalizedGuess));

    // Calculate final score with time bonus
    const timeBonus = Math.max(0, 100 - timeElapsed);
    const finalScore = isCorrect ? score + timeBonus : 0;

    setScore(finalScore);
    setTotalScore(totalScore + finalScore);
    setCasesCompleted(casesCompleted + 1);
    setGameState('result');

    // Save score
    saveScore(finalScore);
  };

  const saveScore = async (finalScore: number) => {
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gameType: 'diagnostic_detective',
          score: finalScore,
          timeSpent: timeElapsed,
          difficulty: currentCase.difficulty,
          level: 1,
        }),
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/games')}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            <ChevronRight size={20} className="rotate-180" />
            Retour
          </button>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}>
              <Timer size={16} className="inline mr-2" />
              {formatTime(timeElapsed)}
            </div>

            <div className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}>
              <Trophy size={16} className="inline mr-2" />
              {score} pts
            </div>
          </div>
        </motion.div>

        {/* Game states */}
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Search size={80} className="mx-auto mb-6" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Diagnostic Detective {isFeminine ? '🔍💕' : '🔍'}
              </h1>
              <p className="text-lg mb-8" style={{ color: 'var(--color-textSecondary)' }}>
                Analysez les symptômes et trouvez le bon diagnostic
              </p>

              <div className="max-w-md mx-auto mb-8 text-left">
                <h3 className="font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                  Comment jouer :
                </h3>
                <ul className="space-y-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <li className="flex items-start gap-2">
                    <Stethoscope size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Lisez attentivement les symptômes du patient</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Utilisez des indices si nécessaire (coûte des points)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Consultez les résultats de laboratoire pour confirmer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Proposez votre diagnostic final</span>
                  </li>
                </ul>
              </div>

              <motion.button
                onClick={startGame}
                className="px-8 py-4 text-lg font-bold rounded-xl text-white"
                style={{
                  background: 'var(--gradient-magic)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Commencer l'enquête
              </motion.button>
            </motion.div>
          )}

          {gameState === 'playing' && currentCase && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient symptoms */}
                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: 'var(--color-text)' }}>
                    <Heart className="text-red-500" />
                    Présentation du patient
                  </h2>

                  <div className="space-y-3 mb-6">
                    {currentCase.symptoms.map((symptom: string, index: number) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Thermometer size={16} className="mt-1 flex-shrink-0 text-orange-500" />
                        <span style={{ color: 'var(--color-text)' }}>{symptom}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Lab results button */}
                  <motion.button
                    onClick={showLab}
                    disabled={showLabResults}
                    className="w-full py-3 rounded-lg font-medium mb-4"
                    style={{
                      backgroundColor: showLabResults ? 'var(--color-primary)' : 'var(--color-background)',
                      color: showLabResults ? 'white' : 'var(--color-text)',
                      opacity: showLabResults ? 1 : 0.9,
                    }}
                    whileHover={!showLabResults ? { scale: 1.02 } : {}}
                    whileTap={!showLabResults ? { scale: 0.98 } : {}}
                  >
                    <Activity size={16} className="inline mr-2" />
                    {showLabResults ? 'Résultats affichés' : 'Voir les analyses (-30 pts)'}
                  </motion.button>

                  {/* Lab results */}
                  <AnimatePresence>
                    {showLabResults && currentCase.labResults && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-lg mb-4"
                        style={{ backgroundColor: 'var(--color-background)' }}
                      >
                        <h3 className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                          Résultats de laboratoire :
                        </h3>
                        {Object.entries(currentCase.labResults).map(([test, result]) => (
                          <div key={test} className="flex justify-between py-1">
                            <span style={{ color: 'var(--color-textSecondary)' }}>{test}:</span>
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                              {result as string}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hints and diagnosis */}
                <div>
                  <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"
                      style={{ color: 'var(--color-text)' }}>
                      <Lightbulb className="text-yellow-500" />
                      Indices disponibles
                    </h2>

                    {currentCase.hints.map((hint: any, index: number) => (
                      <HintCard
                        key={index}
                        hint={hint}
                        onUse={() => handleUseHint(index, hint.cost)}
                        disabled={false}
                        revealed={revealedHints.includes(index)}
                      />
                    ))}
                  </div>

                  {/* Diagnosis input */}
                  <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                      Votre diagnostic
                    </h2>

                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Entrez votre diagnostic..."
                      className="w-full p-3 rounded-lg mb-4"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        border: '2px solid var(--color-border)',
                      }}
                    />

                    <motion.button
                      onClick={submitGuess}
                      disabled={!guess.trim()}
                      className="w-full py-3 rounded-lg font-bold text-white"
                      style={{
                        backgroundColor: guess.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                      whileHover={guess.trim() ? { scale: 1.02 } : {}}
                      whileTap={guess.trim() ? { scale: 0.98 } : {}}
                    >
                      Valider le diagnostic
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && currentCase && (
            <motion.div
              key="result"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                {isCorrect ? (
                  <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
                ) : (
                  <XCircle size={80} className="mx-auto mb-6 text-red-500" />
                )}
              </motion.div>

              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                {isCorrect ? `Excellent diagnostic ! ${isFeminine ? '🎉💕' : '🎉'}` : 'Diagnostic incorrect'}
              </h1>

              <div className="max-w-2xl mx-auto mb-8 p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="mb-6">
                  <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                    Diagnostic correct :
                  </p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {currentCase.diagnosis}
                  </p>
                </div>

                <div className="text-left mb-6 p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background)' }}>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    Explication :
                  </h3>
                  <p style={{ color: 'var(--color-textSecondary)' }}>
                    {currentCase.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      Score
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      Temps
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {formatTime(timeElapsed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      Indices utilisés
                    </p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {revealedHints.length}/{currentCase.hints.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Nouveau cas
                </motion.button>

                <motion.button
                  onClick={() => navigate('/games')}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Autres jeux
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default DiagnosticDetective;