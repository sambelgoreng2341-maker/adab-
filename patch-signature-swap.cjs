const fs = require('fs');
const file = 'src/components/ReportCards.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add state
code = code.replace(
  /const \[selectedPengurus, setSelectedPengurus\] = useState<string>\(pengurusList\[0\] \|\| ''\);/,
  `const [selectedPengurus, setSelectedPengurus] = useState<string>(pengurusList[0] || '');\n  const [signaturePosition, setSignaturePosition] = useState<'mudir-left' | 'mudir-right'>('mudir-left');`
);

// 2. Add UI for swapping in the form
const uiFormReplacement = `<div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Pengurus Kesantrian (Tanda Tangan)</label>
              <select
                value={selectedPengurus}
                onChange={(e) => setSelectedPengurus(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none text-neutral-900 dark:text-white cursor-pointer"
              >
                {pengurusList.map(p => <option key={p} value={p} className="bg-white dark:bg-neutral-900">{p}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Posisi Tanda Tangan</label>
              <select
                value={signaturePosition}
                onChange={(e) => setSignaturePosition(e.target.value as 'mudir-left' | 'mudir-right')}
                className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 outline-none text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value="mudir-left" className="bg-white dark:bg-neutral-900">Kiri: Mudir, Kanan: Kesantrian</option>
                <option value="mudir-right" className="bg-white dark:bg-neutral-900">Kiri: Kesantrian, Kanan: Mudir</option>
              </select>
            </div>
            <button
              onClick={() => setIsManagingPengurus(!isManagingPengurus)}`;
code = code.replace(
  /<div className="flex flex-col md:flex-row md:items-end gap-4">\s*<div className="flex-1 space-y-2">\s*<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Pengurus Kesantrian \(Tanda Tangan\)<\/label>\s*<select\s*value=\{selectedPengurus\}\s*onChange=\{\(e\) => setSelectedPengurus\(e\.target\.value\)\}\s*className="w-full px-4 py-3 bg-neutral-50\/50 dark:bg-neutral-800\/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-teal-500\/20 dark:focus:ring-teal-500\/10 outline-none text-neutral-900 dark:text-white cursor-pointer"\s*>\s*\{pengurusList\.map\(p => <option key=\{p\} value=\{p\} className="bg-white dark:bg-neutral-900">\{p\}<\/option>\)\}\s*<\/select>\s*<\/div>\s*<button\s*onClick=\{\(\) => setIsManagingPengurus\(!isManagingPengurus\)\}/,
  uiFormReplacement
);

// 3. PDF PDF generation
const pdfLogicReplacement = `if (signaturePosition === 'mudir-left') {
      doc.text('Mengetahui, Mudir IQBS', 45, sigY, { align: 'center' });
      doc.text('Pengurus Kesantrian', 160, sigY, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.text('( ______________________ )', 45, sigY + 25, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(selectedPengurus, 160, sigY + 25, { align: 'center' });
    } else {
      doc.text('Pengurus Kesantrian', 45, sigY, { align: 'center' });
      doc.text('Mengetahui, Mudir IQBS', 160, sigY, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(selectedPengurus, 45, sigY + 25, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.text('( ______________________ )', 160, sigY + 25, { align: 'center' });
    }`;

// Replace in both places for PDF (generateAllPDFs and generatePDF)
code = code.replace(
  /doc\.text\('Mengetahui, Mudir IQBS', 45, sigY, \{ align: 'center' \}\);\s*doc\.text\('Pengurus Kesantrian', 160, sigY, \{ align: 'center' \}\);\s*doc\.setFont\('helvetica', 'normal'\);\s*doc\.text\('\( ______________________ \)', 45, sigY \+ 25, \{ align: 'center' \}\);\s*doc\.setFont\('helvetica', 'bold'\);\s*doc\.text\(selectedPengurus, 160, sigY \+ 25, \{ align: 'center' \}\);/g,
  pdfLogicReplacement
);

// 4. Update UI preview
const previewReplacement = `{signaturePosition === 'mudir-left' ? (
                                <>
                                  <div className="text-center flex-1 max-w-[280px] mx-auto">
                                     <p className="mb-20 text-neutral-600 dark:text-neutral-400">Mengetahui, Mudir IQBS</p>
                                     <p className="font-medium text-neutral-900 dark:text-white">( _______________________ )</p>
                                  </div>
                                  <div className="text-center flex-1 max-w-[280px] mx-auto">
                                     <p className="mb-20 text-neutral-600 dark:text-neutral-400">Pengurus Kesantrian</p>
                                     <p className="font-bold text-neutral-900 dark:text-white">{selectedPengurus}</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-center flex-1 max-w-[280px] mx-auto">
                                     <p className="mb-20 text-neutral-600 dark:text-neutral-400">Pengurus Kesantrian</p>
                                     <p className="font-bold text-neutral-900 dark:text-white">{selectedPengurus}</p>
                                  </div>
                                  <div className="text-center flex-1 max-w-[280px] mx-auto">
                                     <p className="mb-20 text-neutral-600 dark:text-neutral-400">Mengetahui, Mudir IQBS</p>
                                     <p className="font-medium text-neutral-900 dark:text-white">( _______________________ )</p>
                                  </div>
                                </>
                              )}`;

code = code.replace(
  /<div className="text-center flex-1 max-w-\[280px\] mx-auto">\s*<p className="mb-20 text-neutral-600 dark:text-neutral-400">Mengetahui, Mudir IQBS<\/p>\s*<p className="font-medium text-neutral-900 dark:text-white">\(\s*_______________________\s*\)<\/p>\s*<\/div>\s*<div className="text-center flex-1 max-w-\[280px\] mx-auto">\s*<p className="mb-20 text-neutral-600 dark:text-neutral-400">Pengurus Kesantrian<\/p>\s*<p className="font-bold text-neutral-900 dark:text-white">\{selectedPengurus\}<\/p>\s*<\/div>/,
  previewReplacement
);

fs.writeFileSync(file, code);
