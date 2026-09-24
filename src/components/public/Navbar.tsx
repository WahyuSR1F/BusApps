import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Bus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppName } from '@/hooks/useContactSettings';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const appName = useAppName();

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/jadwal', label: 'Jadwal' },
    { to: '/galeri', label: 'Galeri' },
    { to: '/tentang', label: 'Tentang' },
    { to: '/kontak', label: 'Kontak' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">{appName}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button size="sm" variant="ghost" className="text-slate-600 hover:text-blue-600">
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Daftar
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === link.to
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button size="sm" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Masuk
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
