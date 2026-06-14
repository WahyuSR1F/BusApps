import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import DataTable from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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

export default function JadwalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.schedule.list.useQuery({ search: search || undefined, page, limit: 10 });
  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => utils.schedule.list.invalidate(),
  });

  const columns = [
    {
      key: 'tanggal',
      label: 'Tanggal',
      render: (value: unknown) => value ? format(new Date(value as string), 'dd/MM/yyyy') : '-',
    },
    {
      key: 'waktuBerangkat',
      label: 'Berangkat',
      render: (value: unknown) => value ? format(new Date(value as string), 'HH:mm') : '-',
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
          {statusLabels[value as string] || String(value)}
        </Badge>
      ),
    },
  ];

  const items = (data?.items || []) as unknown as Record<string, unknown>[];

  return (
    <DataTable
      title="Manajemen Jadwal"
      description="Kelola jadwal perjalanan bus"
      columns={columns}
      data={items}
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
  );
}
