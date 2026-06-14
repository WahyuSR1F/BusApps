import { trpc } from '@/providers/trpc';
import { Bus, Users, Settings, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GaleriArmada() {
  const { data, isLoading } = trpc.bus.list.useQuery({ status: 'aktif', limit: 6 });

  const fasilitasList = (fasilitas: string | null) => {
    if (!fasilitas) return [];
    return fasilitas.split(',').map(f => f.trim()).filter(Boolean);
  };

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Bus className="w-4 h-4" />
            Armada Kami
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Galeri Armada Bus</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Armada bus modern dengan berbagai kelas dan fasilitas untuk kenyamanan perjalanan Anda
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((bus: Record<string, unknown> & { id: number }) => (
              <div
                key={bus.id}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative">
                  <Bus className="w-16 h-16 text-white/20" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bus.status === 'aktif' ? 'bg-green-100 text-green-700' :
                      bus.status === 'perbaikan' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {bus.status === 'aktif' ? 'Aktif' : bus.status === 'perbaikan' ? 'Perbaikan' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-white/90 rounded text-xs font-bold text-slate-800">
                      {bus.platNomor as string}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1">{bus.merek as string} {bus.model as string}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {bus.kapasitas as number} kursi
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings className="w-4 h-4" /> {bus.tahun as number}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fasilitasList(bus.fasilitas as string | null).map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        <Star className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
