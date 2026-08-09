import { PointItem, ZoneInfo, Dormitory } from './types';

export const MOCK_SANTRI = [
  { nisn: 2023005, nama: "Muhammad Ghaisan As Sakhiy", kelas: "Kelas 10", kamar: "Lantai 2" },
  { nisn: 2023006, nama: "Muhammad Syaifulloh", kelas: "Kelas 10", kamar: "Lantai 2" },
  { nisn: 2024001, nama: "Abdul Azis Marwan Baraba", kelas: "Kelas 9", kamar: "Lantai 2" },
  { nisn: 2024002, nama: "Adiwangsa Widyatna", kelas: "Kelas 9", kamar: "Lantai 1" },
  { nisn: 2024003, nama: "Affan Al Faris", kelas: "Kelas 9", kamar: "Lantai 2" },
  { nisn: 2024004, nama: "Akmal Javas Naraya", kelas: "Kelas 9", kamar: "Lantai 1" },
  { nisn: 2024005, nama: "Arya Hanif Haithami", kelas: "Kelas 9", kamar: "Lantai 2" },
  { nisn: 2024006, nama: "Fahri Naufal Altof", kelas: "Kelas 9", kamar: "Lantai 1" }
];

export const MOCK_PELANGGARAN = [
  {
    "Kategori (BAB)": "I. Aqidah",
    "Larangan / Pelanggaran": "Dilarang menganut aqidah bathilah yang bertentangan dengan Al Quran dan As Sunnah",
    "Klasifikasi": "C",
    "Poin Pelanggaran": 60,
    "Bentuk Taubat (Hukuman Mendidik)": "Setor hafalan Aqidah Sanusiyyah/Matan Tauhid + Ikrar Syahadat & Taubat + Konseling Mudir",
    "Pengurangan Poin Taubat": -25
  },
  {
    "Kategori (BAB)": "I. Aqidah",
    "Larangan / Pelanggaran": "Dilarang menyebarkan aqidah bathilah baik dengan lisan, tulisan maupun cara lainnya",
    "Klasifikasi": "C",
    "Poin Pelanggaran": 60,
    "Bentuk Taubat (Hukuman Mendidik)": "Membuat rangkuman kitab Aqidah Shahihah (minimal 5 lembar) + Konseling Mudir + Pemanggilan Orangtua",
    "Pengurangan Poin Taubat": -25
  },
  {
    "Kategori (BAB)": "I. Aqidah",
    "Larangan / Pelanggaran": "Dilarang mengabaikan peningkatan pemahaman Aqidah Shahihah dan dakwahnya",
    "Klasifikasi": "B",
    "Poin Pelanggaran": 15,
    "Bentuk Taubat (Hukuman Mendidik)": "Menyimak kajian Aqidah & membuat resume 2 halaman + Menghafal 5 hadits tauhid",
    "Pengurangan Poin Taubat": -7
  },
  {
    "Kategori (BAB)": "II. Ibadah",
    "Larangan / Pelanggaran": "Dilarang meninggalkan shalat wajib lima waktu berjamaah di masjid tepat pada waktunya",
    "Klasifikasi": "B",
    "Poin Pelanggaran": 20,
    "Bentuk Taubat (Hukuman Mendidik)": "Shalat sunnah Taubat 2 rakaat + Piket tempat wudhu/masjid 3 hari + Khidmah azan subuh 3 hari",
    "Pengurangan Poin Taubat": -9
  },
  {
    "Kategori (BAB)": "II. Ibadah",
    "Larangan / Pelanggaran": "Dilarang terlambat berwudlu dan tidak berada di masjid sebelum adzan",
    "Klasifikasi": "A",
    "Poin Pelanggaran": 5,
    "Bentuk Taubat (Hukuman Mendidik)": "Datang ke masjid 15 menit sebelum azan selama 3 hari berturut-turut + Piket kerapian sandal masjid",
    "Pengurangan Poin Taubat": -2
  }
];

export const POINT_ITEMS: PointItem[] = [
  // Violations (Pelanggaran)
  { id: 'v1', name: 'Kamar/Loker berantakan (tidak menjaga kebersihan/kerapihan)', points: 5, category: 'Ringan', type: 'Violation' },
  { id: 'v2', name: 'Tidak membiasakan 6S (Salam, Salim, Sapa, Senyum, Sopan, Santun)', points: 5, category: 'Ringan', type: 'Violation' },
  { id: 'v3', name: 'Tidak berdoa sebelum/sesudah kegiatan', points: 5, category: 'Ringan', type: 'Violation' },
  { id: 'v4', name: 'Tidak wudhu dan sikat gigi sebelum/sesudah tidur', points: 5, category: 'Ringan', type: 'Violation' },
  { id: 'v5', name: 'Mengabaikan atau menunda panggilan Ustadz', points: 10, category: 'Sedang', type: 'Violation' },
  { id: 'v6', name: 'Kurang disiplin dalam kegiatan', points: 10, category: 'Sedang', type: 'Violation' },
  { id: 'v7', name: 'Bangun lebih dari jam 03.00 WIB', points: 10, category: 'Sedang', type: 'Violation' },
  { id: 'v8', name: 'Belum tidur 15 menit setelah evaluasi', points: 10, category: 'Sedang', type: 'Violation' },
  { id: 'v9', name: 'Membuat kegaduhan di asrama', points: 10, category: 'Sedang', type: 'Violation' },
  { id: 'v10', name: 'Berada di kamar saat jam pembelajaran/kegiatan', points: 15, category: 'Sedang', type: 'Violation' },
  { id: 'v11', name: 'Berkata kotor, ghibah, atau memanggil dengan julukan buruk', points: 20, category: 'Berat', type: 'Violation' },
  { id: 'v12', name: 'Melawan/Tidak menerima konsekuensi sanksi', points: 25, category: 'Berat', type: 'Violation' },
  
  // Taubat (Pengurangan Poin)
  { id: 't1', name: 'Merapikan sandal dan sepatu di depan asrama', points: 5, category: 'Ringan', type: 'Taubat' },
  { id: 't2', name: 'Menjadi petugas kebersihan asrama', points: 5, category: 'Ringan', type: 'Taubat' },
  { id: 't3', name: 'Menyapu dan mengepel lorong asrama', points: 10, category: 'Sedang', type: 'Taubat' },
  { id: 't4', name: 'Membangunkan santri lain jam 03.00 WIB', points: 10, category: 'Sedang', type: 'Taubat' },
  { id: 't5', name: 'Membersihkan kamar mandi asrama', points: 15, category: 'Sedang', type: 'Taubat' },
  { id: 't6', name: 'Mengabdi membantu Ustadz/Musyrif', points: 20, category: 'Berat', type: 'Taubat' },
  { id: 't7', name: 'Memimpin doa dan kultum setelah jamaah', points: 25, category: 'Berat', type: 'Taubat' },
];

export const PUNISHMENT_ZONES: ZoneInfo[] = [
  { name: 'Hijau', minPoints: 0, maxPoints: 9, color: 'border-teal-200', bgColor: 'bg-teal-50', textColor: 'text-teal-700', punishment: 'Tidak ada sanksi. Pertahankan kebersihan.' },
  { name: 'Kuning', minPoints: 10, maxPoints: 24, color: 'border-yellow-200', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', punishment: 'Teguran lisan & membersihkan area asrama selama 3 hari.' },
  { name: 'Oranye', minPoints: 25, maxPoints: 49, color: 'border-orange-200', bgColor: 'bg-orange-50', textColor: 'text-orange-700', punishment: 'Surat Peringatan 1 (SP1) & membersihkan masjid/asrama selama 1 minggu.' },
  { name: 'Merah', minPoints: 50, maxPoints: 74, color: 'border-red-200', bgColor: 'bg-red-50', textColor: 'text-red-700', punishment: 'Surat Peringatan 2 (SP2), pemanggilan orang tua & pengabdian kebersihan 1 bulan.' },
  { name: 'Hitam', minPoints: 75, maxPoints: 99, color: 'border-neutral-700', bgColor: 'bg-neutral-800', textColor: 'text-neutral-100', punishment: 'Surat Peringatan Terakhir (SP3) & Sidang kedisiplinan (skorsing).' },
  { name: 'Drop Out', minPoints: 100, maxPoints: 9999, color: 'border-red-900', bgColor: 'bg-red-900', textColor: 'text-white', punishment: 'Dikeluarkan dari pesantren secara tidak hormat.' }
];

export const getZoneForPoints = (points: number): ZoneInfo => {
  return PUNISHMENT_ZONES.find(z => points >= z.minPoints && points <= z.maxPoints) || PUNISHMENT_ZONES[PUNISHMENT_ZONES.length - 1];
};

export const getStatusBadge = (points: number) => {
  const zone = getZoneForPoints(points);
  return { label: `Zona ${zone.name}`, color: `${zone.bgColor} ${zone.textColor} ${zone.color}` };
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Ringan': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Sedang': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Berat': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
  }
};
