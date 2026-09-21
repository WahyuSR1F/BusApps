import { useState } from 'react';
import { format } from 'date-fns';
import DataTable from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';

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
  const [, setSearch] = useState('');

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

  return (
    <DataTable
      title="Manajemen Jadwal"
      description="Kelola jadwal perjalanan bus"
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
}