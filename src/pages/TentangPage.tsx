import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Bus, Shield, Clock, Users, Award, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Tentang SafaTrans</h1>
            <p className="text-slate-500">Mengenal lebih dekat perusahaan bus travel terpercaya Indonesia</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Company Story */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
                <Heart className="w-4 h-4" />
                Cerita Kami
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Melayani Perjalanan Indonesia Sejak 2010</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                SafaTrans didirikan dengan visi untuk memberikan layanan transportasi darat yang aman, nyaman, dan terpercaya. 
                Dimulai dari satu rute Jakarta-Bandung dengan 3 unit bus, kini kami telah berkembang menjadi salah satu 
                perusahaan bus travel terkemuka dengan menjangkau lebih dari 30 kota di Pulau Jawa dan Sumatera.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Kami berkomitmen untuk terus meningkatkan kualitas layanan melalui armada modern, supir berpengalaman, 
                dan fasilitas terbaik untuk memastikan setiap perjalanan Anda menjadi pengalaman yang menyenangkan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Bus, value: '50+', label: 'Armada Bus' },
                { icon: Users, value: '200+', label: 'Karyawan' },
                { icon: Shield, value: '1M+', label: 'Penumpang Puas' },
                { icon: Award, value: '15', label: 'Tahun Pengalaman' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Nilai-Nilai Kami</h2>
              <p className="text-slate-500">Prinsip yang kami pegang teguh dalam melayani Anda</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'Keamanan Utama', desc: 'Keselamatan penumpang adalah prioritas tertinggi kami. Setiap bus dilengkapi dengan peralatan keselamatan dan dicek secara rutin.' },
                { icon: Clock, title: 'Ketepatan Waktu', desc: 'Kami memahami pentingnya waktu Anda. Komitmen kami adalah 99% ketepatan jadwal keberangkatan.' },
                { icon: Heart, title: 'Kenyamanan', desc: 'Armada modern dengan AC, TV, WiFi, dan USB charger untuk pengalaman perjalanan terbaik Anda.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
