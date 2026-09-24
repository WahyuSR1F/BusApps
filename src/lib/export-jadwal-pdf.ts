import { format } from 'date-fns';

// Nama aplikasi untuk PDF & pesan WA. Di-set via setAppNameForPdf saat halaman
// dimuat (nama tersimpan di site_settings, bisa diganti admin via Profil).
let pdfAppName = 'SafaTrans';

export function setAppNameForPdf(name: string) {
  if (name && name.trim()) pdfAppName = name.trim();
}

export type ExportJadwalRow = {
  id: number;
  tanggal: string;
  waktuBerangkat: string;
  waktuSampai: string;
  hargaTiket: number;
  status: string;
  jumlahPenumpang: number;
  bus: { platNomor: string } | null;
  route: { kodeRute: string; namaTujuan: string } | null;
  supir: { nama: string } | null;
  kernet: { nama: string } | null;
};

const statusLabels: Record<string, string> = {
  tersedia: 'Tersedia',
  berangkat: 'Berangkat',
  sampai: 'Sampai',
  batal: 'Batal',
  penuh: 'Penuh',
};

// Format tanggal/waktu dengan fallback agar nilai invalid tidak melempar RangeError.
const safeFormat = (value: unknown, pattern: string) => {
  if (!value) return '-';
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? '-' : format(date, pattern);
};

const rupiah = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export type JadwalPdfResult = {
  blob: Blob;
  filename: string;
  /** Pesan teks ringkasan untuk dikirim via WhatsApp (link wa.me). */
  waMessage: string;
  total: number;
};

/**
 * Membangun PDF daftar jadwal. jspdf & jspdf-autotable dimuat via dynamic
 * import supaya tidak membebani bundle awal halaman.
 */
export async function buildJadwalPdf(params: {
  rows: ExportJadwalRow[];
  dari?: string; // YYYY-MM-DD
  sampai?: string; // YYYY-MM-DD
}): Promise<JadwalPdfResult> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const { rows, dari, sampai } = params;
  const periode =
    dari && sampai
      ? `${format(new Date(dari), 'dd/MM/yyyy')} - ${format(new Date(sampai), 'dd/MM/yyyy')}`
      : dari
        ? `Mulai ${format(new Date(dari), 'dd/MM/yyyy')}`
        : sampai
          ? `Sampai ${format(new Date(sampai), 'dd/MM/yyyy')}`
          : 'Semua jadwal';

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${pdfAppName} - Daftar Jadwal Perjalanan`, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Periode: ${periode}`, 40, 58);
  doc.text(`Total: ${rows.length} jadwal`, 40, 72);
  doc.text(`Dicetak: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 40, 72, { align: 'right' });

  autoTable(doc, {
    startY: 88,
    head: [['No', 'Tanggal', 'Berangkat', 'Sampai', 'Rute', 'Bus', 'Supir', 'Penumpang', 'Harga', 'Status']],
    body: rows.map((row, index) => [
      String(index + 1),
      safeFormat(row.tanggal, 'dd/MM/yyyy'),
      safeFormat(row.waktuBerangkat, 'HH:mm'),
      safeFormat(row.waktuSampai, 'HH:mm'),
      row.route?.kodeRute || '-',
      row.bus?.platNomor || '-',
      row.supir?.nama || '-',
      String(row.jumlahPenumpang ?? 0),
      rupiah(row.hargaTiket),
      statusLabels[row.status] || row.status || '-',
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 0: { cellWidth: 30, halign: 'center' } },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Halaman ${i} dari ${pageCount} - ${pdfAppName}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 16,
      { align: 'center' },
    );
  }

  const blob = doc.output('blob');
  const rangeTag = dari || sampai ? `-${dari || 'awal'}_${sampai || 'akhir'}` : '';
  const filename = `jadwal-safatrans${rangeTag}-${format(new Date(), 'yyyyMMdd')}.pdf`;

  // Ringkasan teks untuk WhatsApp (file PDF dilampirkan manual setelah diunduh).
  const lines = [
    `*${pdfAppName} - Jadwal Perjalanan*`,
    `Periode: ${periode}`,
    `Total: ${rows.length} jadwal`,
    '',
    ...rows.slice(0, 100).map(
      (row, index) =>
        `${index + 1}. ${safeFormat(row.tanggal, 'dd/MM/yyyy')} ${safeFormat(row.waktuBerangkat, 'HH:mm')} | ${row.route?.kodeRute || '-'} | ${row.bus?.platNomor || '-'} | ${statusLabels[row.status] || '-'}`,
    ),
    ...(rows.length > 100 ? ['', `+${rows.length - 100} jadwal lainnya (lihat PDF)`] : []),
  ];
  const waMessage = lines.join('\n');

  return { blob, filename, waMessage, total: rows.length };
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** URL wa.me dengan pesan prefilled (nomor format internasional tanpa "+"). */
export function buildWaLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
