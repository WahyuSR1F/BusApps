import { useParams, useNavigate, Link } from 'react-router';
import { useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const routeSchema = z.object({
  namaTujuan: z.string().min(1, 'Nama tujuan wajib diisi'),
  kodeRute: z.string().min(1, 'Kode rute wajib diisi'),
  hargaTiket: z.string().min(1, 'Harga wajib diisi'),
  estimasiJam: z.coerce.number().min(0),
  estimasiMenit: z.coerce.number().min(0).max(59),
  jarakKm: z.coerce.number().optional(),
  terminalAsal: z.string().min(1, 'Terminal asal wajib diisi'),
  terminalTujuan: z.string().min(1, 'Terminal tujuan wajib diisi'),
  keterangan: z.string().optional().or(z.literal('')),
  status: z.enum(['aktif', 'nonaktif']),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function RuteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const utils = trpc.useUtils();

  const { data: routeData } = trpc.route.getById.useQuery(
    { id: Number(id) },
    { enabled: isEdit }
  );

  const createMutation = trpc.route.create.useMutation({
    onSuccess: () => { utils.route.list.invalidate(); navigate('/dashboard/rute'); },
  });
  const updateMutation = trpc.route.update.useMutation({
    onSuccess: () => { utils.route.list.invalidate(); navigate('/dashboard/rute'); },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema) as never,
    defaultValues: { status: 'aktif', estimasiJam: 0, estimasiMenit: 0 },
  });

  useEffect(() => {
    if (routeData) {
      setValue('namaTujuan', routeData.namaTujuan);
      setValue('kodeRute', routeData.kodeRute);
      setValue('hargaTiket', String(routeData.hargaTiket));
      setValue('estimasiJam', routeData.estimasiJam);
      setValue('estimasiMenit', routeData.estimasiMenit);
      setValue('jarakKm', routeData.jarakKm || undefined);
      setValue('terminalAsal', routeData.terminalAsal);
      setValue('terminalTujuan', routeData.terminalTujuan);
      setValue('keterangan', routeData.keterangan || '');
      setValue('status', routeData.status as 'aktif' | 'nonaktif');
    }
  }, [routeData, setValue]);

  const onSubmit = (data: RouteFormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: Number(id), ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/rute"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Rute' : 'Tambah Rute'}</h2>
          <p className="text-sm text-slate-500">{isEdit ? 'Perbarui data rute' : 'Tambah rute perjalanan baru'}</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="kodeRute">Kode Rute *</Label>
                <Input id="kodeRute" {...register('kodeRute')} placeholder="JKT-SBY" />
                {errors.kodeRute && <p className="text-xs text-red-500">{errors.kodeRute.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="namaTujuan">Nama Tujuan *</Label>
                <Input id="namaTujuan" {...register('namaTujuan')} placeholder="Surabaya" />
                {errors.namaTujuan && <p className="text-xs text-red-500">{errors.namaTujuan.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="hargaTiket">Harga Tiket (Rp) *</Label>
                <Input id="hargaTiket" {...register('hargaTiket')} placeholder="350000" />
                {errors.hargaTiket && <p className="text-xs text-red-500">{errors.hargaTiket.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jarakKm">Jarak (km)</Label>
                <Input id="jarakKm" type="number" {...register('jarakKm')} placeholder="780" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="estimasiJam">Estimasi Jam</Label>
                <Input id="estimasiJam" type="number" {...register('estimasiJam')} placeholder="12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimasiMenit">Estimasi Menit</Label>
                <Input id="estimasiMenit" type="number" {...register('estimasiMenit')} placeholder="0" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="terminalAsal">Terminal Asal *</Label>
                <Input id="terminalAsal" {...register('terminalAsal')} placeholder="Terminal Pulo Gebang" />
                {errors.terminalAsal && <p className="text-xs text-red-500">{errors.terminalAsal.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminalTujuan">Terminal Tujuan *</Label>
                <Input id="terminalTujuan" {...register('terminalTujuan')} placeholder="Terminal Bungurasih" />
                {errors.terminalTujuan && <p className="text-xs text-red-500">{errors.terminalTujuan.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(v) => setValue('status', v as 'aktif' | 'nonaktif')} value={watch('status') || 'aktif'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea id="keterangan" {...register('keterangan')} placeholder="Informasi tambahan rute..." />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Link to="/dashboard/rute"><Button variant="outline" type="button">Batal</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
