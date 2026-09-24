import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import {
  FileDown,
  Loader2,
  MessageCircle,
  UserRound,
} from 'lucide-react';
import {
  buildJadwalPdf,
  buildWaLink,
  downloadPdfBlob,
  setAppNameForPdf,
  type ExportJadwalRow,
} from '@/lib/export-jadwal-pdf';
import { useAppName } from '@/hooks/useContactSettings';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const today = () => format(new Date(), 'yyyy-MM-dd');
const firstOfMonth = () => format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

// Konversi nomor WA ke format internasional tanpa "+", sama seperti server.
const normalizeWa = (raw: string) => {
  let digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return digits;
};

export default function ExportJadwalDialog({ open, onOpenChange }: Props) {
  const appName = useAppName();
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [wa, setWa] = useState('');
  const [building, setBuilding] = useState(false);

  // Reset rentang ke bulan berjalan setiap dialog dibuka.
  useEffect(() => {
    if (open) {
      setDari(firstOfMonth());
      setSampai(today());
    }
  }, [open]);

  // Pastikan PDF memakai nama aplikasi terkini dari settings.
  useEffect(() => {
    setAppNameForPdf(appName);
  }, [appName]);

  // Prefill nomor WA dari profil admin yang sedang login.
  const { data: me } = trpc.auth.me.useQuery(undefined, { enabled: open });
  useEffect(() => {
    if (me?.whatsapp) setWa(me.whatsapp);
  }, [me]);

  const params = useMemo(
    () => ({ dari: dari || undefined, sampai: sampai || undefined }),
    [dari, sampai],
  );

  // Data lengkap sesuai rentang (enabled hanya saat dialog terbuka).
  const { data, isFetching } = trpc.schedule.exportData.useQuery(params, {
    enabled: open,
    placeholderData: (prev) => prev,
  });

  const rows = (data?.items as ExportJadwalRow[] | undefined) ?? [];
  const waDigits = wa ? normalizeWa(wa) : '';

  const generate = async (mode: 'download' | 'wa') => {
    if (rows.length === 0) {
      toast.error('Tidak ada jadwal pada rentang tanggal ini.');
      return;
    }
    if (mode === 'wa' && !waDigits) {
      toast.error('Isi nomor WhatsApp tujuan terlebih dahulu.');
      return;
    }
    setBuilding(true);
    try {
      const { blob, filename, waMessage } = await buildJadwalPdf({
        rows,
        dari: params.dari,
        sampai: params.sampai,
      });
      if (mode === 'download') {
        downloadPdfBlob(blob, filename);
        toast.success(`PDF berhasil dibuat (${rows.length} jadwal).`);
      } else {
        // PDF diunduh untuk dilampirkan manual; WA terbuka dengan pesan terisi.
        downloadPdfBlob(blob, filename);
        window.open(buildWaLink(waDigits, waMessage), '_blank', 'noopener');
        toast.success('PDF diunduh. Lampirkan file di WhatsApp yang terbuka.');
      }
    } catch {
      toast.error('Gagal membuat PDF. Coba lagi.');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Jadwal ke PDF</DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal, lalu unduh PDF atau kirim ringkasan via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="export-dari">Dari</Label>
              <Input
                id="export-dari"
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="export-sampai">Sampai</Label>
              <Input
                id="export-sampai"
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
              />
            </div>
          </div>

          <div className="text-sm text-slate-500">
            {isFetching || building ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memuat data jadwal...
              </span>
            ) : (
              <span>
                <strong className="text-slate-700">{rows.length}</strong> jadwal akan diekspor
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="export-wa" className="inline-flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-green-600" /> Nomor WhatsApp tujuan
            </Label>
            <div className="flex gap-2">
              <Input
                id="export-wa"
                inputMode="tel"
                placeholder="081234567890 / +62 812-3456-7890"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
              />
              {me?.whatsapp ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => setWa(me.whatsapp as string)}
                  title="Pakai nomor WA dari profil admin"
                >
                  <UserRound className="w-3.5 h-3.5" /> Profil
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-slate-400">
              Nomor bisa disimpan di menu Profil agar terisi otomatis.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => generate('download')}
            disabled={building || isFetching}
            className="gap-2"
          >
            {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Download PDF
          </Button>
          <Button
            type="button"
            onClick={() => generate('wa')}
            disabled={building || isFetching}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            Kirim via WA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
