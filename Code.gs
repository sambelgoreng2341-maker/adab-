function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Data Santri Sheet
  let santriSheet = ss.getSheetByName("Data Santri");
  if (!santriSheet) {
    santriSheet = ss.insertSheet("Data Santri");
    santriSheet.appendRow(["nisn", "nama", "kelas", "kamar"]);
    santriSheet.getRange("A1:D1").setFontWeight("bold");
    const santriData = [
      [2023005, "Muhammad Ghaisan As Sakhiy", "Kelas 10", "Lantai 2"],
      [2023006, "Muhammad Syaifulloh", "Kelas 10", "Lantai 2"],
      [2024001, "Abdul Azis Marwan Baraba", "Kelas 9", "Lantai 2"],
      [2024002, "Adiwangsa Widyatna", "Kelas 9", "Lantai 1"],
      [2024003, "Affan Al Faris", "Kelas 9", "Lantai 2"],
      [2024004, "Akmal Javas Naraya", "Kelas 9", "Lantai 1"],
      [2024005, "Arya Hanif Haithami", "Kelas 9", "Lantai 2"],
      [2024006, "Fahri Naufal Altof", "Kelas 9", "Lantai 1"]
    ];
    santriSheet.getRange(2, 1, santriData.length, 4).setValues(santriData);
  }
  
  // Setup Data Pelanggaran Sheet
  let pelanggaranSheet = ss.getSheetByName("Data Pelanggaran");
  if (!pelanggaranSheet) {
    pelanggaranSheet = ss.insertSheet("Data Pelanggaran");
    pelanggaranSheet.appendRow(["Kategori (BAB)", "Larangan / Pelanggaran", "Klasifikasi", "Poin Pelanggaran", "Bentuk Taubat (Hukuman Mendidik)", "Pengurangan Poin Taubat"]);
    pelanggaranSheet.getRange("A1:F1").setFontWeight("bold");
    const pelanggaranData = [
      ["I. Aqidah", "Dilarang menganut aqidah bathilah yang bertentangan dengan Al Quran dan As Sunnah", "C", 60, "Setor hafalan Aqidah Sanusiyyah/Matan Tauhid + Ikrar Syahadat & Taubat + Konseling Mudir", -25],
      ["I. Aqidah", "Dilarang menyebarkan aqidah bathilah baik dengan lisan, tulisan maupun cara lainnya", "C", 60, "Membuat rangkuman kitab Aqidah Shahihah (minimal 5 lembar) + Konseling Mudir + Pemanggilan Orangtua", -25],
      ["I. Aqidah", "Dilarang mengabaikan peningkatan pemahaman Aqidah Shahihah dan dakwahnya", "B", 15, "Menyimak kajian Aqidah & membuat resume 2 halaman + Menghafal 5 hadits tauhid", -7],
      ["II. Ibadah", "Dilarang meninggalkan shalat wajib lima waktu berjamaah di masjid tepat pada waktunya", "B", 20, "Shalat sunnah Taubat 2 rakaat + Piket tempat wudhu/masjid 3 hari + Khidmah azan subuh 3 hari", -9],
      ["II. Ibadah", "Dilarang terlambat berwudlu dan tidak berada di masjid sebelum adzan", "A", 5, "Datang ke masjid 15 menit sebelum azan selama 3 hari berturut-turut + Piket kerapian sandal masjid", -2]
    ];
    pelanggaranSheet.getRange(2, 1, pelanggaranData.length, 6).setValues(pelanggaranData);
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
  var action = "getData";
  if (e && e.parameter && e.parameter.action) {
    action = e.parameter.action;
  }
  
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
  if (data.length < 1) return [];
  
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
  if (data.length < 1) return [];
  
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
    setupSheet(); // Create sheet if not exists
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Riwayat");
  }
  
  // Clear existing data except headers
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
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
