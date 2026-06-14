import { useState } from 'react';
import { Link } from 'react-router';
import { trpc } from '@/providers/trpc';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Bus, User, Search, ArrowLeft } from 'lucide-react';
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
  tersedia: 'Tersedia', berangkat: 'Berangkat', sampai: 'Sampai', batal: 'Batal', penuh: 'Penuh',
};

interface ScheduleItem {
  id: number;
  waktuBerangkat: string;
  waktuSampai: string;
  tanggal: string;
  status: string;
  hargaTiket: string;
  jumlahPenumpang: number;
  bus: { platNomor: string; merek: string; kapasitas: number } | null;
  route: { kodeRute: string; namaTujuan: string } | null;
  supir: { nama: string } | null;
  kernet: { nama: string } | null;
}

export default function JadwalLengkap() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data, isLoading } = trpc.schedule.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    limit: 50,
  });

  const statusOptions = ['tersedia', 'berangkat', 'sampai', 'batal', 'penuh'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Jadwal Keberangkatan</h1>
            <p className="text-slate-500">Lihat semua jadwal keberangkatan bus SafaTrans</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari rute, bus, atau supir..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('')}
              >
                Semua
              </Button>
              {statusOptions.map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {statusLabels[s]}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="space-y-3">
              {(data.items as unknown as ScheduleItem[]).map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {schedule.waktuBerangkat ? format(new Date(schedule.waktuBerangkat), 'HH:mm') : '--:--'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {schedule.tanggal ? format(new Date(schedule.tanggal), 'EEEE, d MMM', { locale: id }) : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
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
                          <div className="text-xs text-slate-500">
                            {schedule.kernet ? `Kernet: ${schedule.kernet.nama}` : 'Tanpa Kernet'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-semibold text-green-600">
                            Rp {Number(schedule.hargaTiket).toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-slate-500">{schedule.jumlahPenumpang}/{schedule.bus?.kapasitas || '-'} penumpang</div>
                        </div>
                      </div>
                    </div>

                    <Badge className={`${statusColors[schedule.status] || 'bg-slate-100'} border-0 self-start lg:self-center`}>
                      {statusLabels[schedule.status] || schedule.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Tidak ada jadwal yang ditemukan</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
