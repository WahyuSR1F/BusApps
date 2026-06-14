import { trpc } from '@/providers/trpc';
import { MapPin, Clock, ArrowRight, Route, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router';

export default function RutePopuler() {
  const { data, isLoading } = trpc.route.list.useQuery({ limit: 6 });

  return (
    <section id="rute" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Route className="w-4 h-4" />
            Destinasi
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Rute Populer</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Pilihan rute perjalanan terfavorit dengan harga terbaik dan fasilitas lengkap
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((route: Record<string, unknown> & { id: number }) => (
              <div
                key={route.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <h3 className="text-white font-bold text-lg">{route.namaTujuan as string}</h3>
                    <p className="text-white/80 text-sm">{route.kodeRute as string}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {route.estimasiJam as number}j {route.estimasiMenit as number}m
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {route.jarakKm as number} km
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="truncate">{route.terminalAsal as string}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{route.terminalTujuan as string}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Banknote className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        Rp {Number(route.hargaTiket).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <Link to="/jadwal">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 group-hover:bg-blue-50">
                        Pesan <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
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
