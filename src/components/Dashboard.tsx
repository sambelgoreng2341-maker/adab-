import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, ShieldAlert, AlertTriangle, ArrowUpRight, TrendingUp, Home, Trophy } from 'lucide-react';
import { PointRecord, StudentSummary, ZoneType } from '../types';
import { getZoneForPoints, PUNISHMENT_ZONES } from '../data';

type DashboardProps = {
  records: PointRecord[];
  students: StudentSummary[];
  setActiveTab: (tab: string) => void;
};

export const Dashboard: React.FC<DashboardProps> = ({ records, students, setActiveTab }) => {
  const violations = records.filter(r => r.item.type === 'Violation');
  const totalIncidents = violations.length;
  
  // Accumulated points for the whole school (just sum of positive minus negative? or just sum of all active student points)
  const totalPoints = students.reduce((sum, s) => sum + s.totalPoints, 0);
  
  const studentsWithPoints = students.filter(s => s.totalPoints > 0).length;

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    violations.forEach(r => {
      counts[r.item.name] = (counts[r.item.name] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 violations
  }, [violations]);

  const dormData = useMemo(() => {
    const dormSet = new Set<string>();
    students.forEach(s => dormSet.add(s.dormitory));
    const uniqueDorms = Array.from(dormSet);
    
    return uniqueDorms.map(dorm => {
      const dormStudents = students.filter(s => s.dormitory === dorm);
      const points = dormStudents.reduce((sum, s) => sum + s.totalPoints, 0);
      return { name: dorm, points };
    }).sort((a, b) => b.points - a.points);
  }, [students]);

  const topViolators = useMemo(() => {
    return [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5).filter(s => s.totalPoints > 0);
  }, [students]);

  const asramaTeladan = useMemo(() => {
    if (dormData.length === 0) return null;
    return dormData[dormData.length - 1]; // The one with lowest points (since dormData is sorted descending)
  }, [dormData]);

  const zoneDistribution = useMemo(() => {
    const counts = {} as Record<ZoneType, number>;
    PUNISHMENT_ZONES.forEach(z => counts[z.name] = 0);
    
    students.forEach(s => {
      if (s.totalPoints > 0) {
        const zone = getZoneForPoints(s.totalPoints);
        counts[zone.name]++;
      }
    });
    
    return PUNISHMENT_ZONES.map(z => ({
      ...z,
      count: counts[z.name]
    })).filter(z => z.count > 0 || z.name !== 'Hijau'); // Show even if 0, except maybe hide some, but let's show all for clarity
  }, [students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Ringkasan status kebersihan dan zona kedisiplinan santri.</p>
        </div>
        <button 
          onClick={() => setActiveTab('record')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-teal-500 transition-colors shadow-sm w-full sm:w-auto"
        >
          <ShieldAlert className="w-4 h-4" />
          Catat Aktivitas
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_20px_rgb(0,0,0,0.02)]">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Kasus Pelanggaran</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{totalIncidents}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_20px_rgb(0,0,0,0.02)]">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Akumulasi Poin Aktif</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{totalPoints}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_20px_rgb(0,0,0,0.02)]">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Santri Terlibat</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{studentsWithPoints} <span className="text-base font-normal text-neutral-400">santri</span></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-teal-100 dark:border-teal-800/50 shadow-[0_2px_20px_rgb(20,184,166,0.1)] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 dark:bg-teal-900/20 rounded-full opacity-50 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 border border-teal-100/50 dark:border-teal-800/50">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Asrama Teladan (Poin Terendah)</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{asramaTeladan ? asramaTeladan.name : '-'}</p>
            {asramaTeladan && (
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">{asramaTeladan.points} Poin Pelanggaran</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
        {/* Zone Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_20px_rgb(0,0,0,0.02)] xl:col-span-3">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Distribusi Zona Santri</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {zoneDistribution.map((zone) => (
              <div key={zone.name} className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${zone.bgColor} ${zone.color}`}>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold uppercase tracking-wider ${zone.textColor}`}>Zona {zone.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-bold ${zone.textColor}`}>{zone.count}</span>
                  <span className={`text-xs ${zone.textColor} opacity-80`}>santri</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_20px_rgb(0,0,0,0.02)] xl:col-span-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Poin Tertinggi per Asrama</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dormData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--tw-prose-body)' }}
                  formatter={(value) => [`${value} Pts`, 'Total Poin']}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {dormData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#fca5a5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Violators */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-neutral-900 p-6 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_20px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Santri Perhatian Khusus</h3>
            <button onClick={() => setActiveTab('students')} className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 p-1">
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {topViolators.length > 0 ? (
              topViolators.map((student, i) => {
                const zone = getZoneForPoints(student.totalPoints);
                return (
                  <div key={student.name} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border border-neutral-100/50 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shadow-sm ${zone.bgColor} ${zone.textColor} ${zone.color} dark:border-neutral-700`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1">{student.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${zone.textColor}`}>Zona {zone.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {student.totalPoints} Pts
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
               <div className="py-10 text-center text-neutral-400 dark:text-neutral-500 text-sm">Semua santri dalam status aman.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
