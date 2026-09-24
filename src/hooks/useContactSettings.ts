import { trpc } from '@/providers/trpc';

/**
 * Sumber tunggal konstanta kontak & helper terkait, dipakai halaman publik
 * (KontakPage, Footer). Nilai dari settings admin menimpa default di bawah.
 */
export const DEFAULT_CONTACT = {
  /** Nama aplikasi default; dapat diganti admin via Profil. */
  appName: 'SafaTrans',
  phonePrimary: '+62 21-1234-5678',
  phoneSecondary: '+62 21-8765-4321',
  emailPrimary: 'info@safatrans.co.id',
  emailSecondary: 'booking@safatrans.co.id',
  address: 'Jl. Raya Jakarta No. 123',
  addressDetail: 'Jakarta Timur, 13910',
  operationalHours: 'Senin - Minggu',
  operationalDetail: '24 Jam (Call Center)',
  whatsapp: '',
  terminals: [
    { name: 'Terminal Pulo Gebang', city: 'Jakarta Timur' },
    { name: 'Terminal Lebak Bulus', city: 'Jakarta Selatan' },
    { name: 'Terminal Kampung Rambutan', city: 'Jakarta Timur' },
  ],
};

export type ContactInfo = typeof DEFAULT_CONTACT;

/** Gabungkan settings admin (partial) dengan default. */
export function resolveContact(
  settings?: Partial<ContactInfo> | null,
): ContactInfo {
  return {
    ...DEFAULT_CONTACT,
    ...(settings ?? {}),
    terminals:
      settings?.terminals && settings.terminals.length > 0
        ? settings.terminals
        : DEFAULT_CONTACT.terminals,
  };
}

/** Ambil settings kontak dari server, siap dipakai halaman publik. */
export function useContactSettings(): ContactInfo {
  const { data } = trpc.settings.get.useQuery();
  return resolveContact(data as Partial<ContactInfo> | null | undefined);
}

/** Nama aplikasi dinamis dengan fallback 'SafaTrans'. Ringan, aman dipakai di mana saja. */
export function useAppName(): string {
  const { data } = trpc.settings.get.useQuery();
  const raw = (data as { appName?: string | null } | undefined)?.appName;
  const name = raw?.trim();
  return name ? name : DEFAULT_CONTACT.appName;
}
