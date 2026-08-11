import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Trash2, Home, History, CheckCircle2, CircleDashed, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PointRecord } from '../types';
import { getCategoryColor } from '../data';

type HistoryListProps = {
  records: PointRecord[];
  onDeleteRecord: (id: string) => void;
  onCompleteTaubat: (id: string) => void;
  onClearAll: () => void;
};

export const HistoryList: React.FC<HistoryListProps> = ({ records, onDeleteRecord, onCompleteTaubat, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Violation' | 'Taubat'>('All');
  const [filterDormitory, setFilterDormitory] = useState('All');
  const [datePreset, setDatePreset] = useState('All');

  const uniqueStudentNames = React.useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => set.add(r.studentName));
    return Array.from(set).sort();
  }, [records]);

  const filteredSearchNames = uniqueStudentNames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  const uniqueDormitories = React.useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => set.add(r.dormitory));
    return Array.from(set).sort();
  }, [records]);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.dormitory.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesType = true;
    if (filterType === 'Violation') {
      matchesType = r.item.type === 'Violation';
    } else if (filterType === 'Taubat') {
      matchesType = !!r.assignedTaubat;
    }

    const matchesDormitory = filterDormitory === 'All' || r.dormitory === filterDormitory;
    
    let matchesDate = true;
    const recordDate = new Date(r.timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (datePreset === 'Today') {
      if (recordDate < today) matchesDate = false;
    } else if (datePreset === 'Week') {
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay());
      if (recordDate < firstDay) matchesDate = false;
    } else if (datePreset === 'Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      if (recordDate < firstDay) matchesDate = false;
    } else if (datePreset === 'Semester') {
      const currentMonth = today.getMonth();
      const startMonth = currentMonth < 6 ? 0 : 6;
      const firstDay = new Date(today.getFullYear(), startMonth, 1);
      if (recordDate < firstDay) matchesDate = false;
    } else if (datePreset === 'Year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      if (recordDate < firstDay) matchesDate = false;
    }

    return matchesSearch && matchesType && matchesDormitory && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Laporan Riwayat Aktivitas Santri', 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${formatDate(new Date().toISOString())}`, 14, 22);

    const tableData = filteredRecords.map(r => [
      formatDate(r.timestamp),
      r.studentName,
      r.dormitory,
      (r.item.code ? `[${r.item.code}] ` : '') + r.item.name,
      r.item.type === 'Violation' ? 'Pelanggaran' : 'Taubat',
      (r.item.type === 'Violation' ? '+' : '-') + r.item.points,
      r.assignedTaubat ? ((r.assignedTaubat.code ? `[${r.assignedTaubat.code}] ` : '') + r.assignedTaubat.name) : '-',
      r.status || '-'
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Waktu', 'Santri', 'Asrama', 'Aktivitas', 'Jenis', 'Poin', 'Tugas Taubat', 'Status']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save('Riwayat_Aktivitas_Santri.pdf');
  };

  const exportToWA = () => {
    let text = `*LAPORAN RIWAYAT AKTIVITAS SANTRI*\n`;
    text += `Dicetak pada: ${formatDate(new Date().toISOString())}\n\n`;
    
    filteredRecords.forEach((r, i) => {
      text += `${i+1}. *${r.studentName}* (${r.dormitory})\n`;
      text += `   Waktu: ${formatDate(r.timestamp)}\n`;
      text += `   Aktivitas: ${r.item.code ? `[${r.item.code}] ` : ''}${r.item.name}\n`;
      text += `   Poin: ${r.item.type === 'Violation' ? '+' : '-'}${r.item.points}\n`;
      if (r.assignedTaubat) {
        text += `   Tugas Taubat: ${r.assignedTaubat.name} (${r.status})\n`;
      }
      text += `\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Riwayat Aktivitas</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Log aktivitas pelanggaran dan taubat santri.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsStudentDropdownOpen(true)}
              className="block w-full pl-9 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
              placeholder="Cari santri, asrama, kegiatan..."
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
                        Semua Hasil
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
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="All">Semua Waktu</option>
            <option value="Today">Hari Ini</option>
            <option value="Week">Minggu Ini</option>
            <option value="Month">Bulan Ini</option>
            <option value="Semester">Semester Ini</option>
            <option value="Year">Tahun Ini</option>
          </select>

          <select
            value={filterDormitory}
            onChange={(e) => setFilterDormitory(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="All">Semua Asrama</option>
            {uniqueDormitories.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="All">Semua Aktivitas</option>
            <option value="Violation">Pelanggaran</option>
            <option value="Taubat">Daftar Tugas Taubat (Checklist)</option>
          </select>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={onClearAll}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua
            </button>
            <button
              onClick={exportToPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={exportToWA}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Waktu Kejadian</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Santri & Asrama</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Aktivitas</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/80 dark:divide-neutral-800/80">
              <AnimatePresence>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const isViolation = record.item.type === 'Violation';
                    return (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                        className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                            {formatDate(record.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white">{record.studentName}</div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <Home className="w-3 h-3" />
                            {record.dormitory}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap uppercase tracking-wider ${isViolation && record.item.category ? getCategoryColor(record.item.category) : 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800/50 text-teal-700 dark:text-teal-300'}`}>
                                {isViolation ? record.item.category : 'Taubat'}
                              </div>
                              <div>
                                <div className="text-sm text-neutral-800 dark:text-neutral-200 font-medium">
                                  {record.item.code ? `[${record.item.code}] ` : ''}{record.item.name}
                                </div>
                                {record.note && <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 italic">"{record.note}"</div>}
                                <div className={`text-xs font-bold mt-1.5 ${isViolation ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}>
                                  {isViolation ? '+' : '-'}{record.item.points} Poin
                                </div>
                              </div>
                            </div>
                            
                            {/* Taubat Assignment Section */}
                            {record.assignedTaubat && (
                              <div className="mt-2 ml-14 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">Tugas Taubat <span className="text-neutral-300 dark:text-neutral-600 font-mono">#{record.id.substring(0,6)}</span></div>
                                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                    {record.status === 'Completed' ? (
                                      <CheckCircle2 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                                    ) : (
                                      <CircleDashed className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                    )}
                                    {record.assignedTaubat.code ? `[${record.assignedTaubat.code}] ` : ''}{record.assignedTaubat.name}
                                  </div>
                                </div>
                                
                                {record.status === 'Pending' ? (
                                  <button
                                    onClick={() => onCompleteTaubat(record.id)}
                                    className="px-3 py-1.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                  >
                                    Tandai Selesai
                                  </button>
                                ) : (
                                  <span className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/30 text-xs font-bold rounded-lg whitespace-nowrap">
                                    Tuntas
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Hapus catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <History className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-3" />
                        <p className="font-medium text-neutral-900 dark:text-neutral-300">Tidak ada riwayat aktivitas ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
