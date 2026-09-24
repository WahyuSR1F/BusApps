import { Link } from 'react-router';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';
import { useContactSettings } from '@/hooks/useContactSettings';

export default function Footer() {
  const contact = useContactSettings();
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{contact.appName}</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Perusahaan bus travel terpercaya yang menyediakan layanan perjalanan nyaman dan aman ke seluruh Indonesia.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{contact.phonePrimary}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{contact.emailPrimary}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{contact.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Beranda' },
                { to: '/jadwal', label: 'Jadwal' },
                { to: '/galeri', label: 'Galeri Armada' },
                { to: '/tentang', label: 'Tentang Kami' },
                { to: '/kontak', label: 'Kontak' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Layanan</h3>
            <ul className="space-y-2">
              {['Bus Eksekutif', 'Bus Bisnis', 'Bus AC', 'Charter Bus', 'Paket Wisata'].map((service) => (
                <li key={service}>
                  <span className="text-sm text-slate-400">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Routes */}
          <div>
            <h3 className="text-white font-semibold mb-4">Rute Populer</h3>
            <ul className="space-y-2">
              {['Jakarta - Surabaya', 'Jakarta - Yogyakarta', 'Jakarta - Semarang', 'Jakarta - Malang', 'Jakarta - Bandung'].map((route) => (
                <li key={route}>
                  <span className="text-sm text-slate-400">{route}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {contact.appName}. All rights reserved.
          </p>
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
