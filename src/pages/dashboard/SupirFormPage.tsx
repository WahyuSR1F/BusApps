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

const supirSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  noTelp: z.string().optional().or(z.literal('')),
  email: z.string().optional().or(z.literal('')),
  alamat: z.string().optional().or(z.literal('')),
  noSim: z.string().optional().or(z.literal('')),
  jenisSim: z.string().optional().or(z.literal('')),
  status: z.enum(['aktif', 'cuti', 'nonaktif']),
});

type SupirFormData = z.infer<typeof supirSchema>;

export default function SupirFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const utils = trpc.useUtils();

  const { data: supirData } = trpc.employee.getById.useQuery(
    { id: Number(id) },
    { enabled: isEdit }
  );

  const createMutation = trpc.employee.create.useMutation({
    onSuccess: () => { utils.employee.list.invalidate(); navigate('/dashboard/supir'); },
  });
  const updateMutation = trpc.employee.update.useMutation({
    onSuccess: () => { utils.employee.list.invalidate(); navigate('/dashboard/supir'); },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SupirFormData>({
    resolver: zodResolver(supirSchema) as never,
    defaultValues: { status: 'aktif' },
  });

  useEffect(() => {
    if (supirData) {
      setValue('nama', supirData.nama);
      setValue('noTelp', supirData.noTelp || '');
      setValue('email', supirData.email || '');
      setValue('alamat', supirData.alamat || '');
      setValue('noSim', supirData.noSim || '');
      setValue('jenisSim', supirData.jenisSim || '');
      setValue('status', supirData.status as 'aktif' | 'cuti' | 'nonaktif');
    }
  }, [supirData, setValue]);

  const onSubmit = (data: SupirFormData) => {
    const payload = { ...data, role: 'supir' as const };
    if (isEdit) {
      updateMutation.mutate({ id: Number(id), ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/supir"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Supir' : 'Tambah Supir'}</h2>
          <p className="text-sm text-slate-500">{isEdit ? 'Perbarui data supir' : 'Tambah supir baru'}</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input id="nama" {...register('nama')} placeholder="Budi Santoso" />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="noTelp">No. Telepon</Label>
                <Input id="noTelp" {...register('noTelp')} placeholder="081234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} placeholder="email@contoh.com" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="noSim">No. SIM</Label>
                <Input id="noSim" {...register('noSim')} placeholder="SIM123456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenisSim">Jenis SIM</Label>
                <Input id="jenisSim" {...register('jenisSim')} placeholder="B2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea id="alamat" {...register('alamat')} placeholder="Jl. Mawar No. 1, Jakarta" />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(v) => setValue('status', v as 'aktif' | 'cuti' | 'nonaktif')} value={watch('status') || 'aktif'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Link to="/dashboard/supir"><Button variant="outline" type="button">Batal</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
