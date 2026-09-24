import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LOGIN_PATH } from '@/const';
import {
  Bus, Route, Users, Calendar, LayoutDashboard, Menu, X, ChevronDown,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const sidebarLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/kalender', icon: Calendar, label: 'Kalender' },
  { to: '/dashboard/jadwal', icon: Calendar, label: 'Jadwal' },
  { to: '/dashboard/bus', icon: Bus, label: 'Bus' },
  { to: '/dashboard/rute', icon: Route, label: 'Rute' },
  { to: '/dashboard/supir', icon: Users, label: 'Supir' },
  { to: '/dashboard/kernet', icon: Users, label: 'Kernet' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Guard: halaman /dashboard hanya untuk admin.
  const { user, isLoading, logout } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Memuat...</p>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Akses ditolak</h1>
          <p className="text-sm text-slate-500 mt-2">
            Halaman ini hanya untuk admin. Anda login sebagai pelanggan.
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              Ke Beranda
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => logout()}
            >
              Ganti Akun
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">SafaTrans</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-64px)]">
          <nav className="p-3 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
              Menu Utama
            </div>
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {sidebarLinks.find(l => location.pathname === l.to || location.pathname.startsWith(`${l.to}/`))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</div>
                <div className="text-xs text-slate-500">{user?.email || 'Administrator'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500"
              onClick={() => logout()}
            >
              Keluar
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
