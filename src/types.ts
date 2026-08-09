export type Klasifikasi = 'A' | 'B' | 'C' | 'Ringan' | 'Sedang' | 'Berat';

export type Dormitory = string; // allow any string from API

export type PointItem = {
  id: string;
  code?: string;
  name: string; // Larangan / Pelanggaran
  points: number;
  category?: string; // Kategori (BAB)
  klasifikasi?: Klasifikasi;
  type: 'Violation' | 'Taubat';
  // for violation, we can store the corresponding taubat
  defaultTaubatId?: string;
};

export type ApiStudent = {
  nisn: number | string;
  nama: string;
  kelas: string;
  kamar: string;
};

export type PointRecord = {
  id: string;
  timestamp: string;
  studentName: string;
  dormitory: Dormitory;
  item: PointItem;
  note?: string;
  assignedTaubat?: PointItem;
  status?: 'Pending' | 'Completed';
  relatedViolationId?: string;
};

export type ZoneType = 'Hijau' | 'Kuning' | 'Oranye' | 'Merah' | 'Hitam' | 'Drop Out';

export type ZoneInfo = {
  name: ZoneType;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  textColor: string;
  punishment: string;
};

export type StudentSummary = {
  name: string;
  kelas?: string;
  dormitory: Dormitory;
  totalPoints: number;
  incidentCount: number;
  taubatCount: number;
  lastActivity: string;
};
