import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useContactSettings } from '@/hooks/useContactSettings';

export default function KontakPage() {
  const [submitted, setSubmitted] = useState(false);
  const contact = useContactSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Hubungi Kami</h1>
            <p className="text-slate-500">Kami siap membantu Anda dengan pertanyaan atau pemesanan</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Informasi Kontak</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Telepon</div>
                      <div className="text-sm text-slate-500">{contact.phonePrimary}</div>
                      <div className="text-sm text-slate-500">{contact.phoneSecondary}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Email</div>
                      <div className="text-sm text-slate-500">{contact.emailPrimary}</div>
                      <div className="text-sm text-slate-500">{contact.emailSecondary}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Alamat</div>
                      <div className="text-sm text-slate-500">{contact.address}</div>
                      <div className="text-sm text-slate-500">{contact.addressDetail}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Jam Operasional</div>
                      <div className="text-sm text-slate-500">{contact.operationalHours}</div>
                      <div className="text-sm text-slate-500">{contact.operationalDetail}</div>
                    </div>
                  </div>
                  {contact.whatsapp ? (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">WhatsApp</div>
                        <a
                          href={`https://wa.me/${contact.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:underline"
                        >
                          Chat kami via WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Terminal Locations */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Terminal Keberangkatan</h2>
                <div className="space-y-3">
                  {contact.terminals.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-slate-700">{t.name}</div>
                        <div className="text-slate-500">{t.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="font-semibold text-slate-900 mb-6">Kirim Pesan</h2>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Pesan Terkirim!</h3>
                    <p className="text-slate-500">Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="nama">Nama Lengkap</Label>
                        <Input id="nama" placeholder="Masukkan nama Anda" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@contoh.com" required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="telepon">Nomor Telepon</Label>
                        <Input id="telepon" placeholder="081234567890" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subjek">Subjek</Label>
                        <Input id="subjek" placeholder="Pertanyaan / Pemesanan / Lainnya" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pesan">Pesan</Label>
                      <Textarea id="pesan" placeholder="Tulis pesan Anda di sini..." rows={6} required />
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-2" /> Kirim Pesan
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
