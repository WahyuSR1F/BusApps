// C:\Users\LEGION\OneDrive\Desktop\project_freelance\bus\app\src\components\public\JadwalHariIni.tsx
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Bus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  tersedia: 'bg-blue-100 text-blue-700',
  berangkat: 'bg-amber-100 text-amber-700',
  sampai: 'bg-green-100 text-green-700',
  batal: 'bg-red-100 text-red-700',
  penuh: 'bg-purple-100 text-purple-700',
};

const statusLabels: Record<string, string> = {
  tersedia: 'Tersedia',
  berangkat: 'Berangkat',
  sampai: 'Sampai',
  batal: 'Batal',
  penuh: 'Penuh',
};

interface ScheduleItem {
  id: number;
  waktuBerangkat: string;
  tanggal: string;
  status: string;
  bus: { platNomor: string; merek: string } | null;
  route: { kodeRute: string; namaTujuan: string } | null;
  supir: { nama: string } | null;
}

const dummyData: ScheduleItem[] = [
  {
    id: 1,
    waktuBerangkat: '2023-10-05T08:00:00Z',
    tanggal: '2023-10-05',
    status: 'tersedia',
    bus: { platNomor: 'B12345', merek: 'Mercedez-Benz' },
    route: { kodeRute: 'R123', namaTujuan: 'Jakarta' },
    supir: { nama: 'John Doe' },
  },
  {
    id: 2,
    waktuBerangkat: '2023-10-05T09:00:00Z',
    tanggal: '2023-10-05',
    status: 'berangkat',
    bus: { platNomor: 'B67890', merek: 'Toyota' },
    route: { kodeRute: 'R456', namaTujuan: 'Surabaya' },
    supir: { nama: 'Jane Smith' },
  },
  {
    id: 3,
    waktuBerangkat: '2023-10-05T10:00:00Z',
    tanggal: '2023-10-05',
    status: 'sampai',
    bus: { platNomor: 'B24680', merek: 'Honda' },
    route: { kodeRute: 'R789', namaTujuan: 'Bandung' },
    supir: { nama: 'Alice Johnson' },
  },
  {
    id: 4,
    waktuBerangkat: '2023-10-05T11:00:00Z',
    tanggal: '2023-10-05',
    status: 'batal',
    bus: { platNomor: 'B31415', merek: 'Ford' },
    route: { kodeRute: 'R901', namaTujuan: 'Semarang' },
    supir: { nama: 'Bob Brown' },
  },
  {
    id: 5,
    waktuBerangkat: '2023-10-05T12:00:00Z',
    tanggal: '2023-10-05',
    status: 'penuh',
    bus: { platNomor: 'B45678', merek: 'Audi' },
    route: { kodeRute: 'R1011', namaTujuan: 'Makassar' },
    supir: { nama: 'Charlie Davis' },
  },
];

export default function JadwalHariIni() {
  return (
    <section id="jadwal" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Jadwal Keberangkatan
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Jadwal Hari Ini</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Lihat jadwal keberangkatan bus untuk hari ini, {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>

        {dummyData.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-3">
            {dummyData.slice(0, 5).map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {schedule.waktuBerangkat ? format(new Date(schedule.waktuBerangkat), 'HH:mm') : '--:--'}
                    </div>
                    <div className="text-xs text-slate-500">Berangkat</div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{schedule.route?.kodeRute || '-'}</div>
                      <div className="text-xs text-slate-500">{schedule.route?.namaTujuan || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{schedule.bus?.platNomor || '-'}</div>
                      <div className="text-xs text-slate-500">{schedule.bus?.merek || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{schedule.supir?.nama || '-'}</div>
                      <div className="text-xs text-slate-500">Supir</div>
                    </div>
                  </div>
                </div>
                <Badge className={`${statusColors[schedule.status] || 'bg-slate-100'} border-0`}>
                  {statusLabels[schedule.status] || schedule.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl max-w-4xl mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada jadwal keberangkatan hari ini</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/jadwal">
            <Button variant="outline" className="gap-2">
              Lihat Semua Jadwal <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
