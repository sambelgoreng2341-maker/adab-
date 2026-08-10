function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Data Santri Sheet
  let santriSheet = ss.getSheetByName("Data Santri");
  if (!santriSheet) {
    santriSheet = ss.insertSheet("Data Santri");
    santriSheet.appendRow(["nisn", "nama", "kelas", "kamar"]);
    santriSheet.getRange("A1:D1").setFontWeight("bold");
    santriSheet.appendRow(["1234567890", "Ahmad Fulan", "10A", "Kamar 1"]);
  }
  
  // Setup Data Pelanggaran Sheet
  let pelanggaranSheet = ss.getSheetByName("Data Pelanggaran");
  if (!pelanggaranSheet) {
    pelanggaranSheet = ss.insertSheet("Data Pelanggaran");
    pelanggaranSheet.appendRow(["Kategori (BAB)", "Larangan / Pelanggaran", "Klasifikasi", "Poin Pelanggaran", "Bentuk Taubat (Hukuman Mendidik)", "Pengurangan Poin Taubat"]);
    pelanggaranSheet.getRange("A1:F1").setFontWeight("bold");
    pelanggaranSheet.appendRow(["I. Aqidah", "Dilarang menganut aqidah bathilah", "C", "60", "Setor hafalan", "-25"]);
  }

  // Setup Records (Riwayat) Sheet
  let recordsSheet = ss.getSheetByName("Riwayat");
  if (!recordsSheet) {
    recordsSheet = ss.insertSheet("Riwayat");
    recordsSheet.appendRow(["id", "timestamp", "studentName", "dormitory", "item", "note", "assignedTaubat", "status", "relatedViolationId"]);
    recordsSheet.getRange("A1:I1").setFontWeight("bold");
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getData') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: {
        students: getSheetData("Data Santri"),
        rules: getSheetData("Data Pelanggaran"),
        records: getRecordsData()
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    
    if (postData.action === 'saveRecords') {
      saveRecordsData(postData.records);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Records saved successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        obj[headers[j]] = row[j];
        if (row[j] !== "") hasData = true;
      }
    }
    if (hasData) {
      rows.push(obj);
    }
  }
  
  return rows;
}

function getRecordsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Riwayat");
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // skip if no ID
    
    try {
      rows.push({
        id: row[0],
        timestamp: row[1],
        studentName: row[2],
        dormitory: row[3],
        item: JSON.parse(row[4] || "null"),
        note: row[5],
        assignedTaubat: JSON.parse(row[6] || "null"),
        status: row[7],
        relatedViolationId: row[8]
      });
    } catch(e) {
      // JSON parse error, ignore row
    }
  }
  
  return rows;
}

function saveRecordsData(records) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Riwayat");
  if (!sheet) {
    setup(); // Create sheet if not exists
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Riwayat");
  }
  
  // Clear existing data except headers
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  if (!records || records.length === 0) return;
  
  const rows = records.map(r => [
    r.id,
    r.timestamp,
    r.studentName,
    r.dormitory,
    JSON.stringify(r.item || null),
    r.note || "",
    JSON.stringify(r.assignedTaubat || null),
    r.status || "",
    r.relatedViolationId || ""
  ]);
  
  sheet.getRange(2, 1, rows.length, 9).setValues(rows);
}
