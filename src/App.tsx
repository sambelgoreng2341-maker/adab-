/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { StudentReport } from './components/StudentReport';
import { ReportCards } from './components/ReportCards';
import { RecordForm } from './components/RecordForm';
import { HistoryList } from './components/HistoryList';
import { Rules } from './components/Rules';
import { PointRecord, StudentSummary, ApiStudent, PointItem } from './types';
import { MOCK_SANTRI, MOCK_PELANGGARAN } from './data';
import { Menu, BookOpen } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycby0kWcycE3LXmehymFdlpQ0X0aS_A-L1sl6WxuGKHZGsI35ODpFqKNYUiyyXuNTzFyD/exec';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // API Data
  const [apiStudents, setApiStudents] = useState<ApiStudent[]>([]);
  const [apiPointItems, setApiPointItems] = useState<PointItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  // Initialize Dark Mode
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingApi(true);
      try {
        const response = await fetch(`${API_URL}?action=getData`);
        const result = await response.json();
        
        const santriRes = result.status === 'success' && result.data.students && result.data.students.length > 0 
          ? result.data.students 
          : MOCK_SANTRI;
          
        const pelanggaranRes = result.status === 'success' && result.data.rules && result.data.rules.length > 0
          ? result.data.rules
          : MOCK_PELANGGARAN;

        const recordsRes = result.status === 'success' && result.data.records && result.data.records.length > 0
          ? result.data.records
          : null;
          
        if (recordsRes) {
          setRecords(recordsRes);
        }
        
        setApiStudents(santriRes);
        
        const items: PointItem[] = [];
        pelanggaranRes.forEach((p: any, index: number) => {
          // Generate a pair of Violation and Taubat based on the row
          const vId = `v_${index}`;
          const tId = `t_${index}`;
          const codeStr = (index + 1).toString().padStart(2, '0');
          const vCode = `A${codeStr}`;
          const tCode = `T${codeStr}`;
          
          const taubatName = p['Bentuk Taubat (Hukuman Mendidik)']?.trim() || 'Tidak ada tindakan taubat khusus';
          const taubatPoints = Math.abs(parseInt(String(p['Pengurangan Poin Taubat'] || 0), 10));
          
          if (taubatPoints > 0) {
            items.push({
              id: tId,
              code: tCode,
              name: taubatName,
              points: taubatPoints,
              category: p['Kategori (BAB)'],
              klasifikasi: p['Klasifikasi'],
              type: 'Taubat'
            });
          }
          
          items.push({
            id: vId,
            code: vCode,
            name: p['Larangan / Pelanggaran'],
            points: parseInt(String(p['Poin Pelanggaran'] || 0), 10),
            category: p['Kategori (BAB)'],
            klasifikasi: p['Klasifikasi'],
            type: 'Violation',
            defaultTaubatId: taubatPoints > 0 ? tId : undefined
          });
        });
        
        setApiPointItems(items);
      } catch (error) {
        console.error('Error loading API data, falling back to mock:', error);
        
        // Fallback to mock data
        setApiStudents(MOCK_SANTRI);
        const items: PointItem[] = [];
        MOCK_PELANGGARAN.forEach((p: any, index: number) => {
          const vId = `v_${index}`;
          const tId = `t_${index}`;
          const codeStr = (index + 1).toString().padStart(2, '0');
          const vCode = `A${codeStr}`;
          const tCode = `T${codeStr}`;
          
          const taubatName = p['Bentuk Taubat (Hukuman Mendidik)']?.trim() || 'Tidak ada tindakan taubat khusus';
          const taubatPoints = Math.abs(parseInt(String(p['Pengurangan Poin Taubat'] || 0), 10));
          
          if (taubatPoints > 0) {
            items.push({
              id: tId, code: tCode, name: taubatName, points: taubatPoints, category: p['Kategori (BAB)'], klasifikasi: p['Klasifikasi'], type: 'Taubat'
            });
          }
          items.push({
            id: vId, code: vCode, name: p['Larangan / Pelanggaran'], points: parseInt(String(p['Poin Pelanggaran'] || 0), 10), category: p['Kategori (BAB)'], klasifikasi: p['Klasifikasi'], type: 'Violation', defaultTaubatId: taubatPoints > 0 ? tId : undefined
          });
        });
        setApiPointItems(items);
      } finally {
        setIsLoadingApi(false);
      }
    };
    
    fetchData();
  }, []);

  // Load from local storage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('santri_points_v3');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse records');
      }
    }
  }, []);

  // Save to local storage whenever records change
  useEffect(() => {
    localStorage.setItem('santri_points_v3', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (record: Omit<PointRecord, 'id' | 'timestamp'>) => {
    setRecords(prev => [{
      ...record,
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    }, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    if(window.confirm('Yakin ingin menghapus catatan ini?')) {
      setRecords(prev => prev.filter((r) => r.id !== id));
    }
  };

  const handleCompleteTaubat = (violationId: string) => {
    setRecords(prev => {
      const violation = prev.find(r => r.id === violationId);
      if (!violation || !violation.assignedTaubat || violation.status === 'Completed') return prev;

      const taubatRecord: PointRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        studentName: violation.studentName,
        dormitory: violation.dormitory,
        item: violation.assignedTaubat,
        note: `Penyelesaian Taubat otomatis untuk pelanggaran: ${violation.item.name}`,
        relatedViolationId: violation.id,
      };

      return prev.map(r => r.id === violationId ? { ...r, status: 'Completed' } : r).concat(taubatRecord);
    });
  };

  // Derive students summary from records
  const studentsSummary = useMemo(() => {
    const summaryMap = new Map<string, StudentSummary>();
    
    // Initialize with all students from API
    apiStudents.forEach(s => {
      summaryMap.set(s.nama, {
        name: s.nama,
        kelas: s.kelas,
        dormitory: s.kamar,
        totalPoints: 0,
        incidentCount: 0,
        taubatCount: 0,
        lastActivity: ''
      });
    });

    // Process from oldest to newest to ensure points don't drop below 0 at any given time
    // though the simplest is just sum it up and max(0, sum) at the end.
    // For better accuracy, we should track running total per student.
    const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedRecords.forEach(record => {
      const name = record.studentName;
      if (!summaryMap.has(name)) {
        summaryMap.set(name, {
          name,
          dormitory: record.dormitory,
          totalPoints: 0,
          incidentCount: 0,
          taubatCount: 0,
          lastActivity: record.timestamp
        });
      }
      const student = summaryMap.get(name)!;
      
      if (record.item.type === 'Violation') {
        student.totalPoints += record.item.points;
        student.incidentCount += 1;
      } else if (record.item.type === 'Taubat') {
        student.totalPoints = Math.max(0, student.totalPoints - record.item.points);
        student.taubatCount += 1;
      }

      if (!student.lastActivity || new Date(record.timestamp) > new Date(student.lastActivity)) {
        student.lastActivity = record.timestamp;
      }
    });

    return Array.from(summaryMap.values());
  }, [records]);

  if (isLoadingApi) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-900 border-t-teal-600 dark:border-t-teal-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-medium animate-pulse">Menghubungkan ke database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 font-sans text-neutral-800 dark:text-neutral-200 flex flex-col lg:flex-row selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900/50 dark:selection:text-teal-100 transition-colors duration-200">
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full max-w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center border border-teal-100/50 dark:border-teal-800/50">
              <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">Kedisiplinan</h1>
          </div>
          <button 
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard records={records} students={studentsSummary} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'students' && (
            <StudentList students={studentsSummary} />
          )}
          {activeTab === 'student_report' && (
            <StudentReport records={records} students={studentsSummary} apiStudents={apiStudents} />
          )}
          {activeTab === 'rapot' && (
            <ReportCards records={records} students={studentsSummary} apiStudents={apiStudents} />
          )}
          {activeTab === 'record' && (
            <RecordForm onAddRecord={handleAddRecord} apiPointItems={apiPointItems} apiStudents={apiStudents} />
          )}
          {activeTab === 'history' && (
            <HistoryList records={records} onDeleteRecord={handleDeleteRecord} onCompleteTaubat={handleCompleteTaubat} />
          )}
          {activeTab === 'rules' && (
            <Rules />
          )}
        </div>
        </div>
      </main>
    </div>
  );
}

