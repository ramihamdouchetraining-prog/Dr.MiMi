import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Award, RotateCcw } from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  category: string;
  points: number;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  title: string;
  onComplete?: (score: number, results: QuizResult[]) => void;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number;
}

export function QuizComponent({ questions, title, onComplete }: QuizComponentProps) {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const timeSpent = Date.now() - startTime;
    const isCorrect = answerIndex === question.correctAnswer;
    
    const result: QuizResult = {
      questionId: question.id,
      selectedAnswer: answerIndex,
      correct: isCorrect,
      timeSpent
    };
    
    setResults(prev => [...prev, result]);
    
    if (isCorrect) {
      setScore(prev => prev + question.points);
    }
    
    setTimeout(() => setShowExplanation(true), 500);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete(score, results);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResults([]);
    setStartTime(Date.now());
    setIsCompleted(false);
    setScore(0);
  };

  const getAnswerColor = (index: number) => {
    if (selectedAnswer === null) return 'var(--color-surface)';
    if (index === question.correctAnswer) return '#10B981'; // Green for correct
    if (index === selectedAnswer && index !== question.correctAnswer) return '#EF4444'; // Red for wrong
    return 'var(--color-surface)';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return '#10B981';
      case 'moyen': return '#F59E0B';
      case 'difficile': return '#EF4444';
      default: return 'var(--color-primary)';
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const scorePercentage = (score / totalPoints) * 100;

  if (isCompleted) {
    return (
      <motion.div
        className="max-w-4xl mx-auto p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Award className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4">
            Quiz Terminé ! {emojis.heart}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {score}/{totalPoints}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Points obtenus
              </div>
            </div>
            
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {Math.round(scorePercentage)}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Score
              </div>
            </div>
            
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {results.filter(r => r.correct).length}/{questions.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Bonnes réponses
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={resetQuiz}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recommencer</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 rounded-2xl shadow-lg"
      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex items-center space-x-4">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
            >
              {question.difficulty}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Question {currentQuestion + 1}/{questions.length}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">{question.question}</h3>
            
            {question.image && (
              <div className="mb-6">
                <img
                  src={question.image}
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className="p-4 rounded-xl border-2 text-left transition-all duration-200"
                  style={{
                    backgroundColor: getAnswerColor(index),
                    borderColor: selectedAnswer === index ? 'var(--color-primary)' : 'var(--color-border)',
                    color: selectedAnswer !== null && 
                           (index === question.correctAnswer || index === selectedAnswer) 
                           ? 'white' : 'var(--color-text)'
                  }}
                  whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  disabled={selectedAnswer !== null}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-opacity-20 flex items-center justify-center font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {selectedAnswer !== null && index === question.correctAnswer && (
                      <CheckCircle className="w-5 h-5 ml-auto" />
                    )}
                    {selectedAnswer !== null && index === selectedAnswer && index !== question.correctAnswer && (
                      <XCircle className="w-5 h-5 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 mt-1" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <h4 className="font-medium mb-2">Explication</h4>
                    <p style={{ color: 'var(--color-textSecondary)' }}>
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={nextQuestion}
                className="px-8 py-3 rounded-xl font-medium text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
                {isFeminine ? ' 💕' : ' 🩺'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default QuizComponent;