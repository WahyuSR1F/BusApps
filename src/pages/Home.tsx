import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import JadwalHariIni from '@/components/public/JadwalHariIni';
import RutePopuler from '@/components/public/RutePopuler';
import GaleriArmada from '@/components/public/GaleriArmada';
import Footer from '@/components/public/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <JadwalHariIni />
      <RutePopuler />
      <GaleriArmada />
      <Footer />
    </div>
  );
}
