import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Filter, AlertCircle, ChevronDown, ChevronUp, ShieldAlert, Home, TrendingDown } from 'lucide-react';
import { StudentSummary } from '../types';
import { getStatusBadge, getZoneForPoints } from '../data';

type StudentListProps = {
  students: StudentSummary[];
};

export const StudentList: React.FC<StudentListProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [filterDormitory, setFilterDormitory] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const uniqueStudentNames = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.name));
    return Array.from(set).sort();
  }, [students]);

  const filteredSearchNames = uniqueStudentNames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  const uniqueDormitories = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.dormitory));
    return Array.from(set).sort();
  }, [students]);

  const uniqueClasses = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => s.kelas && set.add(s.kelas));
    return Array.from(set).sort();
  }, [students]);
  
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.dormitory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDorm = filterDormitory === 'All' || s.dormitory === filterDormitory;
    const matchesClass = filterClass === 'All' || s.kelas === filterClass;
    
    return matchesSearch && matchesDorm && matchesClass;
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const toggleExpand = (name: string) => {
    if (expandedStudent === name) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Data Santri & Zona Kedisiplinan</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Pantau akumulasi poin dan sanksi/taubat yang harus dijalani santri.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsStudentDropdownOpen(true)}
              className="block w-full pl-9 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
              placeholder="Cari santri..."
            />
            {isStudentDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsStudentDropdownOpen(false)}></div>
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800 overflow-hidden max-h-64 overflow-y-auto">
                  {filteredSearchNames.length > 0 ? (
                    <>
                      <div
                        className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-50 dark:border-neutral-800 cursor-pointer text-sm text-neutral-900 dark:text-neutral-200 font-medium"
                        onClick={() => { setSearchTerm(''); setIsStudentDropdownOpen(false); }}
                      >
                        Semua Santri
                      </div>
                      {filteredSearchNames.map((name, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-50 dark:border-neutral-800 last:border-0 cursor-pointer text-sm text-neutral-900 dark:text-neutral-200"
                          onClick={() => { setSearchTerm(name); setIsStudentDropdownOpen(false); }}
                        >
                          {name}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">Tidak ada santri ditemukan</div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="All">Semua Kelas</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterDormitory}
            onChange={(e) => setFilterDormitory(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="All">Semua Asrama</option>
            {uniqueDormitories.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-neutral-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Santri & Asrama</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Poin</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Aktivitas Terakhir</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status Zona</th>
                <th scope="col" className="px-6 py-4 relative"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const status = getStatusBadge(student.totalPoints);
                  const zone = getZoneForPoints(student.totalPoints);
                  const isExpanded = expandedStudent === student.name;
                  
                  return (
                    <React.Fragment key={student.name}>
                      <motion.tr 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-neutral-50/50 dark:bg-neutral-800/50' : ''}`}
                        onClick={() => toggleExpand(student.name)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold ${zone.bgColor} ${zone.textColor} ${zone.color} dark:border-neutral-700`}>
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-neutral-900 dark:text-white">{student.name}</div>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                <Home className="w-3 h-3" />
                                {student.dormitory}
                                {student.kelas && <span className="ml-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-medium text-neutral-600 dark:text-neutral-300">{student.kelas}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold border ${zone.bgColor} ${zone.textColor} ${zone.color} dark:border-neutral-700`}>
                            {student.totalPoints} Pts
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-600 dark:text-neutral-300">
                            {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </div>
                          <div className="flex gap-2 mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                            <span>{student.incidentCount} Pelanggaran</span>
                            <span>•</span>
                            <span>{student.taubatCount} Taubat</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={5} className="px-6 py-4 bg-neutral-50/80 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700">
                              <div className="flex gap-4 items-start max-w-4xl">
                                <div className={`p-3 rounded-xl border ${zone.bgColor} ${zone.color} ${zone.textColor} dark:border-neutral-700`}>
                                  {zone.name === 'Hijau' ? <AlertCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {zone.name === 'Hijau' ? 'Status Aman' : `Sanksi / Bentuk Taubat (${zone.name})`}
                                  </h4>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                    {zone.punishment}
                                  </p>
                                  {zone.name !== 'Drop Out' && zone.name !== 'Hijau' && (
                                    <div className="mt-3 p-3 rounded-lg border border-teal-100 dark:border-teal-900/30 bg-teal-50 dark:bg-teal-900/10 flex items-start gap-2">
                                      <TrendingDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                      <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                                        Untuk kembali ke zona yang lebih aman, santri dapat melakukan aktivitas "Taubat" yang tersedia di sistem untuk mengurangi poin.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <User className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-3" />
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-300">Tidak ada data santri ditemukan</p>
                      <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
