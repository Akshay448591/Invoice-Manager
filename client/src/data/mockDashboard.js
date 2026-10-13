// Fake data for now. Replace with API calls once invoices exist.
export const stats = [
  { label: 'Outstanding', value: '₹1,84,500', note: '7 invoices' },
  { label: 'Paid this month', value: '₹92,000', note: '4 invoices' },
  { label: 'Overdue', value: '₹28,750', note: '2 invoices', tone: 'danger' },
  { label: 'Drafts', value: '3', note: 'not sent yet' },
];

export const monthlyRevenue = [
  { month: 'May', amount: 52000 },
  { month: 'Jun', amount: 71000 },
  { month: 'Jul', amount: 64000 },
  { month: 'Aug', amount: 88000 },
  { month: 'Sep', amount: 79000 },
  { month: 'Oct', amount: 92000 },
];

export const recentInvoices = [
  { id: 'INV-1042', client: 'Northwind Traders', amount: 24000, due: '12 Oct 2026', status: 'Pending' },
  { id: 'INV-1041', client: 'Bluepeak Studio', amount: 18500, due: '08 Oct 2026', status: 'Paid' },
  { id: 'INV-1040', client: 'Kiran Textiles', amount: 15750, due: '28 Sep 2026', status: 'Overdue' },
  { id: 'INV-1039', client: 'Orbit Labs', amount: 41000, due: '25 Sep 2026', status: 'Paid' },
  { id: 'INV-1038', client: 'Northwind Traders', amount: 13000, due: '20 Sep 2026', status: 'Overdue' },
];
