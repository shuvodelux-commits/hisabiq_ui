export type SampleLine = { name: string; nameBn: string; sku: string; qty: number; unit: string; unitBn: string; rate: number; serial?: string; warranty?: string; warrantyBn?: string };

export type InvoiceData = {
  number: string;
  date: string;
  customer: { name: string; nameBn: string; phone: string; address: string; addressBn: string };
  business: { name: string; nameBn: string; phone: string; address: string; addressBn: string };
  servedBy: string;
  servedByBn: string;
  payment: string;
  discount: number;
  paid: number;
  lines: SampleLine[];
};

export const sampleInvoice: InvoiceData = {
  number: 'INV-000241',
  date: '2026-11-03T15:30:00+06:00',
  customer: { name: 'Md. Jahangir Alam', nameBn: 'মোঃ জাহাঙ্গীর আলম', phone: '01712345678', address: 'House 12, Road 4, Mirpur 10, Dhaka', addressBn: 'বাড়ি ১২, রোড ৪, মিরপুর ১০, ঢাকা' },
  business: { name: 'Nawabpur Hardware House', nameBn: 'নবাবপুর হার্ডওয়্যার হাউস', phone: '01700000000', address: '128 Nawabpur Road, Dhaka 1100', addressBn: '১২৮ নবাবপুর রোড, ঢাকা ১১০০' },
  servedBy: 'Sabbir',
  servedByBn: 'সাব্বির',
  payment: 'bKash',
  discount: 150,
  paid: 5000,
  lines: [
    { name: 'BRB Cable 1.5 rm (Coil)', nameBn: 'বিআরবি ক্যাবল ১.৫ আরএম (কয়েল)', sku: 'BRB-15', qty: 2, unit: 'Coil', unitBn: 'কয়েল', rate: 1850 },
    { name: 'Walton LED Bulb 12W', nameBn: 'ওয়ালটন এলইডি বাল্ব ১২ ওয়াট', sku: 'WLT-12', qty: 6, unit: 'Pcs', unitBn: 'পিস', rate: 165, warranty: '1 year', warrantyBn: '১ বছর' },
    { name: 'Super Star Switch Board 4 gang', nameBn: 'সুপার স্টার সুইচ বোর্ড ৪ গ্যাং', sku: 'SS-4G', qty: 3, unit: 'Pcs', unitBn: 'পিস', rate: 240 },
    { name: 'Miyako Ceiling Fan 56"', nameBn: 'মিয়াকো সিলিং ফ্যান ৫৬"', sku: 'MYK-56', qty: 1, unit: 'Pcs', unitBn: 'পিস', rate: 3250, serial: 'MYK56-88241', warranty: '2 years', warrantyBn: '২ বছর' },
  ] as SampleLine[],
};
