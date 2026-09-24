import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import type { EventClickArg } from '@fullcalendar/core';
import { Calendar, Clock, MapPin, Bus, User, Search, ArrowLeft, LayoutList } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { trpc } from '@/providers/trpc';
import { useAppName } from '@/hooks/useContactSettings';

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

// Warna event kalender (harus sinkron dengan server/schedule-router.ts).
const eventColors: Record<string, string> = {
  tersedia: '#3b82f6',
  berangkat: '#f59e0b',
  sampai: '#10b981',
  batal: '#ef4444',
  penuh: '#8b5cf6',
};

type ViewMode = 'tabel' | 'kalender';

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    supir: string;
    status: string;
    jumlahPenumpang: number;
    hargaTiket: number;
  };
};

// Format tanggal/waktu dengan fallback agar nilai invalid tidak melempar RangeError.
const safeFormat = (
  value: unknown,
  pattern: string,
  options?: Parameters<typeof format>[2],
) => {
  if (!value) return '-';
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? '-' : format(date, pattern, options);
};

export default function JadwalLengkap() {
  const appName = useAppName();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('tabel');
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  // Tabel memakai schedule.list asli (search & status difilter di server).
  const { data, isLoading } = trpc.schedule.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  // Kalender memakai endpoint khusus (enabled hanya saat view kalender).
  const { data: calendarData, isLoading: calendarLoading } =
    trpc.schedule.calendarEvents.useQuery(undefined, {
      enabled: viewMode === 'kalender',
    });

  // Reset ke halaman 1 saat filter berubah.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const items = (data?.items as Record<string, unknown>[] | undefined) ?? [];
  const totalPages = data?.totalPages || 1;

  const calendarEvents: CalendarEvent[] =
    (calendarData as CalendarEvent[] | undefined)?.map((e) => ({
      ...e,
      color: eventColors[e.extendedProps?.status] || e.color,
    })) ?? [];

  const handleEventClick = (arg: EventClickArg) => {
    const props = arg.event.extendedProps as CalendarEvent['extendedProps'];
    setSelected({
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.start?.toISOString() || '',
      end: arg.event.end?.toISOString() || '',
      color: arg.event.borderColor || arg.event.backgroundColor || '#3b82f6',
      extendedProps: props,
    });
  };

  const selectedStatus = selected?.extendedProps?.status || '';

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
            <p className="text-slate-500">Lihat semua jadwal keberangkatan bus {appName}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari rute, bus, atau supir..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={viewMode !== 'tabel'}
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 self-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('tabel')}
                className={
                  viewMode === 'tabel'
                    ? 'bg-white shadow-sm text-slate-900 hover:bg-white'
                    : 'text-slate-500 hover:text-slate-700'
                }
              >
                <LayoutList className="w-4 h-4 mr-1.5" /> Tabel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('kalender')}
                className={
                  viewMode === 'kalender'
                    ? 'bg-white shadow-sm text-slate-900 hover:bg-white'
                    : 'text-slate-500 hover:text-slate-700'
                }
              >
                <Calendar className="w-4 h-4 mr-1.5" /> Kalender
              </Button>
            </div>
          </div>

          {viewMode === 'tabel' ? (
            <>
              <div className="flex gap-2 flex-wrap mb-6">
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('')}
                >
                  Semua
                </Button>
                {Object.keys(statusColors).map((s) => (
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

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Tidak ada jadwal yang ditemukan</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((schedule) => (
                      <div
                        key={String(schedule.id)}
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {safeFormat(schedule.waktuBerangkat, 'HH:mm')}
                              </div>
                              <div className="text-xs text-slate-500">
                                {safeFormat(schedule.tanggal, 'EEEE, d MMM', { locale: id })}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {(schedule.route as { kodeRute: string } | null)?.kodeRute || '-'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {(schedule.route as { namaTujuan: string } | null)?.namaTujuan || '-'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bus className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {(schedule.bus as { platNomor: string } | null)?.platNomor || '-'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {(schedule.bus as { merek: string } | null)?.merek || '-'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {(schedule.supir as { nama: string } | null)?.nama || '-'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {schedule.kernet
                                    ? `Kernet: ${(schedule.kernet as { nama: string }).nama}`
                                    : 'Tanpa Kernet'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="text-sm font-semibold text-green-600">
                                  Rp {Number(schedule.hargaTiket).toLocaleString('id-ID')}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {Number(schedule.jumlahPenumpang)}/
                                  {(schedule.bus as { kapasitas: number } | null)?.kapasitas || '-'} penumpang
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`${statusColors[schedule.status as string] || 'bg-slate-100'} border-0 self-start lg:self-center`}
                          >
                            {statusLabels[schedule.status as string] || String(schedule.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Sebelumnya
                      </Button>
                      <span className="text-sm text-slate-500 px-2">
                        Halaman {page} dari {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-4">
                {calendarLoading ? (
                  <Skeleton className="h-[600px] rounded-lg" />
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    dayMaxEvents={true}
                    height="auto"
                    locales={[idLocale]}
                    locale="id"
                    buttonText={{
                      today: 'Hari Ini',
                      month: 'Bulan',
                      week: 'Minggu',
                      day: 'Hari',
                      list: 'Daftar',
                    }}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detail jadwal saat event kalender diklik (publik, tanpa edit) */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600" />
              {selected?.title}
            </DialogTitle>
            <DialogDescription>Detail jadwal perjalanan</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Tanggal</span>
                <span className="font-medium text-slate-900">
                  {safeFormat(selected.start, 'EEEE, d MMMM yyyy', { locale: id })}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Berangkat</span>
                <span className="font-medium text-slate-900">{safeFormat(selected.start, 'HH:mm')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Tiba</span>
                <span className="font-medium text-slate-900">{safeFormat(selected.end, 'HH:mm')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Supir</span>
                <span className="font-medium text-slate-900">{selected.extendedProps?.supir || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Harga</span>
                <span className="font-semibold text-green-600">
                  Rp {Number(selected.extendedProps?.hargaTiket || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <Badge className={`${statusColors[selectedStatus] || 'bg-slate-100'} border-0`}>
                  {statusLabels[selectedStatus] || selectedStatus}
                </Badge>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
