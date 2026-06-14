import { trpc } from '@/providers/trpc';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Bus, Route, Users, Calendar, TrendingUp, ArrowRight, Clock
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface ScheduleItem {
  id: number;
  waktuBerangkat: string;
  status: string;
  bus: { platNomor: string } | null;
  route: { kodeRute: string } | null;
  supir: { nama: string } | null;
}

export default function DashboardOverview() {
  const { data: busesData, isLoading: busesLoading } = trpc.bus.list.useQuery({ status: 'aktif', limit: 1 });
  const { data: schedulesData, isLoading: schedulesLoading } = trpc.schedule.list.useQuery({ limit: 100 });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySchedules = schedulesData?.items?.filter((s: Record<string, unknown>) => {
    const sDate = s.tanggal ? format(new Date(s.tanggal as string), 'yyyy-MM-dd') : '';
    return sDate === today;
  }) || [];

  const activeBusesCount = busesData?.total || 0;
  const todayCount = todaySchedules.length;
  const totalPassengers = todaySchedules.reduce((sum: number, s: Record<string, unknown>) => sum + (s.jumlahPenumpang as number || 0), 0);
  const onTheRoad = schedulesData?.items?.filter((s: Record<string, unknown>) => s.status === 'berangkat').length || 0;

  // Chart data - next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = schedulesData?.items?.filter((s: Record<string, unknown>) => {
      const sDate = s.tanggal ? format(new Date(s.tanggal as string), 'yyyy-MM-dd') : '';
      return sDate === dateStr;
    }).length || 0;
    return { name: format(date, 'EEE'), count };
  });

  // Route distribution
  const routeCounts: Record<string, number> = {};
  schedulesData?.items?.forEach((s: Record<string, unknown>) => {
    const routeName = (s.route as Record<string, unknown> | null)?.namaTujuan as string || 'Unknown';
    routeCounts[routeName] = (routeCounts[routeName] || 0) + 1;
  });
  const routeChartData = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const recentSchedules = (schedulesData?.items?.slice(0, 5) || []) as unknown as ScheduleItem[];

  const statCards = [
    { title: 'Bus Aktif', value: activeBusesCount, icon: Bus, color: 'bg-blue-500', link: '/dashboard/bus' },
    { title: 'Jadwal Hari Ini', value: todayCount, icon: Calendar, color: 'bg-green-500', link: '/dashboard/jadwal' },
    { title: 'Total Penumpang', value: totalPassengers, icon: Users, color: 'bg-purple-500', link: '/dashboard/jadwal' },
    { title: 'Dalam Perjalanan', value: onTheRoad, icon: TrendingUp, color: 'bg-amber-500', link: '/dashboard/kalender' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Ringkasan aktivitas dan statistik SafaTrans</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {busesLoading || schedulesLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          statCards.map((stat, i) => (
            <Link key={i} to={stat.link}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Jadwal 7 Hari ke Depan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={next7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-600" />
              Distribusi per Rute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={routeChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {routeChartData.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {routeChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Jadwal Terbaru
            </CardTitle>
            <Link to="/dashboard/jadwal">
              <Button variant="ghost" size="sm" className="text-blue-600">
                Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Rute</div>
                    <div className="text-sm font-medium text-slate-900">{schedule.route?.kodeRute || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Bus</div>
                    <div className="text-sm font-medium text-slate-900">{schedule.bus?.platNomor || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Supir</div>
                    <div className="text-sm font-medium text-slate-900">{schedule.supir?.nama || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Berangkat</div>
                    <div className="text-sm font-medium text-slate-900">
                      {schedule.waktuBerangkat ? format(new Date(schedule.waktuBerangkat), 'dd/MM HH:mm') : '-'}
                    </div>
                  </div>
                </div>
                <Badge className={`${statusColors[schedule.status] || 'bg-slate-100'} border-0`}>
                  {statusLabels[schedule.status] || schedule.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/dashboard/bus/tambah', icon: Bus, label: 'Tambah Bus', color: 'bg-blue-50 text-blue-600' },
          { to: '/dashboard/rute/tambah', icon: Route, label: 'Tambah Rute', color: 'bg-green-50 text-green-600' },
          { to: '/dashboard/jadwal/tambah', icon: Calendar, label: 'Tambah Jadwal', color: 'bg-purple-50 text-purple-600' },
          { to: '/dashboard/supir/tambah', icon: Users, label: 'Tambah Supir', color: 'bg-amber-50 text-amber-600' },
        ].map((item, i) => (
          <Link key={i} to={item.to}>
            <div className={`${item.color} rounded-xl p-4 text-center hover:shadow-md transition-all border border-slate-100`}>
              <item.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
