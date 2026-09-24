import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import DataTable from '@/components/dashboard/DataTable';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, LayoutList, Plus } from 'lucide-react';
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

export default function JadwalPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tabel');

  // Data kalender memakai API yang sama dengan halaman Kalender.
  const { data: calendarData, isLoading: calendarLoading } =
    trpc.schedule.calendarEvents.useQuery(undefined, {
      enabled: viewMode === 'kalender',
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

  // Contoh data untuk demo
  const sampleData = [
    {
      tanggal: new Date('2023-10-05T08:00:00Z').toISOString(),
      waktuBerangkat: '08:00',
      ruteId: 1,
      busId: 2,
      supirId: 3,
      hargaTiket: 20000,
      status: 'tersedia',
    },
    {
      tanggal: new Date('2023-10-05T09:00:00Z').toISOString(),
      waktuBerangkat: '09:00',
      ruteId: 1,
      busId: 4,
      supirId: 5,
      hargaTiket: 25000,
      status: 'berangkat',
    },
    // Tambahkan lebih banyak data contoh sesuai kebutuhan
  ];

  const columns = [
    {
      key: 'tanggal',
      label: 'Tanggal',
      render: (value: unknown) => (value ? format(new Date(value as string), 'dd/MM/yyyy') : '-'),
    },
    {
      key: 'waktuBerangkat',
      label: 'Berangkat',
      render: (value: unknown) => (value ? format(new Date(value as string), 'HH:mm') : '-'),
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

  const tableContent = (
    <DataTable
      columns={columns}
      data={sampleData || []} // Gunakan data contoh saat ini
      isLoading={false}
      total={10} // Jumlah total data dummy
      page={page}
      totalPages={2} // Jumlah total halaman dummy
      onPageChange={setPage}
      onSearch={setSearch}
      onDelete={(id) => console.warn('Delete dummy schedule:', id)}
      addLink="/dashboard/jadwal/tambah"
      editLinkPrefix="/dashboard/jadwal"
      searchPlaceholder="Cari rute, bus, atau supir..."
    />
  );

  const calendarContent = (
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
  );

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
          <Link to="/dashboard/jadwal/tambah">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </Link>
        </div>
      </div>
      {viewMode === 'tabel' ? tableContent : calendarContent}
    </div>
  );
}