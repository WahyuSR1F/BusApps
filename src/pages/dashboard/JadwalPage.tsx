import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import type { EventClickArg } from '@fullcalendar/core';
import DataTable from '@/components/dashboard/DataTable';
import ExportJadwalDialog from '@/components/dashboard/ExportJadwalDialog';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, LayoutList, Plus, FileDown } from 'lucide-react';
import { Link } from 'react-router';

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

type ViewMode = 'tabel' | 'kalender';

// Format tanggal/waktu dengan fallback agar nilai invalid tidak mem-crash render.
const safeDate = (value: unknown, pattern: string) => {
  if (!value) return '-';
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? '-' : format(date, pattern);
};

export default function JadwalPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tabel');
  const [exportOpen, setExportOpen] = useState(false);
  const utils = trpc.useUtils();

  // Data tabel memakai schedule.list (sama seperti halaman Bus/Rute).
  const { data, isLoading } = trpc.schedule.list.useQuery({
    search: search || undefined,
    page,
    limit: 10,
  });

  // Data kalender memakai endpoint khusus (enabled hanya saat view kalender).
  const { data: calendarData, isLoading: calendarLoading } =
    trpc.schedule.calendarEvents.useQuery(undefined, {
      enabled: viewMode === 'kalender',
    });

  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      utils.schedule.list.invalidate();
      utils.schedule.calendarEvents.invalidate();
    },
  });

  const calendarEvents =
    calendarData?.map((e: Record<string, unknown>) => ({
      id: e.id as string,
      title: e.title as string,
      start: e.start as string,
      end: e.end as string,
      color: e.color as string,
    })) ?? [];

  const handleEventClick = (arg: EventClickArg) => {
    navigate(`/dashboard/jadwal/${arg.event.id}/edit`);
  };

  const handleDateSelect = () => {
    navigate('/dashboard/jadwal/tambah');
  };

  const columns = [
    {
      key: 'tanggal',
      label: 'Tanggal',
      render: (value: unknown) => safeDate(value, 'dd/MM/yyyy'),
    },
    {
      key: 'waktuBerangkat',
      label: 'Berangkat',
      render: (value: unknown) => safeDate(value, 'HH:mm'),
    },
    {
      key: 'ruteId',
      label: 'Rute',
      render: (_value: unknown, row: Record<string, unknown>) => (row.route as { kodeRute: string } | null)?.kodeRute || '-',
    },
    {
      key: 'busId',
      label: 'Bus',
      render: (_value: unknown, row: Record<string, unknown>) => (row.bus as { platNomor: string } | null)?.platNomor || '-',
    },
    {
      key: 'supirId',
      label: 'Supir',
      render: (_value: unknown, row: Record<string, unknown>) => (row.supir as { nama: string } | null)?.nama || '-',
    },
    {
      key: 'hargaTiket',
      label: 'Harga',
      render: (value: unknown) => `Rp ${Number(value).toLocaleString('id-ID')}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <Badge className={`${statusColors[value as string] || 'bg-slate-100'} border-0`}>
          {statusLabels[value as string]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen Jadwal</h2>
          <p className="text-slate-500">Kelola jadwal perjalanan bus</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
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
              <CalendarDays className="w-4 h-4 mr-1.5" /> Kalender
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" /> Export PDF
          </Button>
          <Link to="/dashboard/jadwal/tambah">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </Link>
        </div>
      </div>
      {viewMode === 'tabel' ? (
        <DataTable
          columns={columns}
          data={(data?.items as Record<string, unknown>[]) || []}
          isLoading={isLoading}
          total={data?.total || 0}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
          onSearch={setSearch}
          onDelete={(id) => deleteMutation.mutate({ id })}
          addLink="/dashboard/jadwal/tambah"
          editLinkPrefix="/dashboard/jadwal"
          searchPlaceholder="Cari rute, bus, atau supir..."
        />
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
                select={handleDateSelect}
                editable={true}
                selectable={true}
                selectMirror={true}
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
      <ExportJadwalDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
