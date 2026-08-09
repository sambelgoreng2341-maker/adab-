import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Users, AlertTriangle, FileText, CheckCircle2, Home, HeartHandshake, X } from 'lucide-react';
import { PointItem, PointRecord, Dormitory, ApiStudent } from '../types';
import { getCategoryColor } from '../data';

type RecordFormProps = {
  onAddRecord: (record: Omit<PointRecord, 'id' | 'timestamp'>) => void;
  apiPointItems: PointItem[];
  apiStudents: ApiStudent[];
};

export const RecordForm: React.FC<RecordFormProps> = ({ onAddRecord, apiPointItems, apiStudents }) => {
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [currentStudentInput, setCurrentStudentInput] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [recordType, setRecordType] = useState<'Violation' | 'Taubat'>('Violation');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [assignedTaubatId, setAssignedTaubatId] = useState('');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    apiPointItems.forEach(item => {
      if (item.type === recordType && item.category) {
        cats.add(item.category);
      }
    });
    return ['All', ...Array.from(cats)].sort();
  }, [apiPointItems, recordType]);

  const availableItems = apiPointItems.filter(item => 
    item.type === recordType && 
    (selectedCategory === 'All' || item.category === selectedCategory)
  );
  
  const selectedItem = apiPointItems.find(v => v.id === selectedItemId);
  const recommendedTaubats = selectedItem ? apiPointItems.filter(t => t.id === selectedItem.defaultTaubatId) : [];

  // Reset assigned taubat when item changes
  React.useEffect(() => {
    if (selectedItem?.defaultTaubatId) {
      setAssignedTaubatId(selectedItem.defaultTaubatId);
    } else {
      setAssignedTaubatId('');
    }
  }, [selectedItemId, selectedItem]);

  const filteredStudents = React.useMemo(() => {
    if (!currentStudentInput) return apiStudents;
    return apiStudents.filter(s => s.nama.toLowerCase().includes(currentStudentInput.toLowerCase()));
  }, [apiStudents, currentStudentInput]);

  const toggleStudent = (name: string) => {
    if (studentNames.includes(name)) {
      setStudentNames(studentNames.filter(n => n !== name));
    } else {
      setStudentNames([...studentNames, name]);
    }
  };

  const handleRemoveStudent = (name: string) => {
    setStudentNames(studentNames.filter(n => n !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentNames.length === 0 && !currentStudentInput.trim()) return;
    if (!selectedItemId) return;

    const item = apiPointItems.find((v) => v.id === selectedItemId);
    if (!item) return;

    const assignedTaubat = assignedTaubatId ? apiPointItems.find(t => t.id === assignedTaubatId) : undefined;
    
    const finalStudents = [...studentNames];
    
    if (finalStudents.length === 0) return;

    finalStudents.forEach(name => {
      // Automatically find dorm from selected student
      const matchedStudent = apiStudents.find(s => s.nama === name);
      const finalDormitory = matchedStudent ? matchedStudent.kamar : 'Tidak Diketahui';

      onAddRecord({
        studentName: name,
        dormitory: finalDormitory,
        item,
        note: note.trim() || undefined,
        assignedTaubat,
        status: assignedTaubat ? 'Pending' : undefined,
      });
    });

    // Reset and show success
    setStudentNames([]);
    setCurrentStudentInput('');
    setSelectedItemId('');
    setAssignedTaubatId('');
    setNote('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Catat Aktivitas</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Masukkan detail pelanggaran kedisiplinan atau aktivitas taubat santri.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-neutral-100 dark:border-neutral-800 p-8"
      >
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 p-4 rounded-xl border border-teal-100 dark:border-teal-800/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <p className="text-sm font-medium">Catatan aktivitas berhasil disimpan ke dalam sistem.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-4 p-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl w-full sm:w-max mx-auto mb-8">
            <button
              type="button"
              onClick={() => { setRecordType('Violation'); setSelectedCategory('All'); setSelectedItemId(''); }}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${recordType === 'Violation' ? 'bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-sm border border-neutral-200/50 dark:border-neutral-700' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Pelanggaran
            </button>
            <button
              type="button"
              onClick={() => { setRecordType('Taubat'); setSelectedCategory('All'); setSelectedItemId(''); }}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${recordType === 'Taubat' ? 'bg-white dark:bg-neutral-900 text-teal-600 dark:text-teal-400 shadow-sm border border-neutral-200/50 dark:border-neutral-700' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'}`}
            >
              <HeartHandshake className="w-4 h-4" />
              Taubat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="studentSearch" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Pilih Santri
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <AnimatePresence>
                  {studentNames.map(name => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={name} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800/50 text-teal-800 dark:text-teal-300 rounded-lg text-sm font-medium"
                    >
                      {name}
                      <button type="button" onClick={() => handleRemoveStudent(name)} className="p-0.5 hover:bg-teal-200 dark:hover:bg-teal-800/50 rounded-md transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="relative z-20">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="studentSearch"
                    value={currentStudentInput}
                    onChange={(e) => {
                      setCurrentStudentInput(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    className="block w-full pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none text-neutral-900 dark:text-white"
                    placeholder="Cari dan pilih santri (bisa pilih lebih dari satu)..."
                  />
                  
                  {isStudentDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsStudentDropdownOpen(false)}></div>
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800 overflow-hidden max-h-64 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((s, idx) => {
                            const isSelected = studentNames.includes(s.nama);
                            return (
                              <label key={idx} className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-50 dark:border-neutral-800 last:border-0 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}>
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => toggleStudent(s.nama)}
                                  className="w-4 h-4 text-teal-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-teal-500 focus:ring-offset-0 dark:bg-neutral-800"
                                />
                                <div>
                                  <div className="font-medium text-sm text-neutral-900 dark:text-neutral-200">{s.nama}</div>
                                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{s.kelas} • {s.kamar}</div>
                                </div>
                              </label>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">Tidak ada santri ditemukan</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {categories.length > 1 && (
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setSelectedItemId(''); }}
                    className="block w-full pl-4 pr-10 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none appearance-none text-neutral-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-neutral-900">{c === 'All' ? 'Semua Kategori' : c}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="activity" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Jenis {recordType === 'Violation' ? 'Pelanggaran' : 'Aktivitas Taubat'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {recordType === 'Violation' ? 
                    <AlertTriangle className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-teal-500 transition-colors" /> :
                    <HeartHandshake className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-teal-500 transition-colors" />
                  }
                </div>
                <select
                  id="activity"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none appearance-none text-neutral-900 dark:text-white"
                  required
                >
                  <option value="" disabled className="bg-white dark:bg-neutral-900">Pilih aktivitas...</option>
                  {availableItems.map((v) => (
                    <option key={v.id} value={v.id} className="bg-white dark:bg-neutral-900">
                      {v.code ? `[${v.code}] ` : ''}{v.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedItem && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className={`${recordType === 'Violation' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/30'} p-4 rounded-xl border flex items-center justify-between`}>
                  <div>
                    <p className={`text-sm font-medium ${recordType === 'Violation' ? 'text-red-900 dark:text-red-300' : 'text-teal-900 dark:text-teal-300'}`}>
                      {recordType === 'Violation' ? 'Detail Sanksi:' : 'Detail Pengurangan:'}
                    </p>
                    <p className={`text-xs mt-0.5 ${recordType === 'Violation' ? 'text-red-700/80 dark:text-red-400/80' : 'text-teal-700/80 dark:text-teal-400/80'}`}>
                      {recordType === 'Violation' ? 'Penambahan poin kedisiplinan' : 'Pengurangan poin kedisiplinan'}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    {recordType === 'Violation' && selectedItem.category && (
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border bg-white dark:bg-neutral-900 shadow-sm ${getCategoryColor(selectedItem.category)}`}>
                        Kategori {selectedItem.category}
                      </span>
                    )}
                    <span className={`text-lg font-bold ${recordType === 'Violation' ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}>
                      {recordType === 'Violation' ? '+' : '-'}{selectedItem.points} Pts
                    </span>
                  </div>
                </div>

                {/* Taubat Assignment Selection (Only for Violations) */}
                {recordType === 'Violation' && recommendedTaubats.length > 0 && (
                  <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-500">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Tugaskan Tindakan Taubat</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Tindakan taubat yang ditetapkan untuk pelanggaran ini:</p>
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-4 p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-900/10 rounded-xl cursor-pointer hover:bg-amber-50/80 dark:hover:bg-amber-900/20 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={assignedTaubatId === recommendedTaubats[0].id}
                        onChange={(e) => setAssignedTaubatId(e.target.checked ? recommendedTaubats[0].id : '')}
                        className="w-5 h-5 text-amber-600 border-amber-300 dark:border-amber-700 rounded focus:ring-amber-500/20 focus:ring-offset-0 dark:bg-neutral-900" 
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
                          {recommendedTaubats[0].code ? `[${recommendedTaubats[0].code}] ` : ''}{recommendedTaubats[0].name}
                        </p>
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mt-1 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Potensi pengurangan: {recommendedTaubats[0].points} Poin
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Catatan Tambahan (Opsional)
            </label>
            <div className="relative group">
              <div className="absolute top-3 left-3.5 pointer-events-none">
                <FileText className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="block w-full pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none resize-none text-neutral-900 dark:text-white"
                placeholder="Tambahkan keterangan spesifik..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              type="submit"
              className={`flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm ${recordType === 'Violation' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500'}`}
            >
              <PlusCircle className="w-4 h-4" />
              Simpan Aktivitas
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
