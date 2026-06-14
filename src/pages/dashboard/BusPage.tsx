import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import DataTable from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  perbaikan: 'bg-amber-100 text-amber-700',
  nonaktif: 'bg-red-100 text-red-700',
};

export default function BusPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.bus.list.useQuery({ search: search || undefined, page, limit: 10 });
  const deleteMutation = trpc.bus.delete.useMutation({
    onSuccess: () => {
      utils.bus.list.invalidate();
    },
  });

  const columns = [
    { key: 'platNomor', label: 'Plat Nomor' },
    { key: 'merek', label: 'Merek' },
    { key: 'model', label: 'Model' },
    { key: 'kapasitas', label: 'Kapasitas' },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <Badge className={`${statusColors[value as string] || 'bg-slate-100'} border-0`}>
          {value as string === 'aktif' ? 'Aktif' : value as string === 'perbaikan' ? 'Perbaikan' : 'Nonaktif'}
        </Badge>
      ),
    },
    { key: 'tahun', label: 'Tahun' },
  ];

  return (
    <DataTable
      title="Manajemen Bus"
      description="Kelola armada bus SafaTrans"
      columns={columns}
      data={(data?.items as Record<string, unknown>[]) || []}
      isLoading={isLoading}
      total={data?.total || 0}
      page={data?.page || 1}
      totalPages={data?.totalPages || 1}
      onPageChange={setPage}
      onSearch={setSearch}
      onDelete={(id) => deleteMutation.mutate({ id })}
      addLink="/dashboard/bus/tambah"
      editLinkPrefix="/dashboard/bus"
      searchPlaceholder="Cari plat nomor..."
    />
  );
}
