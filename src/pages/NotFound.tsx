// 404 Not Found Page
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Dr.MiMi Avatar - Confused */}
        <div className="mb-8">
          <div className="w-40 h-40 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-8xl shadow-2xl">
            😕
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Page Introuvable
        </h2>

        {/* Message */}
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Désolé, Dr.MiMi ne trouve pas cette page 😔<br />
          Elle a peut-être été déplacée ou supprimée.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Accueil
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Search className="w-5 h-5" />
            Rechercher
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Liens Rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200"
            >
              <div className="text-3xl mb-2">📚</div>
              <div className="text-sm font-semibold text-gray-700">Cours</div>
            </button>
            
            <button
              onClick={() => navigate('/quiz')}
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200"
            >
              <div className="text-3xl mb-2">✏️</div>
              <div className="text-sm font-semibold text-gray-700">Quiz</div>
            </button>
            
            <button
              onClick={() => navigate('/cases')}
              className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200"
            >
              <div className="text-3xl mb-2">🩺</div>
              <div className="text-sm font-semibold text-gray-700">Cas Cliniques</div>
            </button>
            
            <button
              onClick={() => navigate('/news')}
              className="p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-all duration-200"
            >
              <div className="text-3xl mb-2">📰</div>
              <div className="text-sm font-semibold text-gray-700">Actualités</div>
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Besoin d'aide ? Contactez le{' '}
          <button
            onClick={() => navigate('/support')}
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            support technique
          </button>
        </p>
      </div>
    </div>
  );
}
