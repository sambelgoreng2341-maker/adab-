import React, { useState } from 'react';
import { PUNISHMENT_ZONES, getCategoryColor } from '../data';
import { PointItem } from '../types';
import { ShieldAlert, BookOpen, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RulesProps {
  apiPointItems: PointItem[];
  rawRules: any[];
}

export const Rules: React.FC<RulesProps> = ({ apiPointItems, rawRules }) => {
  const [activeTab, setActiveTab] = useState<'points' | 'detailed' | 'zones'>('points');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Aturan & Poin Kedisiplinan</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Daftar lengkap aturan, poin pelanggaran, taubat, dan zona sanksi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl max-w-xl">
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'points'
              ? 'bg-white dark:bg-neutral-900 text-teal-700 dark:text-teal-400 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
          }`}
        >
          Katalog Poin
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'detailed'
              ? 'bg-white dark:bg-neutral-900 text-teal-700 dark:text-teal-400 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
          }`}
        >
          Aturan Rinci
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'zones'
              ? 'bg-white dark:bg-neutral-900 text-teal-700 dark:text-teal-400 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
          }`}
        >
          Zona Sanksi
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {activeTab === 'points' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Katalog Poin Pelanggaran & Taubat
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-md font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Item Pelanggaran (Penambahan Poin)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiPointItems.filter(item => item.type === 'Violation').map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex justify-between items-start gap-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white text-sm mb-1">{item.name}</p>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap">
                        +{item.points} Poin
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-teal-700 dark:text-teal-400 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Item Taubat (Pengurangan Poin)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiPointItems.filter(item => item.type === 'Taubat').map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex justify-between items-start gap-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white text-sm mb-1">{item.name}</p>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap">
                        -{item.points} Poin
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="p-0">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Daftar Aturan Rinci & Hukuman Mendidik
              </h2>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {rawRules.map((rule, idx) => (
                <div key={idx} className="p-6 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {rule['Kategori (BAB)']}
                        </span>
                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Kelas {rule['Klasifikasi']}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white leading-relaxed">
                        {rule['Larangan / Pelanggaran']}
                      </h3>
                      <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Hukuman Mendidik (Bentuk Taubat):</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{rule['Bentuk Taubat (Hukuman Mendidik)']}</p>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-3 justify-start min-w-[140px]">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-3 rounded-xl flex flex-col items-center justify-center flex-1">
                        <span className="text-xs font-semibold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider mb-1">Poin Pelanggaran</span>
                        <span className="text-xl font-bold text-red-700 dark:text-red-400">+{rule['Poin Pelanggaran']}</span>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 p-3 rounded-xl flex flex-col items-center justify-center flex-1">
                        <span className="text-xs font-semibold text-teal-600/70 dark:text-teal-400/70 uppercase tracking-wider mb-1">Pengurangan Poin</span>
                        <span className="text-xl font-bold text-teal-700 dark:text-teal-400">{rule['Pengurangan Poin Taubat']}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Sistem Zona Sanksi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PUNISHMENT_ZONES.map((zone, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border-2 ${zone.color} ${zone.bgColor} flex flex-col h-full`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-bold text-lg ${zone.textColor}`}>Zona {zone.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold bg-white/50 dark:bg-black/20 ${zone.textColor}`}>
                      {zone.minPoints} - {zone.maxPoints === 9999 ? '∞' : zone.maxPoints} Pts
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className={`text-sm font-medium leading-relaxed ${zone.textColor} opacity-90`}>
                      {zone.punishment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 flex gap-4">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Informasi Akumulasi Poin</h4>
                <p className="text-sm text-blue-800 dark:text-blue-400/80 leading-relaxed">
                  Poin pelanggaran diakumulasikan selama santri berada di pesantren. Santri dapat mengurangi poin pelanggaran mereka dengan melakukan aktivitas yang bernilai Taubat sesuai dengan tabel hukuman mendidik. Zona sanksi ditentukan berdasarkan total poin akhir yang dimiliki santri.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
