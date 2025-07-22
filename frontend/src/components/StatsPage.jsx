import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";
import { TrendingUp, ImageIcon, Tag, BarChart3, ArrowLeft, Sparkles } from "lucide-react";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function StatsPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChart, setActiveChart] = useState('bar');

  // Simuliamo dei dati per la demo
  useEffect(() => {
    setTimeout(() => {
      const mockImages = [
        { tags: ['natura', 'paesaggio', 'montagna'] },
        { tags: ['città', 'architettura', 'moderno'] },
        { tags: ['natura', 'fiori', 'primavera'] },
        { tags: ['paesaggio', 'tramonto', 'natura'] },
        { tags: ['cibo', 'ricetta', 'italiano'] },
        { tags: ['città', 'notte', 'luci'] },
        { tags: ['animali', 'cane', 'domestici'] },
        { tags: ['natura', 'bosco', 'alberi'] },
        { tags: ['arte', 'museo', 'cultura'] },
        { tags: ['viaggio', 'vacanza', 'estate'] }
      ];
      setImages(mockImages);
      setLoading(false);
    }, 1000);
  }, []);

  const tagStats = useMemo(() => {
    const tagCount = {};
    images.forEach(img => {
      if (img.tags && img.tags.length > 0) {
        img.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    return tagCount;
  }, [images]);

  const totalImages = images.length;
  const totalTags = Object.keys(tagStats).length;
  const avgTagsPerImage = totalImages > 0 ? (images.reduce((acc, img) => acc + (img.tags ? img.tags.length : 0), 0) / totalImages).toFixed(2) : 0;

  const sortedTags = Object.entries(tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const colors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
    '#EF4444', '#EC4899', '#6366F1', '#84CC16'
  ];

  const barData = {
    labels: sortedTags.map(([tag]) => tag),
    datasets: [{
      label: "Frequenza Tag",
      data: sortedTags.map(([_, count]) => count),
      backgroundColor: colors,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels: sortedTags.map(([tag]) => tag),
    datasets: [{
      data: sortedTags.map(([_, count]) => count),
      backgroundColor: colors,
      borderWidth: 3,
      borderColor: '#1f2937',
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#6b7280' }
      },
      y: { 
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: { color: '#6b7280' },
        beginAtZero: true 
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
      }
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
              <p className="text-lg text-gray-600">Caricamento delle statistiche...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Errore nel caricamento</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna immagine trovata</h3>
              <p className="text-gray-600">Carica alcune immagini per vedere le statistiche.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Torna alla Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Statistiche
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <ImageIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{totalImages}</div>
                <div className="text-sm text-gray-500">+12% questo mese</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Immagini Totali</h3>
            <p className="text-gray-600 text-sm">Collezione completa</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{totalTags}</div>
                <div className="text-sm text-gray-500">Tag unici</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tag Totali</h3>
            <p className="text-gray-600 text-sm">Categorie diverse</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{avgTagsPerImage}</div>
                <div className="text-sm text-gray-500">Media ottimale</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tag per Immagine</h3>
            <p className="text-gray-600 text-sm">Classificazione media</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Analisi Tag Popolari</h2>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveChart('bar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeChart === 'bar' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grafico a Barre
                </button>
                <button
                  onClick={() => setActiveChart('doughnut')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeChart === 'doughnut' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grafico a Ciambella
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="h-96 mb-6">
              {activeChart === 'bar' ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              )}
            </div>

            {/* Tag List */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Classifica Tag</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sortedTags.map(([tag, count], index) => (
                  <div 
                    key={tag} 
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: colors[index] }}
                      ></div>
                      <span className="font-semibold text-gray-900 capitalize">{tag}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600 bg-white px-2 py-1 rounded-lg">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Statistiche aggiornate in tempo reale • Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>
    </div>
  );
}