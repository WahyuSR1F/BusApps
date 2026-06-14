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

const busSchema = z.object({
  platNomor: z.string().min(1, 'Plat nomor wajib diisi'),
  merek: z.string().min(1, 'Merek wajib diisi'),
  model: z.string().optional().or(z.literal('')),
  kapasitas: z.coerce.number().min(1, 'Kapasitas minimal 1'),
  fasilitas: z.string().optional().or(z.literal('')),
  status: z.enum(['aktif', 'perbaikan', 'nonaktif']),
  tahun: z.coerce.number().optional(),
});

type BusFormData = z.infer<typeof busSchema>;

export default function BusFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const utils = trpc.useUtils();

  const { data: busData } = trpc.bus.getById.useQuery(
    { id: Number(id) },
    { enabled: isEdit }
  );

  const createMutation = trpc.bus.create.useMutation({
    onSuccess: () => { utils.bus.list.invalidate(); navigate('/dashboard/bus'); },
  });
  const updateMutation = trpc.bus.update.useMutation({
    onSuccess: () => { utils.bus.list.invalidate(); navigate('/dashboard/bus'); },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BusFormData>({
    resolver: zodResolver(busSchema) as never,
    defaultValues: { status: 'aktif', kapasitas: 0 },
  });

  useEffect(() => {
    if (busData) {
      setValue('platNomor', busData.platNomor);
      setValue('merek', busData.merek);
      setValue('model', busData.model || '');
      setValue('kapasitas', busData.kapasitas);
      setValue('fasilitas', busData.fasilitas || '');
      setValue('status', busData.status as 'aktif' | 'perbaikan' | 'nonaktif');
      setValue('tahun', busData.tahun || undefined);
    }
  }, [busData, setValue]);

  const onSubmit = (data: BusFormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: Number(id), ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/bus">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Bus' : 'Tambah Bus'}</h2>
          <p className="text-sm text-slate-500">{isEdit ? 'Perbarui data bus' : 'Tambah armada bus baru'}</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="platNomor">Plat Nomor *</Label>
                <Input id="platNomor" {...register('platNomor')} placeholder="B 1234 ABC" />
                {errors.platNomor && <p className="text-xs text-red-500">{errors.platNomor.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="merek">Merek *</Label>
                <Input id="merek" {...register('merek')} placeholder="Mercedes-Benz" />
                {errors.merek && <p className="text-xs text-red-500">{errors.merek.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" {...register('model')} placeholder="OH 1626" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun</Label>
                <Input id="tahun" type="number" {...register('tahun')} placeholder="2023" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="kapasitas">Kapasitas Kursi *</Label>
                <Input id="kapasitas" type="number" {...register('kapasitas')} placeholder="45" />
                {errors.kapasitas && <p className="text-xs text-red-500">{errors.kapasitas.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(v) => setValue('status', v as 'aktif' | 'perbaikan' | 'nonaktif')} value={watch('status') || 'aktif'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="perbaikan">Perbaikan</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fasilitas">Fasilitas</Label>
              <Textarea id="fasilitas" {...register('fasilitas')} placeholder="AC, TV, Toilet, WiFi (pisahkan dengan koma)" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Link to="/dashboard/bus">
                <Button variant="outline" type="button">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
