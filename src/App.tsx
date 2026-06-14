import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/dashboard/DashboardLayout'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import JadwalLengkap from './pages/JadwalLengkap'
import GaleriPage from './pages/GaleriPage'
import TentangPage from './pages/TentangPage'
import KontakPage from './pages/KontakPage'
import BusPage from './pages/dashboard/BusPage'
import BusFormPage from './pages/dashboard/BusFormPage'
import RutePage from './pages/dashboard/RutePage'
import RuteFormPage from './pages/dashboard/RuteFormPage'
import SupirPage from './pages/dashboard/SupirPage'
import SupirFormPage from './pages/dashboard/SupirFormPage'
import KernetPage from './pages/dashboard/KernetPage'
import KernetFormPage from './pages/dashboard/KernetFormPage'
import JadwalPage from './pages/dashboard/JadwalPage'
import JadwalFormPage from './pages/dashboard/JadwalFormPage'
import KalenderPage from './pages/dashboard/KalenderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/jadwal" element={<JadwalLengkap />} />
      <Route path="/galeri" element={<GaleriPage />} />
      <Route path="/tentang" element={<TentangPage />} />
      <Route path="/kontak" element={<KontakPage />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="kalender" element={<KalenderPage />} />
        <Route path="jadwal" element={<JadwalPage />} />
        <Route path="jadwal/tambah" element={<JadwalFormPage />} />
        <Route path="jadwal/:id/edit" element={<JadwalFormPage />} />
        <Route path="bus" element={<BusPage />} />
        <Route path="bus/tambah" element={<BusFormPage />} />
        <Route path="bus/:id/edit" element={<BusFormPage />} />
        <Route path="rute" element={<RutePage />} />
        <Route path="rute/tambah" element={<RuteFormPage />} />
        <Route path="rute/:id/edit" element={<RuteFormPage />} />
        <Route path="supir" element={<SupirPage />} />
        <Route path="supir/tambah" element={<SupirFormPage />} />
        <Route path="supir/:id/edit" element={<SupirFormPage />} />
        <Route path="kernet" element={<KernetPage />} />
        <Route path="kernet/tambah" element={<KernetFormPage />} />
        <Route path="kernet/:id/edit" element={<KernetFormPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
