import { useState } from 'react';
import { useNavigate } from 'react-router';
import { trpc } from '@/providers/trpc';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Bus, MapPin, User, Banknote, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';

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

export default function KalenderPage() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: events, isLoading } = trpc.schedule.calendarEvents.useQuery();
  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      utils.schedule.calendarEvents.invalidate();
      utils.schedule.list.invalidate();
      setDialogOpen(false);
    },
  });

  const handleEventClick = (arg: EventClickArg) => {
    const props = arg.event.extendedProps;
    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.start,
      end: arg.event.end,
      color: arg.event.backgroundColor,
      ...props,
    });
    setDialogOpen(true);
  };

  const handleDateSelect = (_arg: DateSelectArg) => {
    navigate(`/dashboard/jadwal/tambah`);
  };

  const calendarEvents = events?.map((e: Record<string, unknown>) => ({
    id: e.id as string,
    title: e.title as string,
    start: e.start as string,
    end: e.end as string,
    color: e.color as string,
    extendedProps: e.extendedProps as Record<string, unknown>,
  })) || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Kalender Jadwal</h2>
        <p className="text-slate-500">Lihat dan kelola jadwal dalam tampilan kalender</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          {isLoading ? (
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Detail Jadwal
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{selectedEvent.title as string}</h3>
                <Badge className={`${statusColors[(selectedEvent.status as string) || 'tersedia'] || 'bg-slate-100'} border-0`}>
                  {statusLabels[(selectedEvent.status as string) || 'tersedia'] || 'Tersedia'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-500">Waktu</div>
                    <div className="text-sm font-medium">
                      {selectedEvent.start ? format(new Date(selectedEvent.start as string), 'dd MMM yyyy HH:mm') : '-'} -
                      {selectedEvent.end ? format(new Date(selectedEvent.end as string), 'HH:mm') : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Bus className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-500">Bus ID</div>
                    <div className="text-sm font-medium">{String(selectedEvent.busId)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-500">Rute ID</div>
                    <div className="text-sm font-medium">{String(selectedEvent.ruteId)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-500">Supir</div>
                    <div className="text-sm font-medium">{selectedEvent.supir as string || '-'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-500">Harga Tiket</div>
                    <div className="text-sm font-medium">Rp {Number(selectedEvent.hargaTiket).toLocaleString('id-ID')}</div>
                  </div>
                </div>

                {(selectedEvent.jumlahPenumpang as number) > 0 && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-500">Penumpang</div>
                      <div className="text-sm font-medium">{selectedEvent.jumlahPenumpang as number} orang</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    navigate(`/dashboard/jadwal/${selectedEvent.id}/edit`);
                    setDialogOpen(false);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus jadwal ini?')) {
                      deleteMutation.mutate({ id: Number(selectedEvent.id) });
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
