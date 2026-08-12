import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Share2, FileText, CheckCircle2, CircleDashed, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PointRecord, StudentSummary, ApiStudent } from '../types';
import { getZoneForPoints } from '../data';

type StudentReportProps = {
  records: PointRecord[];
  students: StudentSummary[];
  apiStudents: ApiStudent[];
};

export const StudentReport: React.FC<StudentReportProps> = ({ records, students, apiStudents }) => {
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [datePreset, setDatePreset] = useState('All');
  const [filterType, setFilterType] = useState<'All' | 'Violation' | 'Taubat'>('All');

  const selectedStudentSummary = useMemo(() => {
    return students.find(s => s.name === selectedStudentName) || null;
  }, [selectedStudentName, students]);

  const selectedStudentApiInfo = useMemo(() => {
    return apiStudents.find(s => s.nama === selectedStudentName) || null;
  }, [selectedStudentName, apiStudents]);

  const studentRecords = useMemo(() => {
    if (!selectedStudentName) return [];
    let recs = records.filter(r => r.studentName === selectedStudentName);
    
    // Apply type filter
    if (filterType !== 'All') {
      if (filterType === 'Violation') {
        recs = recs.filter(r => r.item.type === 'Violation');
      } else if (filterType === 'Taubat') {
        recs = recs.filter(r => r.assignedTaubat);
      }
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    recs = recs.filter(r => {
      const recordDate = new Date(r.timestamp);
      if (datePreset === 'Today') return recordDate >= today;
      if (datePreset === 'Week') {
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        return recordDate >= firstDay;
      }
      if (datePreset === 'Month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return recordDate >= firstDay;
      }
      if (datePreset === 'Semester') {
        const currentMonth = today.getMonth();
        const startMonth = currentMonth < 6 ? 0 : 6;
        const firstDay = new Date(today.getFullYear(), startMonth, 1);
        return recordDate >= firstDay;
      }
      if (datePreset === 'Year') {
        const firstDay = new Date(today.getFullYear(), 0, 1);
        return recordDate >= firstDay;
      }
      return true;
    });

    return recs;
  }, [records, selectedStudentName, filterType, datePreset]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const exportToPDF = () => {
    if (!selectedStudentName) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN KHUSUS SANTRI', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("Iska Qur'anic Boarding School", 105, 27, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Student Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Nama', 14, 42);
    doc.text(':', 35, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedStudentName, 40, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Kelas', 14, 49);
    doc.text(':', 35, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedStudentApiInfo?.kelas || '-', 40, 49);

    doc.setFont('helvetica', 'bold');
    doc.text('Asrama', 120, 42);
    doc.text(':', 140, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedStudentApiInfo?.kamar || '-', 145, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal Cetak', 120, 49);
    doc.text(':', 145, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date().toISOString()), 150, 49);

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 56, 182, 16, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Poin Pelanggaran Saat Ini:', 20, 66);
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`${selectedStudentSummary?.totalPoints || 0}`, 85, 66);
    doc.setTextColor(0, 0, 0);

    const tableData = studentRecords.map(r => [
      formatDate(r.timestamp),
      (r.item.code ? `[${r.item.code}] ` : '') + r.item.name,
      r.item.type === 'Violation' ? 'Pelanggaran' : 'Taubat',
      (r.item.type === 'Violation' ? '+' : '-') + r.item.points,
      r.assignedTaubat ? ((r.assignedTaubat.code ? `[${r.assignedTaubat.code}] ` : '') + r.assignedTaubat.name) : '-',
      r.status || '-'
    ]);

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: 80,
        head: [['Waktu', 'Aktivitas', 'Jenis', 'Poin', 'Tugas Taubat', 'Status']],
        body: tableData,
        styles: { 
          fontSize: 9,
          font: 'helvetica',
          cellPadding: 3,
        },
        headStyles: { 
          fillColor: [15, 23, 42],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          3: { halign: 'center' },
          5: { halign: 'center' }
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Tidak ada catatan aktivitas kedisiplinan yang ditemukan.', 14, 85);
    }

    doc.save(`Laporan_Santri_${selectedStudentName.replace(/\s+/g, '_')}.pdf`);
  };

  const exportToWA = () => {
    if (!selectedStudentName) return;
    let text = `*LAPORAN KHUSUS SANTRI*\n`;
    text += `Nama: ${selectedStudentName}\n`;
    text += `Asrama: ${selectedStudentApiInfo?.kamar || '-'}\n`;
    text += `Total Poin: ${selectedStudentSummary?.totalPoints || 0}\n`;
    text += `Dicetak pada: ${formatDate(new Date().toISOString())}\n\n`;
    
    studentRecords.forEach((r, i) => {
      text += `${i+1}. Waktu: ${formatDate(r.timestamp)}\n`;
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
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <FileText className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Laporan Khusus Santri</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Lihat dan cetak riwayat aktivitas untuk satu santri</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div className="mb-6">
          <label htmlFor="student-select" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Pilih Nama Santri
          </label>
          <div className="relative">
            <select
              id="student-select"
              value={selectedStudentName}
              onChange={(e) => setSelectedStudentName(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none appearance-none cursor-pointer text-neutral-900 dark:text-white"
            >
              <option value="" disabled className="bg-white dark:bg-neutral-900">Pilih santri...</option>
              {apiStudents.map((s, idx) => (
                <option key={idx} value={s.nama} className="bg-white dark:bg-neutral-900">
                  {s.nama} ({s.kelas} • {s.kamar})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {selectedStudentName && (
          <div className="space-y-6">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{selectedStudentName}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Asrama: {selectedStudentApiInfo?.kamar || '-'} • Kelas: {selectedStudentApiInfo?.kelas || '-'}</p>
                <div className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">Total Poin: {selectedStudentSummary?.totalPoints || 0}</div>
              </div>
              <div className="flex gap-2 self-start md:self-end">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button
                  onClick={exportToWA}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">Semua Waktu</option>
                <option value="Today">Hari Ini</option>
                <option value="Week">Minggu Ini</option>
                <option value="Month">Bulan Ini</option>
                <option value="Semester">Semester Ini</option>
                <option value="Year">Tahun Ini</option>
              </select>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">Semua Aktivitas</option>
                <option value="Violation">Pelanggaran</option>
                <option value="Taubat">Taubat</option>
              </select>
            </div>

            <div className="space-y-3">
              {studentRecords.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-100 dark:border-neutral-800 border-dashed">
                  <p className="text-neutral-500 dark:text-neutral-400">Tidak ada catatan aktivitas ditemukan.</p>
                </div>
              ) : (
                studentRecords.map((record) => {
                  const isViolation = record.item.type === 'Violation';
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs text-neutral-400 dark:text-neutral-500 mb-1">{formatDate(record.timestamp)}</div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {record.item.code ? `[${record.item.code}] ` : ''}{record.item.name}
                          </div>
                          {record.note && <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mt-1">"{record.note}"</div>}
                          <div className={`text-xs font-bold mt-2 ${isViolation ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}>
                            {isViolation ? '+' : '-'}{record.item.points} Poin
                          </div>
                        </div>
                      </div>
                      
                      {record.assignedTaubat && (
                        <div className="mt-3 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Tugas Taubat</div>
                          <div className="text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                            {record.status === 'Completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                            ) : (
                              <CircleDashed className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            )}
                            {record.assignedTaubat.code ? `[${record.assignedTaubat.code}] ` : ''}{record.assignedTaubat.name}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
