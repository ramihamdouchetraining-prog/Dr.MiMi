import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, GripVertical, Image, Upload, Sparkles,
  Brain, Clock, Target, Award, AlertCircle, CheckCircle,
  Save, Eye, Wand2, Copy, Download, Share2, Settings,
  ChevronDown, ChevronUp, HelpCircle, Zap, Star
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Question {
  id: string;
  question: string;
  questionEn?: string;
  questionAr?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  explanationEn?: string;
  explanationAr?: string;
  image?: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  points: number;
  timeLimit?: number;
}

interface QuizCreatorProps {
  onClose: () => void;
  onSave: (quiz: any) => void;
}

export function QuizCreator({ onClose, onSave }: QuizCreatorProps) {
  const { t, language } = useLanguage();
  
  // États du quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  
  // États des questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'moyen',
      points: 10
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Questions, 3: Settings, 4: Preview
  const [expandedQuestion, setExpandedQuestion] = useState<string>('1');
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // Catégories médicales
  const categories = [
    { id: 'anatomy', name: 'Anatomie', icon: '🫀', color: 'from-red-500 to-pink-500' },
    { id: 'physiology', name: 'Physiologie', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    { id: 'pharmacology', name: 'Pharmacologie', icon: '💊', color: 'from-green-500 to-emerald-500' },
    { id: 'pathology', name: 'Pathologie', icon: '🔬', color: 'from-purple-500 to-indigo-500' },
    { id: 'cardiology', name: 'Cardiologie', icon: '❤️', color: 'from-pink-500 to-rose-500' },
    { id: 'neurology', name: 'Neurologie', icon: '🧠', color: 'from-blue-500 to-cyan-500' },
    { id: 'pediatrics', name: 'Pédiatrie', icon: '👶', color: 'from-teal-500 to-green-500' },
    { id: 'surgery', name: 'Chirurgie', icon: '🔪', color: 'from-gray-600 to-gray-800' },
  ];

  // Ajouter une question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'moyen',
      points: 10
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  // Supprimer une question
  const deleteQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Dupliquer une question
  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        question: questionToDuplicate.question + ' (copie)'
      };
      setQuestions([...questions, newQuestion]);
    }
  };

  // Mettre à jour une question
  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // Mettre à jour une option
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  // Ajouter une option
  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.options.length < 6
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  // Supprimer une option
  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.options.length > 2
        ? { 
            ...q, 
            options: q.options.filter((_, idx) => idx !== optionIndex),
            correctAnswer: q.correctAnswer >= optionIndex ? Math.max(0, q.correctAnswer - 1) : q.correctAnswer
          }
        : q
    ));
  };

  // Suggestions AI (simulée)
  const generateAISuggestions = async (questionId: string) => {
    setAiSuggesting(true);
    
    // Simulation d'une génération AI
    setTimeout(() => {
      const suggestions = [
        "Le cœur est composé de combien de cavités ?",
        "Quelle est la fonction principale des poumons ?",
        "Combien de chromosomes possède une cellule humaine normale ?"
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      updateQuestion(questionId, 'question', randomSuggestion);
      setAiSuggesting(false);
    }, 1500);
  };

  // Sauvegarder le quiz
  const handleSave = () => {
    const quizData = {
      title: quizTitle,
      description: quizDescription,
      category,
      difficulty,
      timeLimit,
      passingScore,
      randomizeQuestions,
      showExplanations,
      isPublic,
      questions: questions.filter(q => q.question.trim() !== ''),
      createdAt: new Date().toISOString()
    };
    
    onSave(quizData);
  };

  // Validation
  const isStepValid = (step: number) => {
    switch(step) {
      case 1:
        return quizTitle.trim() !== '' && category !== '';
      case 2:
        return questions.some(q => q.question.trim() !== '' && q.options.some(opt => opt.trim() !== ''));
      case 3:
        return true;
      default:
        return true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Créateur de Quiz Intelligent</h2>
                <p className="text-purple-100 text-sm">Créez des quiz interactifs en quelques minutes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Informations', icon: Brain },
              { num: 2, label: 'Questions', icon: Target },
              { num: 3, label: 'Paramètres', icon: Settings },
              { num: 4, label: 'Aperçu', icon: Eye }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentStep === step.num
                      ? 'bg-white text-purple-600 shadow-lg scale-105'
                      : currentStep > step.num
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-purple-200'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                  {currentStep > step.num && <CheckCircle className="w-4 h-4" />}
                </button>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.num ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6">
          <AnimatePresence mode="wait">
            {/* Étape 1: Informations */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Titre du quiz */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Titre du Quiz *
                  </label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Ex: Quiz Anatomie du Système Cardiovasculaire"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-800 dark:text-white transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Décrivez brièvement le contenu de ce quiz..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-800 dark:text-white transition-all resize-none"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Catégorie *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          category === cat.id
                            ? `bg-gradient-to-br ${cat.color} text-white border-transparent shadow-lg scale-105`
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <div className="text-sm font-medium">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Niveau de difficulté
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'facile', label: 'Facile', color: 'from-green-500 to-emerald-500', icon: '😊' },
                      { value: 'moyen', label: 'Moyen', color: 'from-yellow-500 to-orange-500', icon: '🤔' },
                      { value: 'difficile', label: 'Difficile', color: 'from-red-500 to-pink-500', icon: '😰' }
                    ].map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() => setDifficulty(diff.value as any)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          difficulty === diff.value
                            ? `bg-gradient-to-br ${diff.color} text-white border-transparent shadow-lg`
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{diff.icon}</div>
                        <div className="text-sm font-medium">{diff.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Questions */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Question Header */}
                    <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg font-bold">
                          #{qIndex + 1}
                        </div>
                        <button
                          onClick={() => setExpandedQuestion(expandedQuestion === question.id ? '' : question.id)}
                          className="flex-1 text-left font-medium text-gray-900 dark:text-white"
                        >
                          {question.question || `Question ${qIndex + 1}`}
                        </button>
                        {expandedQuestion === question.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => generateAISuggestions(question.id)}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 transition-colors"
                          title="Suggestion IA"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateQuestion(question.id)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          disabled={questions.length === 1}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Content */}
                    {expandedQuestion === question.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 space-y-4"
                      >
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                            placeholder="Entrez votre question ici..."
                            rows={2}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:bg-gray-900 dark:text-white transition-all resize-none"
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Options de réponse
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === optIndex}
                                  onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                                  className="w-5 h-5 text-green-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:bg-gray-900 dark:text-white transition-all"
                                />
                                {question.options.length > 2 && (
                                  <button
                                    onClick={() => removeOption(question.id, optIndex)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {question.options.length < 6 && (
                            <button
                              onClick={() => addOption(question.id)}
                              className="mt-2 flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter une option</span>
                            </button>
                          )}
                        </div>

                        {/* Explanation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Explication (optionnel)
                          </label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                            placeholder="Expliquez pourquoi cette réponse est correcte..."
                            rows={2}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:bg-gray-900 dark:text-white transition-all resize-none"
                          />
                        </div>

                        {/* Points & Difficulty */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Points
                            </label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 10)}
                              min="1"
                              max="100"
                              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:bg-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Difficulté
                            </label>
                            <select
                              value={question.difficulty}
                              onChange={(e) => updateQuestion(question.id, 'difficulty', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:bg-gray-900 dark:text-white"
                            >
                              <option value="facile">Facile</option>
                              <option value="moyen">Moyen</option>
                              <option value="difficile">Difficile</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* Add Question Button */}
                <button
                  onClick={addQuestion}
                  className="w-full p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                >
                  <div className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Ajouter une question</span>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Étape 3: Paramètres */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Temps limite */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Temps limite (minutes)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                      min="5"
                      max="180"
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Score de passage */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Award className="w-4 h-4 inline mr-2" />
                      Score de passage (%)
                    </label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Options avancées */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Options avancées
                  </h3>

                  {[
                    {
                      id: 'random',
                      label: 'Ordre aléatoire des questions',
                      description: 'Les questions seront affichées dans un ordre différent pour chaque participant',
                      checked: randomizeQuestions,
                      onChange: setRandomizeQuestions
                    },
                    {
                      id: 'explanations',
                      label: 'Afficher les explications',
                      description: 'Montrer les explications après chaque réponse',
                      checked: showExplanations,
                      onChange: setShowExplanations
                    },
                    {
                      id: 'public',
                      label: 'Quiz public',
                      description: 'Rendre ce quiz accessible à tous les utilisateurs',
                      checked: isPublic,
                      onChange: setIsPublic
                    }
                  ].map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <input
                        type="checkbox"
                        checked={option.checked}
                        onChange={(e) => option.onChange(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded mt-1"
                      />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Étape 4: Aperçu */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Quiz Header Preview */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{quizTitle || 'Titre du quiz'}</h2>
                  <p className="text-purple-100 mb-4">{quizDescription || 'Description du quiz'}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      📚 {category || 'Catégorie'}
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      ⭐ {difficulty}
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      ⏱️ {timeLimit} min
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      📝 {questions.filter(q => q.question.trim()).length} questions
                    </div>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Aperçu des questions
                  </h3>
                  {questions.filter(q => q.question.trim()).map((question, idx) => (
                    <div key={question.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="flex-1 font-medium text-gray-900 dark:text-white">
                          {question.question}
                        </p>
                      </div>
                      
                      <div className="space-y-2 ml-11">
                        {question.options.filter(opt => opt.trim()).map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`px-3 py-2 rounded-lg ${
                              question.correctAnswer === optIdx
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {option}
                            {question.correctAnswer === optIdx && (
                              <CheckCircle className="w-4 h-4 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="ml-11 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            💡 {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Précédent
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Étape {currentStep}/4
            </span>
          </div>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Sauvegarder le quiz</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* AI Suggesting Overlay */}
      {aiSuggesting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
            <Wand2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              ✨ Génération de suggestion IA...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
