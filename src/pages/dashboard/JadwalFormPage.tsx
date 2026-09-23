import { useParams, useNavigate, Link } from 'react-router';
import { useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours, addMinutes } from 'date-fns';

const scheduleSchema = z.object({
  busId: z.coerce.number().min(1, 'Pilih bus'),
  ruteId: z.coerce.number().min(1, 'Pilih rute'),
  supirId: z.coerce.number().min(1, 'Pilih supir'),
  kernetId: z.coerce.number().optional(),
  tanggal: z.string().min(1, 'Pilih tanggal'),
  waktuBerangkat: z.string().min(1, 'Pilih waktu berangkat'),
  waktuSampai: z.string().min(1, 'Pilih waktu sampai'),
  hargaTiket: z.string().min(1, 'Harga wajib diisi'),
  keterangan: z.string().optional().or(z.literal('')),
  status: z.enum(['tersedia', 'berangkat', 'sampai', 'batal', 'penuh']),
  jumlahPenumpang: z.coerce.number().default(0),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export default function JadwalFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const utils = trpc.useUtils();

  const { data: scheduleData } = trpc.schedule.getById.useQuery(
    { id: Number(id) },
    { enabled: isEdit }
  );
  const { data: busesData } = trpc.bus.list.useQuery({ limit: 100 });
  const { data: routesData } = trpc.route.list.useQuery({ limit: 100 });
  const { data: supirData } = trpc.employee.list.useQuery({ role: 'supir', status: 'aktif', limit: 100 });
  const { data: kernetData } = trpc.employee.list.useQuery({ role: 'kernet', status: 'aktif', limit: 100 });

  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => { utils.schedule.list.invalidate(); navigate('/dashboard/jadwal'); },
  });
  const updateMutation = trpc.schedule.update.useMutation({
    onSuccess: () => { utils.schedule.list.invalidate(); navigate('/dashboard/jadwal'); },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema) as never,
    defaultValues: { status: 'tersedia', jumlahPenumpang: 0 },
  });

  const selectedRuteId = watch('ruteId');
  const selectedTanggal = watch('tanggal');
  const selectedWaktuBerangkat = watch('waktuBerangkat');

  useEffect(() => {
    if (selectedRuteId && routesData?.items) {
      const route = (routesData.items as Record<string, unknown>[]).find((r) => r.id === Number(selectedRuteId));
      if (route) {
        setValue('hargaTiket', String(route.hargaTiket));
        if (selectedTanggal && selectedWaktuBerangkat) {
          const berangkat = new Date(`${selectedTanggal}T${selectedWaktuBerangkat}`);
          const jam = Number(route.estimasiJam) || 0;
          const menit = Number(route.estimasiMenit) || 0;
          const sampai = addMinutes(addHours(berangkat, jam), menit);
          setValue('waktuSampai', format(sampai, "yyyy-MM-dd'T'HH:mm"));
        }
      }
    }
  }, [selectedRuteId, selectedTanggal, selectedWaktuBerangkat, routesData, setValue]);

  useEffect(() => {
    if (scheduleData) {
      setValue('busId', scheduleData.busId);
      setValue('ruteId', scheduleData.ruteId);
      setValue('supirId', scheduleData.supirId);
      setValue('kernetId', scheduleData.kernetId || undefined);
      setValue('tanggal', format(new Date(scheduleData.tanggal), 'yyyy-MM-dd'));
      setValue('waktuBerangkat', format(new Date(scheduleData.waktuBerangkat), "yyyy-MM-dd'T'HH:mm"));
      setValue('waktuSampai', format(new Date(scheduleData.waktuSampai), "yyyy-MM-dd'T'HH:mm"));
      setValue('hargaTiket', String(scheduleData.hargaTiket));
      setValue('keterangan', scheduleData.keterangan || '');
      setValue('status', scheduleData.status as 'tersedia' | 'berangkat' | 'sampai' | 'batal' | 'penuh');
      setValue('jumlahPenumpang', scheduleData.jumlahPenumpang);
    }
  }, [scheduleData, setValue]);

  const onSubmit = (data: ScheduleFormData) => {
    const tanggal = new Date(data.tanggal);
    const waktuBerangkat = new Date(data.waktuBerangkat);
    const waktuSampai = new Date(data.waktuSampai);

    const payload = {
      ...data,
      tanggal: tanggal.toISOString(),
      waktuBerangkat: waktuBerangkat.toISOString(),
      waktuSampai: waktuSampai.toISOString(),
    };

    if (isEdit) {
      updateMutation.mutate({ id: Number(id), ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleRecalculate = () => {
    if (selectedRuteId && routesData?.items && selectedTanggal && selectedWaktuBerangkat) {
      const route = (routesData.items as Record<string, unknown>[]).find((r) => r.id === Number(selectedRuteId));
      if (route) {
        const berangkat = new Date(`${selectedTanggal}T${selectedWaktuBerangkat}`);
        const jam = Number(route.estimasiJam) || 0;
        const menit = Number(route.estimasiMenit) || 0;
        const sampai = addMinutes(addHours(berangkat, jam), menit);
        setValue('waktuSampai', format(sampai, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/jadwal"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
          <p className="text-sm text-slate-500">{isEdit ? 'Perbarui jadwal perjalanan' : 'Tambah jadwal perjalanan baru'}</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Pilih Bus *</Label>
                <Select onValueChange={(v) => setValue('busId', Number(v))} value={watch('busId')?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Pilih bus" /></SelectTrigger>
                  <SelectContent>
                    {(busesData?.items as Record<string, unknown>[] || []).filter((b) => b.status === 'aktif').map((bus) => (
                      <SelectItem key={bus.id as number} value={String(bus.id)}>
                        [{bus.platNomor as string}] - {bus.merek as string} ({bus.kapasitas as number} kursi)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.busId && <p className="text-xs text-red-500">{errors.busId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Pilih Rute *</Label>
                <Select onValueChange={(v) => setValue('ruteId', Number(v))} value={watch('ruteId')?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Pilih rute" /></SelectTrigger>
                  <SelectContent>
                    {(routesData?.items as Record<string, unknown>[] || []).filter((r) => r.status === 'aktif').map((route) => (
                      <SelectItem key={route.id as number} value={String(route.id)}>
                        {route.kodeRute as string} - {route.namaTujuan as string} (Rp {Number(route.hargaTiket).toLocaleString('id-ID')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ruteId && <p className="text-xs text-red-500">{errors.ruteId.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Pilih Supir *</Label>
                <Select onValueChange={(v) => setValue('supirId', Number(v))} value={watch('supirId')?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Pilih supir" /></SelectTrigger>
                  <SelectContent>
                    {(supirData?.items as Record<string, unknown>[] || []).map((supir) => (
                      <SelectItem key={supir.id as number} value={String(supir.id)}>
                        {supir.nama as string} {supir.jenisSim ? `- SIM ${supir.jenisSim as string}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supirId && <p className="text-xs text-red-500">{errors.supirId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Pilih Kernet (Opsional)</Label>
                {/* Radix UI melarang value="" pada SelectItem (crash render), jadi
                    "Tanpa Kernet" pakai sentinel value "none" lalu dikonversi ke
                    undefined agar tetap terkirim sebagai kosong. */}
                <Select
                  onValueChange={(v) => setValue('kernetId', v === 'none' ? undefined : Number(v))}
                  value={watch('kernetId') ? String(watch('kernetId')) : 'none'}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih kernet (opsional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kernet</SelectItem>
                    {(kernetData?.items as Record<string, unknown>[] || []).map((kernet) => (
                      <SelectItem key={kernet.id as number} value={String(kernet.id)}>
                        {kernet.nama as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal *</Label>
                <Input id="tanggal" type="date" {...register('tanggal')} />
                {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktuBerangkat">Waktu Berangkat *</Label>
                <Input id="waktuBerangkat" type="datetime-local" {...register('waktuBerangkat')} />
                {errors.waktuBerangkat && <p className="text-xs text-red-500">{errors.waktuBerangkat.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="waktuSampai">Waktu Sampai *</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleRecalculate} className="h-5 text-xs text-blue-600 px-1">
                    <Calculator className="w-3 h-3 mr-1" /> Hitung
                  </Button>
                </div>
                <Input id="waktuSampai" type="datetime-local" {...register('waktuSampai')} />
                {errors.waktuSampai && <p className="text-xs text-red-500">{errors.waktuSampai.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="hargaTiket">Harga Tiket (Rp) *</Label>
                <Input id="hargaTiket" {...register('hargaTiket')} placeholder="350000" />
                {errors.hargaTiket && <p className="text-xs text-red-500">{errors.hargaTiket.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select onValueChange={(v) => setValue('status', v as 'tersedia' | 'berangkat' | 'sampai' | 'batal' | 'penuh')} value={watch('status') || 'tersedia'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="berangkat">Berangkat</SelectItem>
                    <SelectItem value="sampai">Sampai</SelectItem>
                    <SelectItem value="batal">Batal</SelectItem>
                    <SelectItem value="penuh">Penuh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea id="keterangan" {...register('keterangan')} placeholder="Keterangan tambahan..." />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Link to="/dashboard/jadwal"><Button variant="outline" type="button">Batal</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
