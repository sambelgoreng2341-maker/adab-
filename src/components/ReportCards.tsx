import React, { useState, useMemo } from 'react';
import { Printer, Download, Share2, ChevronDown, ChevronUp, FileText, CheckCircle2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PointRecord, StudentSummary, ApiStudent } from '../types';

type ReportCardsProps = {
  records: PointRecord[];
  students: StudentSummary[];
  apiStudents: ApiStudent[];
};

export const ReportCards: React.FC<ReportCardsProps> = ({ records, students, apiStudents }) => {
  const [filterName, setFilterName] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [filterKamar, setFilterKamar] = useState('All');
  const [filterKelas, setFilterKelas] = useState('All');
  const [datePreset, setDatePreset] = useState('All');
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savedIndicator, setSavedIndicator] = useState<Record<string, boolean>>({});
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);

  const uniqueStudentNames = useMemo(() => {
    return Array.from(new Set(apiStudents.map(s => s.nama))).filter(Boolean).sort();
  }, [apiStudents]);

  const filteredSearchNames = uniqueStudentNames.filter(name => name.toLowerCase().includes(filterName.toLowerCase()));

  const uniqueKamar = useMemo(() => {
    return Array.from(new Set(apiStudents.map(s => s.kamar))).filter(Boolean).sort();
  }, [apiStudents]);

  const uniqueKelas = useMemo(() => {
    return Array.from(new Set(apiStudents.map(s => s.kelas))).filter(Boolean).sort();
  }, [apiStudents]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return records.filter(r => {
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
  }, [records, datePreset]);

  const studentReports = useMemo(() => {
    return apiStudents
      .filter(s => {
        const matchKamar = filterKamar === 'All' || s.kamar === filterKamar;
        const matchKelas = filterKelas === 'All' || s.kelas === filterKelas;
        const matchName = !filterName || s.nama.toLowerCase().includes(filterName.toLowerCase());
        return matchKamar && matchKelas && matchName;
      })
      .map(student => {
        const studentRecords = filteredRecords.filter(r => r.studentName === student.nama);
        let periodPoints = 0;
        studentRecords.forEach(r => {
          if (r.item.type === 'Violation') periodPoints += r.item.points;
          else periodPoints -= r.item.points;
        });
        periodPoints = Math.max(0, periodPoints);
        
        return {
          ...student,
          periodPoints,
          studentRecords
        };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [apiStudents, filterKamar, filterKelas, filteredRecords]);

  const generatePDF = () => {
    if (studentReports.length === 0) return;
    
    const doc = new jsPDF();
    let isFirstPage = true;

    studentReports.forEach((report) => {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RAPOR KEDISIPLINAN SANTRI', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Pondok Pesantren', 105, 27, { align: 'center' });

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(14, 32, 196, 32);

      // Student Info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Nama', 14, 42);
      doc.text(':', 35, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(report.nama, 40, 42);

      doc.setFont('helvetica', 'bold');
      doc.text('Kelas', 14, 49);
      doc.text(':', 35, 49);
      doc.setFont('helvetica', 'normal');
      doc.text(report.kelas || '-', 40, 49);

      doc.setFont('helvetica', 'bold');
      doc.text('Asrama', 120, 42);
      doc.text(':', 140, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(report.kamar || '-', 145, 42);

      doc.setFont('helvetica', 'bold');
      doc.text('Periode', 120, 49);
      doc.text(':', 140, 49);
      doc.setFont('helvetica', 'normal');
      doc.text(datePreset === 'All' ? 'Semua Waktu' : datePreset, 145, 49);

      // Summary Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 56, 182, 16, 'FD');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Poin Pelanggaran:', 20, 66);
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text(`${report.periodPoints}`, 65, 66);
      doc.setTextColor(0, 0, 0); // reset color

      const tableData = report.studentRecords.map(r => [
        new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(r.timestamp)),
        (r.item.code ? `[${r.item.code}] ` : '') + r.item.name,
        r.item.type === 'Violation' ? 'Pelanggaran' : 'Taubat',
        (r.item.type === 'Violation' ? '+' : '-') + r.item.points,
        r.status || '-'
      ]);

      if (tableData.length > 0) {
        autoTable(doc, {
          startY: 80,
          head: [['Tanggal', 'Aktivitas', 'Jenis', 'Poin', 'Status']],
          body: tableData,
          styles: { 
            fontSize: 10,
            font: 'helvetica',
            cellPadding: 4,
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
            4: { halign: 'center' }
          }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Tidak ada catatan aktivitas kedisiplinan pada periode ini.', 14, 85);
      }

      // Signatures
      let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 90;
      
      const note = studentNotes[report.nama];
      if (note) {
        if (finalY + 30 > 280) {
          doc.addPage();
          finalY = 20;
        } else {
          finalY += 10;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Catatan:', 14, finalY);
        doc.setFont('helvetica', 'normal');
        
        const splitNote = doc.splitTextToSize(note, 182);
        doc.text(splitNote, 14, finalY + 5);
        
        finalY += 5 + (splitNote.length * 5);
      }
      
      let sigY = finalY + 20;
      if (sigY + 30 > 280) {
        doc.addPage();
        sigY = 30;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Mengetahui,', 14, sigY);
      doc.text('Wali Santri / Orang Tua', 14, sigY + 5);
      doc.text('Pengurus Kesantrian', 140, sigY + 5);
      
      doc.line(14, sigY + 25, 55, sigY + 25);
      doc.line(140, sigY + 25, 186, sigY + 25);
    });

    doc.save(`Rapot_Kedisiplinan_${filterKelas === 'All' ? 'SemuaKelas' : filterKelas}_${filterKamar === 'All' ? 'SemuaAsrama' : filterKamar}.pdf`);
  };

  const exportSingleToPDF = (report: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPOR KEDISIPLINAN SANTRI', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Pondok Pesantren', 105, 27, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Student Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Nama', 14, 42);
    doc.text(':', 35, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(report.nama, 40, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Kelas', 14, 49);
    doc.text(':', 35, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(report.kelas || '-', 40, 49);

    doc.setFont('helvetica', 'bold');
    doc.text('Asrama', 120, 42);
    doc.text(':', 140, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(report.kamar || '-', 145, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Periode', 120, 49);
    doc.text(':', 140, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(datePreset === 'All' ? 'Semua Waktu' : datePreset, 145, 49);

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 56, 182, 16, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Poin Pelanggaran:', 20, 66);
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`${report.periodPoints}`, 65, 66);
    doc.setTextColor(0, 0, 0); // reset color

    const tableData = report.studentRecords.map((r: any) => [
      new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(r.timestamp)),
      (r.item.code ? `[${r.item.code}] ` : '') + r.item.name,
      r.item.type === 'Violation' ? 'Pelanggaran' : 'Taubat',
      (r.item.type === 'Violation' ? '+' : '-') + r.item.points,
      r.status || '-'
    ]);

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: 80,
        head: [['Tanggal', 'Aktivitas', 'Jenis', 'Poin', 'Status']],
        body: tableData,
        styles: { 
          fontSize: 10,
          font: 'helvetica',
          cellPadding: 4,
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
          4: { halign: 'center' }
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Tidak ada catatan aktivitas kedisiplinan pada periode ini.', 14, 85);
    }

    // Signatures
    let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 90;
    
    const note = studentNotes[report.nama];
    if (note) {
      if (finalY + 30 > 280) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 10;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Catatan:', 14, finalY);
      doc.setFont('helvetica', 'normal');
      
      const splitNote = doc.splitTextToSize(note, 182);
      doc.text(splitNote, 14, finalY + 5);
      
      finalY += 5 + (splitNote.length * 5);
    }
    
    let sigY = finalY + 20;
    if (sigY + 30 > 280) {
      doc.addPage();
      sigY = 30;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Mengetahui,', 14, sigY);
    doc.text('Wali Santri / Orang Tua', 14, sigY + 5);
    doc.text('Pengurus Kesantrian', 140, sigY + 5);
    
    doc.line(14, sigY + 25, 55, sigY + 25);
    doc.line(140, sigY + 25, 186, sigY + 25);
    
    doc.save(`Rapot_Kedisiplinan_${report.nama.replace(/\s+/g, '_')}.pdf`);
  };

  const exportSingleToWA = (report: any) => {
    let text = `*RAPOR KEDISIPLINAN SANTRI*\n`;
    text += `Nama: ${report.nama}\n`;
    text += `Kelas/Asrama: ${report.kelas || '-'} / ${report.kamar || '-'}\n`;
    text += `Periode: ${datePreset === 'All' ? 'Semua Waktu' : datePreset}\n`;
    text += `*Total Poin Pelanggaran: ${report.periodPoints}*\n\n`;
    
    if (report.studentRecords.length === 0) {
      text += `_Tidak ada catatan aktivitas pada periode ini._\n\n`;
    } else {
      text += `*Rincian Aktivitas:*\n`;
      report.studentRecords.forEach((r: any, i: number) => {
        const dateStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(r.timestamp));
        text += `${i+1}. ${dateStr}\n`;
        text += `   ${r.item.code ? `[${r.item.code}] ` : ''}${r.item.name}\n`;
        text += `   Poin: ${r.item.type === 'Violation' ? '+' : '-'}${r.item.points} (${r.item.type === 'Violation' ? 'Pelanggaran' : 'Taubat'})\n`;
      });
      text += `\n`;
    }

    if (studentNotes[report.nama]) {
      text += `*Catatan:*\n${studentNotes[report.nama]}\n\n`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSaveNote = (studentName: string) => {
    setStudentNotes(prev => ({ ...prev, [studentName]: draftNotes[studentName] || '' }));
    setSavedIndicator(prev => ({ ...prev, [studentName]: true }));
    setTimeout(() => {
      setSavedIndicator(prev => ({ ...prev, [studentName]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <Printer className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Cetak Rapot Santri</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Cetak rapot kedisiplinan santri secara massal berdasarkan kelas dan asrama</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Cari Nama</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onFocus={() => setIsStudentDropdownOpen(true)}
              placeholder="Ketik untuk mencari..."
              className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none text-neutral-900 dark:text-white"
            />
            {isStudentDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsStudentDropdownOpen(false)}></div>
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800 overflow-hidden max-h-64 overflow-y-auto">
                  {filteredSearchNames.length > 0 ? (
                    <>
                      <div
                        className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-50 dark:border-neutral-800 cursor-pointer text-sm text-neutral-900 dark:text-neutral-200 font-medium"
                        onClick={() => { setFilterName(''); setIsStudentDropdownOpen(false); }}
                      >
                        Semua Hasil
                      </div>
                      {filteredSearchNames.map((name, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-50 dark:border-neutral-800 last:border-0 cursor-pointer text-sm text-neutral-900 dark:text-neutral-200"
                          onClick={() => { setFilterName(name); setIsStudentDropdownOpen(false); }}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Filter Kelas</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none text-neutral-900 dark:text-white"
            >
              <option value="All" className="bg-white dark:bg-neutral-900">Semua Kelas</option>
              {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Filter Asrama</label>
            <select
              value={filterKamar}
              onChange={(e) => setFilterKamar(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none text-neutral-900 dark:text-white"
            >
              <option value="All" className="bg-white dark:bg-neutral-900">Semua Asrama</option>
              {uniqueKamar.map(k => <option key={k} value={k} className="bg-white dark:bg-neutral-900">{k}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Periode Waktu</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none text-neutral-900 dark:text-white"
            >
              <option value="All" className="bg-white dark:bg-neutral-900">Semua Waktu</option>
              <option value="Today" className="bg-white dark:bg-neutral-900">Hari Ini</option>
              <option value="Week" className="bg-white dark:bg-neutral-900">Minggu Ini</option>
              <option value="Month" className="bg-white dark:bg-neutral-900">Bulan Ini</option>
              <option value="Semester" className="bg-white dark:bg-neutral-900">Semester Ini</option>
              <option value="Year" className="bg-white dark:bg-neutral-900">Tahun Ini</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="text-teal-600 dark:text-teal-400 font-bold">{studentReports.length}</span> Santri ditemukan
          </p>
          
          <button
            onClick={generatePDF}
            disabled={studentReports.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white dark:text-neutral-900 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Cetak Rapot Massal (PDF)
          </button>
        </div>
      </div>

      {studentReports.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Preview Data yang Akan Dicetak</h3>
            <span className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full font-medium">
              Pratinjau
            </span>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {studentReports.map((report, idx) => {
              const isExpanded = expandedPreview === report.nama;
              
              return (
              <div key={idx} className="p-0 transition-colors">
                <div 
                  className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 ${isExpanded ? 'bg-neutral-50/50 dark:bg-neutral-800/50' : ''}`}
                  onClick={() => setExpandedPreview(isExpanded ? null : report.nama)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-neutral-900 dark:text-white text-lg">{report.nama}</h4>
                      {studentNotes[report.nama] && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Ada Catatan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Kelas: {report.kelas || '-'} • Asrama: {report.kamar || '-'}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Poin:</span>
                      <span className={`text-sm font-bold ${report.periodPoints > 0 ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        {report.periodPoints}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">({report.studentRecords.length} aktivitas)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSingleToWA(report);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
                      title="Kirim ke WA"
                    >
                      <Share2 className="w-4 h-4" />
                      WA
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSingleToPDF(report);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <div className="p-2 text-neutral-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                    >
                      <div className="p-6 md:p-10 bg-neutral-50/30 dark:bg-neutral-800/30">
                        {/* Realistic Preview Form */}
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-8 bg-white dark:bg-neutral-900 shadow-sm max-w-4xl mx-auto font-sans">
                           <div className="text-center mb-8 border-b border-neutral-200 dark:border-neutral-700 pb-6">
                              <h2 className="text-2xl font-bold uppercase tracking-wider mb-2 dark:text-white">Rapor Kedisiplinan Santri</h2>
                              <p className="text-neutral-600 dark:text-neutral-400 font-medium">Pondok Pesantren</p>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                              <div>
                                 <div className="grid grid-cols-3 mb-2"><span className="font-bold text-neutral-700 dark:text-neutral-300">Nama</span><span className="col-span-2 font-medium text-neutral-900 dark:text-white">: {report.nama}</span></div>
                                 <div className="grid grid-cols-3"><span className="font-bold text-neutral-700 dark:text-neutral-300">Kelas</span><span className="col-span-2 font-medium text-neutral-900 dark:text-white">: {report.kelas || '-'}</span></div>
                              </div>
                              <div>
                                 <div className="grid grid-cols-3 mb-2"><span className="font-bold text-neutral-700 dark:text-neutral-300">Asrama</span><span className="col-span-2 font-medium text-neutral-900 dark:text-white">: {report.kamar || '-'}</span></div>
                                 <div className="grid grid-cols-3"><span className="font-bold text-neutral-700 dark:text-neutral-300">Periode</span><span className="col-span-2 font-medium text-neutral-900 dark:text-white">: {datePreset === 'All' ? 'Semua Waktu' : datePreset}</span></div>
                              </div>
                           </div>
                           
                           <div className="bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700 p-5 rounded-xl flex justify-between items-center mb-8">
                              <span className="font-bold text-neutral-800 dark:text-neutral-200">Total Poin Pelanggaran:</span>
                              <span className="text-red-600 dark:text-red-400 font-bold text-2xl">{report.periodPoints}</span>
                           </div>

                           <table className="w-full text-sm mb-8 border-collapse border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                              <thead className="bg-slate-900 dark:bg-black text-white">
                                <tr>
                                   <th className="p-3 border border-slate-700 dark:border-neutral-800 text-left font-semibold">Tanggal</th>
                                   <th className="p-3 border border-slate-700 dark:border-neutral-800 text-left font-semibold">Aktivitas</th>
                                   <th className="p-3 border border-slate-700 dark:border-neutral-800 text-center font-semibold">Jenis</th>
                                   <th className="p-3 border border-slate-700 dark:border-neutral-800 text-center font-semibold">Poin</th>
                                   <th className="p-3 border border-slate-700 dark:border-neutral-800 text-center font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-neutral-900">
                                 {report.studentRecords.length === 0 ? (
                                    <tr><td colSpan={5} className="p-6 text-center italic text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">Tidak ada catatan aktivitas kedisiplinan pada periode ini.</td></tr>
                                 ) : (
                                    report.studentRecords.map((r: any, i: number) => (
                                      <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(r.timestamp))}</td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-medium text-neutral-900 dark:text-white">{r.item.code ? `[${r.item.code}] ` : ''}{r.item.name}</td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-700 text-center">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${r.item.type === 'Violation' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'}`}>
                                            {r.item.type === 'Violation' ? 'Pelanggaran' : 'Taubat'}
                                          </span>
                                        </td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-700 text-center font-bold text-neutral-700 dark:text-neutral-300">{r.item.type === 'Violation' ? '+' : '-'}{r.item.points}</td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-700 text-center text-neutral-600 dark:text-neutral-400">{r.status || '-'}</td>
                                      </tr>
                                    ))
                                 )}
                              </tbody>
                           </table>

                           {/* Note input */}
                           <div className="mb-8">
                              <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Catatan Tambahan (Akan dicetak)</label>
                              <div className="relative">
                                <textarea
                                   value={draftNotes[report.nama] !== undefined ? draftNotes[report.nama] : (studentNotes[report.nama] || '')}
                                   onChange={(e) => setDraftNotes({...draftNotes, [report.nama]: e.target.value})}
                                   className="w-full p-4 pb-14 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-teal-500/20 outline-none text-sm bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white resize-none"
                                   rows={3}
                                   placeholder="Tambahkan catatan khusus untuk santri ini (misal: teguran, apresiasi, dsb)..."
                                ></textarea>
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                  {savedIndicator[report.nama] && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Tersimpan
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleSaveNote(report.nama)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    Simpan Catatan
                                  </button>
                                </div>
                              </div>
                           </div>
                           
                           {/* Signatures */}
                           <div className="flex justify-between text-sm pt-8 px-8 border-t border-neutral-200 dark:border-neutral-700">
                              <div className="text-center">
                                 <p className="mb-20 text-neutral-600 dark:text-neutral-400">Mengetahui,</p>
                                 <p className="font-medium text-neutral-900 dark:text-white">Wali Santri / Orang Tua</p>
                              </div>
                              <div className="text-center">
                                 <p className="mb-20 text-neutral-600 dark:text-neutral-400">Pengurus Kesantrian</p>
                                 <p className="font-medium text-neutral-900 dark:text-white">_______________________</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
