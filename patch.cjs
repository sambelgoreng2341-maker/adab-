const fs = require('fs');
const file = 'src/components/ReportCards.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update PDF generation (multiple pages case)
code = code.replace(
  /doc\.text\('Mengetahui,', 45, sigY, \{ align: 'center' \}\);\s*doc\.text\('Pengurus Kesantrian', 160, sigY, \{ align: 'center' \}\);\s*doc\.setFont\('helvetica', 'bold'\);\s*\/\/ Adding a small underline for the name or just let it be bold\s*doc\.text\(selectedPengurus, 45, sigY \+ 25, \{ align: 'center' \}\);\s*doc\.setFont\('helvetica', 'normal'\);\s*doc\.text\('\( ______________________ \)', 160, sigY \+ 25, \{ align: 'center' \}\);/g,
  `doc.text('Mengetahui, Mudir IQBS', 45, sigY, { align: 'center' });
      doc.text('Pengurus Kesantrian', 160, sigY, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.text('( ______________________ )', 45, sigY + 25, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(selectedPengurus, 160, sigY + 25, { align: 'center' });`
);

// Update PDF generation (single page case)
code = code.replace(
  /doc\.text\('Mengetahui,', 45, sigY, \{ align: 'center' \}\);\s*doc\.text\('Pengurus Kesantrian', 160, sigY, \{ align: 'center' \}\);\s*doc\.setFont\('helvetica', 'bold'\);\s*doc\.text\(selectedPengurus, 45, sigY \+ 25, \{ align: 'center' \}\);\s*doc\.setFont\('helvetica', 'normal'\);\s*doc\.text\('\( ______________________ \)', 160, sigY \+ 25, \{ align: 'center' \}\);/g,
  `doc.text('Mengetahui, Mudir IQBS', 45, sigY, { align: 'center' });
    doc.text('Pengurus Kesantrian', 160, sigY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.text('( ______________________ )', 45, sigY + 25, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.text(selectedPengurus, 160, sigY + 25, { align: 'center' });`
);

// Update UI view
code = code.replace(
  /<p className="mb-20 text-neutral-600 dark:text-neutral-400">Mengetahui,<\/p>\s*<p className="font-bold text-neutral-900 dark:text-white">\{selectedPengurus\}<\/p>\s*<\/div>\s*<div className="text-center flex-1 max-w-\[280px\] mx-auto">\s*<p className="mb-20 text-neutral-600 dark:text-neutral-400">Pengurus Kesantrian<\/p>\s*<p className="font-medium text-neutral-900 dark:text-white">\(\s*_______________________\s*\)<\/p>/g,
  `<p className="mb-20 text-neutral-600 dark:text-neutral-400">Mengetahui, Mudir IQBS</p>
                                 <p className="font-medium text-neutral-900 dark:text-white">( _______________________ )</p>
                              </div>
                              <div className="text-center flex-1 max-w-[280px] mx-auto">
                                 <p className="mb-20 text-neutral-600 dark:text-neutral-400">Pengurus Kesantrian</p>
                                 <p className="font-bold text-neutral-900 dark:text-white">{selectedPengurus}</p>`
);

fs.writeFileSync(file, code);
