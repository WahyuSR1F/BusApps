import { Link } from 'react-router';
import { ArrowRight, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppName } from '@/hooks/useContactSettings';

export default function Hero() {
  const appName = useAppName();
  return (
    <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Melayani perjalanan Anda sejak 2010
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Perjalanan Nyaman & <span className="text-blue-300">Aman</span> ke Seluruh Indonesia
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0">
              {appName} menyediakan layanan bus travel premium dengan armada modern, supir berpengalaman, dan fasilitas lengkap untuk kenyamanan perjalanan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/jadwal">
                <Button size="lg" className="bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-950/40 font-semibold px-8">
                  Lihat Jadwal <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/kontak">
                <Button size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold px-8">
                  Hubungi Kami
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-blue-200">Armada Bus</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-white">100+</div>
                <div className="text-sm text-blue-200">Rute Perjalanan</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-white">1M+</div>
                <div className="text-sm text-blue-200">Penumpang Puas</div>
              </div>
            </div>
          </div>

          {/* Right side - Features */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, title: '30+ Kota', desc: 'Jangkauan seluruh Jawa & Sumatera' },
              { icon: Clock, title: 'Tepat Waktu', desc: '99% ketepatan jadwal keberangkatan' },
              { icon: Shield, title: 'Garansi Aman', desc: 'Asuransi perjalanan untuk penumpang' },
              { icon: BusIcon, title: 'Armada Premium', desc: 'Bus terbaru dengan fasilitas lengkap' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <item.icon className="w-8 h-8 text-blue-300 mb-3" />
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-blue-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
    </svg>
  );
}
