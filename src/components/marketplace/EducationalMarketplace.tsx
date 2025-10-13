import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Star, TrendingUp, Award, Download,
  Eye, Heart, Share2, Filter, Search, Grid, List,
  DollarSign, Package, Clock, Users, BookOpen,
  FileText, Video, Mic, Image, ChevronRight,
  Check, X, AlertCircle, Zap, Crown, Shield,
  BarChart3, PieChart, Briefcase, GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Product {
  id: string;
  title: string;
  description: string;
  type: 'notes' | 'course' | 'quiz' | 'case' | 'video' | 'audio';
  author: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    verified: boolean;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  price: number;
  originalPrice?: number;
  currency: 'DZD' | 'EUR';
  rating: number;
  reviews: number;
  sales: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  preview?: string;
  downloadable: boolean;
  license: 'personal' | 'commercial' | 'extended';
  revenueSplit: number; // Percentage for author (70%)
}

interface MarketplaceStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  topSellers: Product[];
  userEarnings: number;
  pendingPayouts: number;
}

export const EducationalMarketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Pack Complet Anatomie - Système Cardiovasculaire',
      description: 'Notes détaillées + Schémas HD + Quiz interactifs pour maîtriser le système cardiovasculaire',
      type: 'notes',
      author: {
        id: '1',
        name: 'Dr. Sarah Martin',
        rating: 4.9,
        verified: true,
        level: 'platinum'
      },
      price: 2500,
      originalPrice: 3500,
      currency: 'DZD',
      rating: 4.8,
      reviews: 234,
      sales: 1250,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      tags: ['Anatomie', 'Cardiovasculaire', 'P2', 'Best-seller'],
      downloadable: true,
      license: 'personal',
      revenueSplit: 70
    },
    {
      id: '2',
      title: 'Cas Cliniques ECNi - Cardiologie (50 cas)',
      description: '50 cas cliniques corrigés et commentés pour préparer les ECNi efficacement',
      type: 'case',
      author: {
        id: '2',
        name: 'Prof. Michel Bernard',
        rating: 4.7,
        verified: true,
        level: 'gold'
      },
      price: 3800,
      currency: 'DZD',
      rating: 4.6,
      reviews: 156,
      sales: 892,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date(),
      tags: ['ECNi', 'Cardiologie', 'Cas cliniques', 'D4'],
      downloadable: true,
      license: 'personal',
      revenueSplit: 70
    },
    {
      id: '3',
      title: 'Vidéo Cours - Sémiologie Respiratoire Complète',
      description: '8h de vidéos HD avec démonstrations pratiques de l\'examen clinique respiratoire',
      type: 'video',
      author: {
        id: '3',
        name: 'Dr. Marie Dubois',
        rating: 4.9,
        verified: true,
        level: 'silver'
      },
      price: 4500,
      originalPrice: 6000,
      currency: 'DZD',
      rating: 4.9,
      reviews: 312,
      sales: 567,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date(),
      tags: ['Sémiologie', 'Respiratoire', 'Vidéo', 'D3'],
      downloadable: false,
      license: 'commercial',
      revenueSplit: 70
    }
  ]);

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price' | 'rating'>('popular');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);

  const stats: MarketplaceStats = {
    totalSales: 2709,
    totalRevenue: 8950000,
    totalProducts: 342,
    topSellers: products.slice(0, 3),
    userEarnings: 1250000,
    pendingPayouts: 450000
  };

  const typeIcons = {
    notes: FileText,
    course: BookOpen,
    quiz: GraduationCap,
    case: Briefcase,
    video: Video,
    audio: Mic
  };

  const addToCart = (productId: string) => {
    setCart([...cart, productId]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(id => id !== productId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Marketplace Éducatif Dr.MiMi 🛍️
              </h1>
              <p className="text-gray-600 text-sm">
                Achetez et vendez du contenu médical de qualité
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>

              {/* Cart */}
              <button className="relative p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Seller Dashboard */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard Vendeur
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
          >
            <h2 className="text-xl font-bold mb-4">
              Tableau de Bord Vendeur 📊
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <DollarSign className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{(stats.userEarnings / 1000).toFixed(0)}k</p>
                <p className="text-sm opacity-90">Revenus totaux (DZD)</p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <TrendingUp className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">70%</p>
                <p className="text-sm opacity-90">Votre part (revenue sharing)</p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <Package className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm opacity-90">Produits en vente</p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <Users className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">458</p>
                <p className="text-sm opacity-90">Clients</p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <Clock className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{(stats.pendingPayouts / 1000).toFixed(0)}k</p>
                <p className="text-sm opacity-90">Paiement en attente</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Prochain paiement</p>
                  <p className="text-lg font-semibold">15 Novembre 2024</p>
                </div>
                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                  Voir les détails →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Sorting */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="notes">Notes</option>
                <option value="course">Cours</option>
                <option value="quiz">Quiz</option>
                <option value="case">Cas cliniques</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Plus populaires</option>
              <option value="newest">Plus récents</option>
              <option value="price">Prix croissant</option>
              <option value="rating">Meilleure note</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={view === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {products.map((product, idx) => {
            const Icon = typeIcons[product.type];
            const inCart = cart.includes(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition ${
                  view === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image/Icon */}
                <div className={`relative ${
                  view === 'list' ? 'w-48' : 'h-48'
                } bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center`}>
                  <Icon className="w-16 h-16 text-blue-600" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {product.originalPrice && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    )}
                    {product.sales > 1000 && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full block">
                        Best-seller
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition">
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition">
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className={`p-4 ${view === 'list' ? 'flex-1' : ''}`}>
                  {/* Author */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{product.author.name}</span>
                    {product.author.verified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                    {product.author.level === 'platinum' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.sales} ventes
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-800">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">{product.currency}</span>
                      </div>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.originalPrice.toLocaleString()} {product.currency}
                        </span>
                      )}
                    </div>

                    {inCart ? (
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center space-x-2 hover:bg-green-600 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Ajouté</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700 transition"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>

                  {/* Revenue Split Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Revenue sharing: {product.revenueSplit}% auteur
                      </span>
                      {product.downloadable && (
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          Téléchargeable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <Award className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Devenez Vendeur sur Dr.MiMi Marketplace
          </h2>
          <p className="mb-6 opacity-90">
            Partagez vos connaissances et gagnez 70% sur chaque vente !
          </p>
          <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition">
            Commencer à vendre →
          </button>
        </div>
      </div>
    </div>
  );
};