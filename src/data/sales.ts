import type { Sale } from '../types/erp';

export const recentSales: Sale[] = [
{ id: 's241', invoice: 'INV-000241', date: '01 Oct', time: '11:42 AM', party: 'Rahman Hardware', items: 2, total: 25550, paid: 0, method: 'Cash' },
{ id: 's240', invoice: 'INV-000240', date: '01 Oct', time: '11:05 AM', party: 'Walk-in customer', items: 3, total: 1840, paid: 1840, method: 'Cash' },
{ id: 's239', invoice: 'INV-000239', date: '01 Oct', time: '10:31 AM', party: 'Nur Enterprise', items: 5, total: 9620, paid: 6000, method: 'bKash' },
{ id: 's238', invoice: 'INV-000238', date: '01 Oct', time: '09:15 AM', party: 'Hossain Electric', items: 1, total: 3450, paid: 0, method: 'Cash' },
{ id: 's237', invoice: 'INV-000237', date: '30 Sep', time: '06:48 PM', party: 'Walk-in customer', items: 2, total: 685, paid: 685, method: 'Cash' },
{ id: 's236', invoice: 'INV-000236', date: '30 Sep', time: '05:20 PM', party: 'Mim Construction', items: 4, total: 18200, paid: 18200, method: 'Bank' }];


export type SalesDraft = {
  id: string;
  label: string;
  customer?: string;
  items: number;
  total: number;
  savedAt: string;
};

export const salesDrafts: SalesDraft[] = [
{ id: 'd1', label: 'Draft #14', customer: 'Mim Construction', items: 6, total: 38450, savedAt: '10:12 AM' },
{ id: 'd2', label: 'Draft #15', items: 2, total: 1240, savedAt: '11:20 AM' }];