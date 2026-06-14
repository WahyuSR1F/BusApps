import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import DataTable from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  nonaktif: 'bg-red-100 text-red-700',
};

export default function RutePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.route.list.useQuery({ search: search || undefined, page, limit: 10 });
  const deleteMutation = trpc.route.delete.useMutation({
    onSuccess: () => utils.route.list.invalidate(),
  });

  const columns = [
    { key: 'kodeRute', label: 'Kode Rute' },
    { key: 'namaTujuan', label: 'Tujuan' },
    {
      key: 'hargaTiket',
      label: 'Harga',
      render: (value: unknown) => `Rp ${Number(value).toLocaleString('id-ID')}`,
    },
    {
      key: 'estimasiJam',
      label: 'Estimasi',
      render: (_value: unknown, row: Record<string, unknown>) => `${row.estimasiJam}j ${row.estimasiMenit}m`,
    },
    { key: 'jarakKm', label: 'Jarak (km)' },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <Badge className={`${statusColors[value as string] || 'bg-slate-100'} border-0`}>
          {value as string === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Manajemen Rute"
      description="Kelola rute dan tujuan perjalanan"
      columns={columns}
      data={(data?.items as Record<string, unknown>[]) || []}
      isLoading={isLoading}
      total={data?.total || 0}
      page={data?.page || 1}
      totalPages={data?.totalPages || 1}
      onPageChange={setPage}
      onSearch={setSearch}
      onDelete={(id) => deleteMutation.mutate({ id })}
      addLink="/dashboard/rute/tambah"
      editLinkPrefix="/dashboard/rute"
      searchPlaceholder="Cari tujuan atau kode rute..."
    />
  );
}
