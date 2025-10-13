import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Award, Activity } from 'lucide-react';

const AdminAnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/admin/overview')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Analytics Administrateur</h1>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Users className="w-8 h-8 text-teal-600 mb-3" />
                <p className="text-sm text-gray-600">Total Étudiants</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview?.totalStudents || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Activity className="w-8 h-8 text-blue-600 mb-3" />
                <p className="text-sm text-gray-600">Étudiants Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview?.activeStudents || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-sm text-gray-600">Performance Moyenne</p>
                <p className="text-3xl font-bold text-gray-900">{Number(data.overview?.averagePerformance || 0).toFixed(1)}%</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Award className="w-8 h-8 text-amber-600 mb-3" />
                <p className="text-sm text-gray-600">Quiz Complétés</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview?.totalQuizzesTaken || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Performers</h3>
                <div className="space-y-3">
                  {data.topPerformers?.slice(0, 5).map((student: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-800">#{i + 1} Étudiant</span>
                      <span className="font-bold text-green-600">{student.overallAverageScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Étudiants en Difficulté</h3>
                <div className="space-y-3">
                  {data.strugglingStudents?.slice(0, 5).map((student: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-gray-800">Étudiant ID</span>
                      <span className="font-bold text-red-600">{student.overallAverageScore}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Performance par Module</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.moduleStats?.slice(0, 10) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moduleId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageScore" fill="#0d9488" name="Score Moyen %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
