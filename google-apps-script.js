// Copy paste code ini ke Google Apps Script (extensions -> Apps Script)

// Fungsi untuk inisialisasi sheet (Jalankan fungsi ini sekali saja di editor Apps Script)
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Buat Sheet "Students" (Daftar Santri)
  let studentsSheet = ss.getSheetByName('Students');
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet('Students');
    studentsSheet.appendRow(['id', 'nama', 'kelas', 'kamar']);
    
    // Tambahkan data dummy santri
    studentsSheet.appendRow(['S001', 'Ahmad Fadillah', '10A', 'Asrama Abu Bakar']);
    studentsSheet.appendRow(['S002', 'Budi Santoso', '10B', 'Asrama Umar']);
    studentsSheet.appendRow(['S003', 'Zaid bin Haritsah', '11A', 'Asrama Utsman']);
    
    // Format Header
    studentsSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#f3f4f6');
  }
  
  // 2. Buat Sheet "Records" (Riwayat Pelanggaran & Taubat)
  let recordsSheet = ss.getSheetByName('Records');
  if (!recordsSheet) {
    recordsSheet = ss.insertSheet('Records');
    // Kolom-kolom yang dibutuhkan sesuai interface PointRecord
    recordsSheet.appendRow(['id', 'timestamp', 'studentName', 'dormitory', 'item', 'note', 'status', 'assignedTaubat']);
    
    // Format Header
    recordsSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f4f6');
  }

  // 3. Buat Sheet "PointItems" (Katalog Poin & Taubat)
  let pointItemsSheet = ss.getSheetByName('PointItems');
  if (!pointItemsSheet) {
    pointItemsSheet = ss.insertSheet('PointItems');
    pointItemsSheet.appendRow(['id', 'name', 'points', 'category', 'type']);
    
    // Format Header
    pointItemsSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f3f4f6');
  }

  // 4. Buat Sheet "Rules" (Daftar Aturan Rinci)
  let rulesSheet = ss.getSheetByName('Rules');
  if (!rulesSheet) {
    rulesSheet = ss.insertSheet('Rules');
    rulesSheet.appendRow(['id', 'Klasifikasi', 'Kategori (BAB)', 'Larangan / Pelanggaran', 'Poin Pelanggaran', 'Bentuk Taubat (Hukuman Mendidik)', 'Pengurangan Poin Taubat']);
    
    // Format Header
    rulesSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f3f4f6');
  }
}

// Handler untuk metode GET (Digunakan saat aplikasi React melakukan fetch data awal)
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getData') {
    return handleGetData();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handler untuk metode POST (Digunakan saat aplikasi React menambah, mengubah, atau menghapus data)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addRecords') {
      return handleAddRecords(data.records);
    } else if (action === 'updateRecord') {
      return handleUpdateRecord(data.recordId, data.updates);
    } else if (action === 'deleteRecord') {
      return handleDeleteRecord(data.recordId);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- FUNGSI-FUNGSI HELPER ---

function handleGetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil Data Students
  const studentsSheet = ss.getSheetByName('Students');
  let students = [];
  if (studentsSheet) {
    const studentsData = studentsSheet.getDataRange().getValues();
    if (studentsData.length > 1) {
      const headers = studentsData[0];
      for (let i = 1; i < studentsData.length; i++) {
        let row = studentsData[i];
        let student = {};
        for (let j = 0; j < headers.length; j++) {
          student[headers[j]] = row[j];
        }
        students.push(student);
      }
    }
  }
  
  // Ambil Data Records
  const recordsSheet = ss.getSheetByName('Records');
  let records = [];
  if (recordsSheet) {
    const recordsData = recordsSheet.getDataRange().getValues();
    if (recordsData.length > 1) {
      const headers = recordsData[0];
      for (let i = 1; i < recordsData.length; i++) {
        let row = recordsData[i];
        let record = {};
        for (let j = 0; j < headers.length; j++) {
          let key = headers[j];
          let val = row[j];
          // Parsing JSON untuk kolom 'item' dan 'assignedTaubat' karena berbentuk objek bersarang
          if (key === 'item' || key === 'assignedTaubat') {
             try {
               record[key] = val ? JSON.parse(val) : null;
             } catch(e) {
               record[key] = null;
             }
          } else {
            record[key] = val;
          }
        }
        records.push(record);
      }
    }
  }
  
  // Ambil Data PointItems
  const pointItemsSheet = ss.getSheetByName('PointItems');
  let pointItems = [];
  if (pointItemsSheet) {
    const pointItemsData = pointItemsSheet.getDataRange().getValues();
    if (pointItemsData.length > 1) {
      const headers = pointItemsData[0];
      for (let i = 1; i < pointItemsData.length; i++) {
        let row = pointItemsData[i];
        let item = {};
        for (let j = 0; j < headers.length; j++) {
          item[headers[j]] = row[j];
        }
        pointItems.push(item);
      }
    }
  }

  // Ambil Data Rules
  const rulesSheet = ss.getSheetByName('Rules');
  let rules = [];
  if (rulesSheet) {
    const rulesData = rulesSheet.getDataRange().getValues();
    if (rulesData.length > 1) {
      const headers = rulesData[0];
      for (let i = 1; i < rulesData.length; i++) {
        let row = rulesData[i];
        let rule = {};
        for (let j = 0; j < headers.length; j++) {
          rule[headers[j]] = row[j];
        }
        rules.push(rule);
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'success', 
    data: { students: students, records: records, pointItems: pointItems, rules: rules } 
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleAddRecords(records) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const recordsSheet = ss.getSheetByName('Records');
  
  records.forEach(record => {
    recordsSheet.appendRow([
      record.id,
      record.timestamp,
      record.studentName,
      record.dormitory,
      JSON.stringify(record.item || {}),
      record.note || '',
      record.status || '',
      record.assignedTaubat ? JSON.stringify(record.assignedTaubat) : ''
    ]);
  });
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleUpdateRecord(recordId, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const recordsSheet = ss.getSheetByName('Records');
  const data = recordsSheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === recordId) {
      for (let key in updates) {
        let colIndex = headers.indexOf(key);
        if (colIndex > -1) {
          recordsSheet.getRange(i + 1, colIndex + 1).setValue(updates[key]);
        }
      }
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleDeleteRecord(recordId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const recordsSheet = ss.getSheetByName('Records');
  const data = recordsSheet.getDataRange().getValues();
  const idIndex = data[0].indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === recordId) {
      recordsSheet.deleteRow(i + 1); // +1 karena baris di sheet dimulai dari index 1
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
