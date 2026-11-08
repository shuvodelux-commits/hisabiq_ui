/** Fixed synthetic Magic Patterns audit records, 3 November 2026.
 * Phase 1 source preview only: NOT any tenant's real audit trail.
 * Never feed these fixtures into live business transactions or RBAC.
 */
import { seedStaff } from './sessionPreview';
export type ActivityArea = 'Sales' | 'Stock' | 'Money' | 'Purchases' | 'Settings' | 'Sign-in' | 'Recycle Bin';
export type ActivityLevel = 'normal' | 'look' | 'alert';

export type ActivityEntry = {
  id: string;
  at: string;
  personId: string;
  area: ActivityArea;
  summary: string;
  level: ActivityLevel;
  before?: string;
  after?: string;
  device: string;
  amount?: number;
  link?: string;
};


export const seedActivity: ActivityEntry[] = [
  { id: 'AC-30', at: '2026-11-03T15:12:00+06:00', personId: 'ST-02', area: 'Sales', summary: 'Sold INV-000241 · Cash', level: 'normal', amount: 8840, device: 'Front counter tablet', link: '/app/sales' },
  { id: 'AC-29', at: '2026-11-03T14:55:00+06:00', personId: 'ST-03', area: 'Sales', summary: 'Gave 15% discount on INV-000240 (limit is 10%)', level: 'alert', before: 'Price ৳ 4,200', after: 'Price ৳ 3,570', device: 'Back office laptop', link: '/app/sales' },
  { id: 'AC-28', at: '2026-11-03T14:20:00+06:00', personId: 'ST-04', area: 'Sales', summary: 'Deleted a sale draft (DR-118)', level: 'look', device: 'Karim’s phone', link: '/app/recycle-bin' },
  { id: 'AC-27', at: '2026-11-03T13:40:00+06:00', personId: 'ST-03', area: 'Stock', summary: 'Changed price of BRB Cable 1.5 rm', level: 'look', before: '৳ 1,950', after: '৳ 1,850', device: 'Back office laptop', link: '/app/products' },
  { id: 'AC-26', at: '2026-11-03T13:05:00+06:00', personId: 'ST-02', area: 'Money', summary: 'Received ৳ 3,000 due from Rahim Traders · bKash', level: 'normal', amount: 3000, device: 'Front counter tablet', link: '/app/parties' },
  { id: 'AC-25', at: '2026-11-03T12:30:00+06:00', personId: 'ST-05', area: 'Stock', summary: 'Adjusted stock: Walton LED Bulb 12W −4 (damaged)', level: 'look', before: '86 pcs', after: '82 pcs', device: 'Godown phone', link: '/app/products' },
  { id: 'AC-24', at: '2026-11-03T11:48:00+06:00', personId: 'ST-04', area: 'Sales', summary: 'Sold INV-000238 · bKash', level: 'normal', amount: 1240, device: 'Karim’s phone', link: '/app/sales' },
  { id: 'AC-23', at: '2026-11-03T11:10:00+06:00', personId: 'ST-03', area: 'Settings', summary: 'Opened Settings › Sales & POS', level: 'look', device: 'Back office laptop' },
  { id: 'AC-22', at: '2026-11-03T10:30:00+06:00', personId: 'ST-02', area: 'Money', summary: 'Closed cash drawer with ৳ 120 short', level: 'alert', before: 'Expected ৳ 18,450', after: 'Counted ৳ 18,330', device: 'Front counter tablet' },
  { id: 'AC-21', at: '2026-11-03T10:05:00+06:00', personId: 'ST-04', area: 'Sign-in', summary: 'Signed in', level: 'normal', device: 'Karim’s phone' },
  { id: 'AC-20', at: '2026-11-03T09:40:00+06:00', personId: 'ST-05', area: 'Purchases', summary: 'Received purchase PB-0091 from Super Star Electric', level: 'normal', amount: 42500, device: 'Godown phone', link: '/app/purchases' },
  { id: 'AC-19', at: '2026-11-03T02:14:00+06:00', personId: 'ST-03', area: 'Sign-in', summary: 'Signed in from a new iPhone in Chattogram at 2:14 AM', level: 'alert', device: 'iPhone 13' },
  { id: 'AC-18', at: '2026-11-03T02:12:00+06:00', personId: 'ST-03', area: 'Sign-in', summary: 'Wrong PIN entered 3 times', level: 'alert', device: 'iPhone 13' },
  { id: 'AC-17', at: '2026-11-02T19:50:00+06:00', personId: 'ST-02', area: 'Sales', summary: 'Refunded INV-000229 · Cash', level: 'look', amount: 650, device: 'Front counter tablet', link: '/app/sales' },
  { id: 'AC-16', at: '2026-11-02T17:20:00+06:00', personId: 'ST-01', area: 'Settings', summary: 'Changed low-stock warning', level: 'normal', before: '3 pcs', after: '5 pcs', device: 'Counter PC' },
  { id: 'AC-15', at: '2026-11-02T15:05:00+06:00', personId: 'ST-04', area: 'Sales', summary: 'Sold INV-000226 on credit (baki) to Hasan Electric', level: 'normal', amount: 5600, device: 'Karim’s phone', link: '/app/sales' },
  { id: 'AC-14', at: '2026-11-02T12:40:00+06:00', personId: 'ST-05', area: 'Stock', summary: 'Added product Miyako Ceiling Fan 56"', level: 'normal', device: 'Godown phone', link: '/app/products' },
  { id: 'AC-13', at: '2026-11-01T21:30:00+06:00', personId: 'ST-02', area: 'Sales', summary: 'Voided INV-000214 after closing time', level: 'alert', amount: 2100, device: 'Old Samsung', link: '/app/sales' },
];
export function lakhGroup(value: number, decimals = 2): string {
  const neg = value < 0;
  const [int, frac] = Math.abs(value).toFixed(decimals).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const grouped = rest ? `${rest},${last3}` : last3;
  return `${neg ? '-' : ''}${grouped}${frac ? `.${frac}` : ''}`;
}

/** Money for printed documents in the chosen document language. */
export function useActivityPreview() {
 const staff = seedStaff;
 const activity = seedActivity;
 const person = (id: string) => staff.find(s => s.id === id);
 return { staff, activity, person };
}
