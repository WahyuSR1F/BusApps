import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Building2,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';

const profilSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  whatsapp: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Nomor hanya boleh berisi angka dan karakter + - ( )')
    .optional()
    .or(z.literal('')),
});

type ProfilFormData = z.infer<typeof profilSchema>;

const contactSchema = z.object({
  appName: z.string().min(1, 'Nama aplikasi minimal 1 karakter').max(100),
  phonePrimary: z.string().max(50).optional().or(z.literal('')),
  phoneSecondary: z.string().max(50).optional().or(z.literal('')),
  emailPrimary: z.string().max(320).optional().or(z.literal('')),
  emailSecondary: z.string().max(320).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  addressDetail: z.string().max(300).optional().or(z.literal('')),
  operationalHours: z.string().max(200).optional().or(z.literal('')),
  operationalDetail: z.string().max(200).optional().or(z.literal('')),
  contactWhatsapp: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Nomor hanya boleh berisi angka dan karakter + - ( )')
    .optional()
    .or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

type Terminal = { name: string; city: string };

export default function ProfilPage() {
  const utils = trpc.useUtils();
  const { data: me, isLoading } = trpc.auth.me.useQuery();
  const { data: settings, isLoading: settingsLoading } = trpc.settings.get.useQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfilFormData>({
    resolver: zodResolver(profilSchema) as never,
    defaultValues: { name: '', whatsapp: '' },
  });

  useEffect(() => {
    if (me) {
      reset({
        name: me.name || '',
        whatsapp: me.whatsapp || '',
      });
    }
  }, [me, reset]);

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success('Profil berhasil disimpan.');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menyimpan profil.');
    },
  });

  const onSubmitProfile = (data: ProfilFormData) => {
    updateMutation.mutate({
      name: data.name,
      whatsapp: data.whatsapp || '',
    });
  };

  // ---------- Form kontak situs ----------
  const {
    register: registerContact,
    handleSubmit: handleContactSubmit,
    reset: resetContact,
    formState: { errors: contactErrors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema) as never,
    defaultValues: {
      appName: 'SafaTrans',
      phonePrimary: '',
      phoneSecondary: '',
      emailPrimary: '',
      emailSecondary: '',
      address: '',
      addressDetail: '',
      operationalHours: '',
      operationalDetail: '',
      contactWhatsapp: '',
    },
  });

  const [terminals, setTerminals] = useState<Terminal[]>([]);

  useEffect(() => {
    if (settings) {
      resetContact({
        appName: settings.appName || 'SafaTrans',
        phonePrimary: settings.phonePrimary || '',
        phoneSecondary: settings.phoneSecondary || '',
        emailPrimary: settings.emailPrimary || '',
        emailSecondary: settings.emailSecondary || '',
        address: settings.address || '',
        addressDetail: settings.addressDetail || '',
        operationalHours: settings.operationalHours || '',
        operationalDetail: settings.operationalDetail || '',
        contactWhatsapp: settings.whatsapp || '',
      });
      setTerminals((settings.terminals as Terminal[] | null) || []);
    }
  }, [settings, resetContact]);

  const settingsMutation = trpc.settings.update.useMutation({
    onSuccess: async () => {
      await utils.settings.get.invalidate();
      toast.success('Informasi kontak berhasil disimpan.');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menyimpan informasi kontak.');
    },
  });

  const onSubmitContact = (data: ContactFormData) => {
    settingsMutation.mutate({
      appName: data.appName,
      phonePrimary: data.phonePrimary,
      phoneSecondary: data.phoneSecondary,
      emailPrimary: data.emailPrimary,
      emailSecondary: data.emailSecondary,
      address: data.address,
      addressDetail: data.addressDetail,
      operationalHours: data.operationalHours,
      operationalDetail: data.operationalDetail,
      whatsapp: data.contactWhatsapp || '',
      terminals,
    });
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profil Admin</h2>
        <p className="text-slate-500">
          Kelola nama aplikasi, data akun, nomor WhatsApp, dan kontak publik
        </p>
      </div>

      {/* ---------- Profil akun ---------- */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">
            <div className="flex items-center gap-4 pb-2">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <UserRound className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{me?.name || 'Admin'}</div>
                <div className="text-sm text-slate-500">{me?.email}</div>
                {me?.role ? (
                  <Badge className="mt-1 bg-blue-100 text-blue-700 border-0 capitalize">
                    {me.role}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" {...register('name')} placeholder="Nama admin" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="inline-flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-green-600" /> Nomor WhatsApp
              </Label>
              <Input
                id="whatsapp"
                inputMode="tel"
                {...register('whatsapp')}
                placeholder="081234567890"
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
              )}
              <p className="text-xs text-slate-400">
                Dipakai sebagai nomor tujuan otomatis saat mengirim export jadwal via WhatsApp
                di menu Jadwal. Boleh ditulis 08... atau +62....
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ---------- Informasi kontak publik ---------- */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Informasi Kontak Publik</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">
            Tampil di halaman Kontak dan Footer situs. Kosongkan untuk memakai nilai default.
          </p>

          <form onSubmit={handleContactSubmit(onSubmitContact)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="appName">Nama Aplikasi</Label>
              <Input
                id="appName"
                {...registerContact('appName')}
                placeholder="SafaTrans"
              />
              {contactErrors.appName && (
                <p className="text-xs text-red-500">{contactErrors.appName.message}</p>
              )}
              <p className="text-xs text-slate-400">
                Tampil di navbar, footer, halaman login/daftar, dashboard, dan PDF jadwal.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phonePrimary" className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Telepon Utama
                </Label>
                <Input
                  id="phonePrimary"
                  {...registerContact('phonePrimary')}
                  placeholder="+62 21-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneSecondary">Telepon Kedua</Label>
                <Input
                  id="phoneSecondary"
                  {...registerContact('phoneSecondary')}
                  placeholder="+62 21-8765-4321"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="emailPrimary" className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Utama
                </Label>
                <Input
                  id="emailPrimary"
                  type="email"
                  {...registerContact('emailPrimary')}
                  placeholder="info@safatrans.co.id"
                />
                {contactErrors.emailPrimary && (
                  <p className="text-xs text-red-500">{contactErrors.emailPrimary.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailSecondary">Email Kedua</Label>
                <Input
                  id="emailSecondary"
                  type="email"
                  {...registerContact('emailSecondary')}
                  placeholder="booking@safatrans.co.id"
                />
                {contactErrors.emailSecondary && (
                  <p className="text-xs text-red-500">{contactErrors.emailSecondary.message}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Alamat
                </Label>
                <Input
                  id="address"
                  {...registerContact('address')}
                  placeholder="Jl. Raya Jakarta No. 123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressDetail">Detail Alamat</Label>
                <Input
                  id="addressDetail"
                  {...registerContact('addressDetail')}
                  placeholder="Jakarta Timur, 13910"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="operationalHours" className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Jam Operasional
                </Label>
                <Input
                  id="operationalHours"
                  {...registerContact('operationalHours')}
                  placeholder="Senin - Minggu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operationalDetail">Detail Jam</Label>
                <Input
                  id="operationalDetail"
                  {...registerContact('operationalDetail')}
                  placeholder="24 Jam (Call Center)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactWhatsapp" className="inline-flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-green-600" /> WhatsApp Publik
              </Label>
              <Input
                id="contactWhatsapp"
                inputMode="tel"
                {...registerContact('contactWhatsapp')}
                placeholder="081234567890"
              />
              <p className="text-xs text-slate-400">
                Nomor WhatsApp yang ditampilkan ke pengunjung (berbeda dari nomor pribadi admin di atas).
              </p>
            </div>

            {/* Terminal keberangkatan */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="inline-flex items-center gap-1.5 pt-3">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Terminal Keberangkatan
              </Label>
              {terminals.map((terminal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={terminal.name}
                    onChange={(e) => {
                      const next = [...terminals];
                      next[index] = { ...next[index], name: e.target.value };
                      setTerminals(next);
                    }}
                    placeholder="Nama terminal"
                  />
                  <Input
                    value={terminal.city}
                    onChange={(e) => {
                      const next = [...terminals];
                      next[index] = { ...next[index], city: e.target.value };
                      setTerminals(next);
                    }}
                    placeholder="Kota"
                    className="max-w-[180px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-600"
                    onClick={() => setTerminals(terminals.filter((_, i) => i !== index))}
                    aria-label="Hapus terminal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setTerminals([...terminals, { name: '', city: '' }])}
                disabled={terminals.length >= 10}
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Terminal
              </Button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={settingsMutation.isPending}
              >
                {settingsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Kontak
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
