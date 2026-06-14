import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import DataTable from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  cuti: 'bg-amber-100 text-amber-700',
  nonaktif: 'bg-red-100 text-red-700',
};

export default function SupirPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.employee.list.useQuery({ role: 'supir', search: search || undefined, page, limit: 10 });
  const deleteMutation = trpc.employee.delete.useMutation({
    onSuccess: () => utils.employee.list.invalidate(),
  });

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'noTelp', label: 'Telepon' },
    { key: 'noSim', label: 'No. SIM' },
    { key: 'jenisSim', label: 'Jenis SIM' },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <Badge className={`${statusColors[value as string] || 'bg-slate-100'} border-0`}>
          {value as string === 'aktif' ? 'Aktif' : value as string === 'cuti' ? 'Cuti' : 'Nonaktif'}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Manajemen Supir"
      description="Kelola data supir bus"
      columns={columns}
      data={(data?.items as Record<string, unknown>[]) || []}
      isLoading={isLoading}
      total={data?.total || 0}
      page={data?.page || 1}
      totalPages={data?.totalPages || 1}
      onPageChange={setPage}
      onSearch={setSearch}
      onDelete={(id) => deleteMutation.mutate({ id })}
      addLink="/dashboard/supir/tambah"
      editLinkPrefix="/dashboard/supir"
      searchPlaceholder="Cari nama supir..."
    />
  );
}
