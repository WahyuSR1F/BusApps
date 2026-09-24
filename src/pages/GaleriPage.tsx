import { Link } from 'react-router-dom'; // Import Link here
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Bus, Users, Settings, Star, ArrowLeft } from 'lucide-react';
import { useAppName } from '@/hooks/useContactSettings';

export default function GaleriPage() {
  const appName = useAppName();
  const allBuses = [
    {
      id: 1,
      status: 'aktif',
      platNomor: 'AB 1234 XY',
      merek: 'Toyota',
      model: 'Corolla',
      kapasitas: 50,
      tahun: 2020,
      fasilitas: 'AC, GPS, Wi-Fi'
    },
    {
      id: 2,
      status: 'perbaikan',
      platNomor: 'AB 5678 XY',
      merek: 'Honda',
      model: 'Civic',
      kapasitas: 40,
      tahun: 2019,
      fasilitas: 'GPS, Wi-Fi'
    },
    // Add more dummy buses as needed
  ];

  const fasilitasList = (fasilitas: string | null) => {
    if (!fasilitas) return [];
    return fasilitas.split(',').map(f => f.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Galeri Armada</h1>
            <p className="text-slate-500">Koleksi armada bus {appName} yang siap melayani perjalanan Anda</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {allBuses.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBuses.map((bus) => (
                <div key={bus.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative">
                    <Bus className="w-20 h-20 text-white/20" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bus.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {bus.status === 'aktif' ? 'Aktif' : 'Perbaikan'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1 bg-white/90 rounded-lg text-sm font-bold text-slate-800">
                        {bus.platNomor}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{bus.merek} {bus.model}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        {bus.kapasitas} kursi
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Settings className="w-4 h-4 text-slate-400" />
                        Tahun {bus.tahun}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fasilitasList(bus.fasilitas).map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
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
      </div>
      <Footer />
    </div>
  );
}
