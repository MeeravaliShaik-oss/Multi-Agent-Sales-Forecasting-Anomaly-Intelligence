import { DatasetPreset, RawSalesRow } from '../types';

/**
 * Generates synthetic yet realistic retail time-series data
 * matching real-world Superstore Sales distribution.
 */
export function generateSuperstoreData(): RawSalesRow[] {
  const rows: RawSalesRow[] = [];
  const startDate = new Date('2023-01-01T00:00:00Z');
  const totalDays = 730; // 2 full years

  // Seeded pseudo-random generator for consistent, realistic data
  let seed = 42;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayOfWeek = currentDate.getUTCDay(); // 0 is Sun, 6 is Sat
    const month = currentDate.getUTCMonth(); // 0 is Jan, 11 is Dec
    const dayOfMonth = currentDate.getUTCDate();

    // 1. Long term linear upward trend (+15% per year)
    const trendFactor = 1200 + (i * 0.45);

    // 2. Weekly seasonality: Saturdays & Fridays have highest sales, Sundays moderate, Mondays lower
    let weeklyMult = 1.0;
    switch (dayOfWeek) {
      case 0: weeklyMult = 0.95; break; // Sun
      case 1: weeklyMult = 0.82; break; // Mon
      case 2: weeklyMult = 0.88; break; // Tue
      case 3: weeklyMult = 0.92; break; // Wed
      case 4: weeklyMult = 1.02; break; // Thu
      case 5: weeklyMult = 1.25; break; // Fri
      case 6: weeklyMult = 1.35; break; // Sat
    }

    // 3. Yearly seasonality:
    // Peak in November (Black Friday), December (Holidays), minor peak in July (Back to School)
    let yearlyMult = 1.0;
    if (month === 10) yearlyMult = 1.35; // Nov
    else if (month === 11) yearlyMult = 1.55; // Dec
    else if (month === 0) yearlyMult = 0.80; // Jan post-holiday slump
    else if (month === 1) yearlyMult = 0.85; // Feb
    else if (month === 6) yearlyMult = 1.15; // Jul

    // 4. Random noise
    const noise = (random() - 0.5) * 260;

    let dailySales = Math.round(trendFactor * weeklyMult * yearlyMult + noise);

    // Intentional realistic retail anomalies (as highlighted in PDF Section 9)
    // Christmas Eve spike
    if (month === 11 && dayOfMonth === 24) {
      dailySales = Math.round(dailySales * 2.2); // Big spike
    }
    // Christmas Day closure / drop
    if (month === 11 && dayOfMonth === 25) {
      dailySales = Math.round(dailySales * 0.12); // Extreme drop
    }
    // New Year's Day drop
    if (month === 0 && dayOfMonth === 1) {
      dailySales = Math.round(dailySales * 0.25); // Drop
    }
    // Black Friday super spike (late Nov)
    if (month === 10 && dayOfMonth >= 24 && dayOfMonth <= 27 && dayOfWeek === 5) {
      dailySales = Math.round(dailySales * 2.5); // Black Friday surge
    }
    // Occasional warehouse inventory audit / stockout drop in mid-May
    if (month === 4 && dayOfMonth === 14) {
      dailySales = Math.round(dailySales * 0.2);
    }
    // Flash summer clearance promo spike in August
    if (month === 7 && dayOfMonth === 18) {
      dailySales = Math.round(dailySales * 2.1);
    }

    dailySales = Math.max(80, dailySales);

    // Simulate multiple order transactions per day for realistic preprocessing aggregation
    // E.g., split day's total into 2-4 transactions
    const splits = Math.floor(random() * 3) + 1;
    let remaining = dailySales;
    for (let s = 0; s < splits; s++) {
      const portion = s === splits - 1 ? remaining : Math.round(remaining * (0.3 + random() * 0.4));
      remaining -= portion;
      rows.push({
        Order_Date: dateStr,
        Sales: Math.max(15, portion),
        Category: ['Technology', 'Office Supplies', 'Furniture'][s % 3],
        Region: ['West', 'East', 'Central', 'South'][Math.floor(random() * 4)],
        date: dateStr,
        sales: Math.max(15, portion)
      });
    }
  }

  return rows;
}

export function generateGroceryData(): RawSalesRow[] {
  const rows: RawSalesRow[] = [];
  const startDate = new Date('2023-03-01T00:00:00Z');
  const totalDays = 600;

  let seed = 101;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayOfWeek = currentDate.getUTCDay();
    const month = currentDate.getUTCMonth();
    const dayOfMonth = currentDate.getUTCDate();

    // Grocery has huge Saturday/Sunday grocery shopping spikes
    const baseline = 2400 + i * 0.3;
    const weekendMult = (dayOfWeek === 6 || dayOfWeek === 0) ? 1.6 : (dayOfWeek === 5 ? 1.25 : 0.85);
    const holidayMult = (month === 10 || month === 11) ? 1.2 : 1.0;
    const noise = (random() - 0.5) * 350;

    let sales = Math.round(baseline * weekendMult * holidayMult + noise);

    // Thanksgiving grocery rush anomaly
    if (month === 10 && dayOfMonth === 22) sales = Math.round(sales * 2.3);
    // Severe snowstorm power outage drop
    if (month === 1 && dayOfMonth === 12) sales = Math.round(sales * 0.18);

    rows.push({
      Order_Date: dateStr,
      Sales: Math.max(120, sales),
      date: dateStr,
      sales: Math.max(120, sales)
    });
  }

  return rows;
}

export function generateTechRetailData(): RawSalesRow[] {
  const rows: RawSalesRow[] = [];
  const startDate = new Date('2023-01-15T00:00:00Z');
  const totalDays = 550;

  let seed = 777;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayOfWeek = currentDate.getUTCDay();
    const month = currentDate.getUTCMonth();
    const dayOfMonth = currentDate.getUTCDate();

    const baseline = 3200 + i * 0.6;
    const dayMult = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.35 : 0.92;
    const q4Mult = (month === 10 || month === 11) ? 1.45 : 1.0;
    const noise = (random() - 0.5) * 450;

    let sales = Math.round(baseline * dayMult * q4Mult + noise);

    // Product launch day spike in September
    if (month === 8 && dayOfMonth === 15) sales = Math.round(sales * 3.1);
    // Supply chain delay drop
    if (month === 3 && dayOfMonth === 20) sales = Math.round(sales * 0.35);

    rows.push({
      Order_Date: dateStr,
      Sales: Math.max(200, sales),
      date: dateStr,
      sales: Math.max(200, sales)
    });
  }

  return rows;
}

export const PRESET_DATASETS: DatasetPreset[] = [
  {
    id: 'superstore',
    name: 'Superstore Sales (Kaggle Standard)',
    description: 'Retail furniture, office supplies, and tech orders with multiple daily transactions, holiday ramps, and seasonal spikes.',
    dateColumn: 'Order_Date',
    salesColumn: 'Sales',
    recordsCount: 730,
    dateRange: '2023-01-01 to 2024-12-31 (2 Years)',
    tags: ['Retail', 'Prophet Benchmark', 'Multi-Transaction', 'High Seasonality']
  },
  {
    id: 'grocery',
    name: 'FreshMart Supermarket Chain',
    description: 'High-frequency consumer grocery sales with weekend shopping cycles and holiday surges.',
    dateColumn: 'Order_Date',
    salesColumn: 'Sales',
    recordsCount: 600,
    dateRange: '2023-03-01 to 2024-10-21',
    tags: ['Consumables', 'Weekend Peaks', 'High Velocity']
  },
  {
    id: 'electronics',
    name: 'NovaTech Consumer Electronics',
    description: 'High-ticket tech hardware with product launch surges and Q4 Black Friday peaks.',
    dateColumn: 'Order_Date',
    salesColumn: 'Sales',
    recordsCount: 550,
    dateRange: '2023-01-15 to 2024-07-18',
    tags: ['Tech Hardware', 'Launch Surges', 'High Variance']
  }
];

export function parseCSVContent(csvText: string): {
  rows: RawSalesRow[];
  detectedDateCol: string;
  detectedSalesCol: string;
  availableColumns: string[];
} {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and data rows.');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  // Detect likely date column
  const dateCandidates = ['order_date', 'date', 'order date', 'ds', 'time', 'day', 'timestamp'];
  let detectedDateCol = headers.find(h => dateCandidates.includes(h.toLowerCase())) || headers[0];

  // Detect likely sales column
  const salesCandidates = ['sales', 'y', 'revenue', 'amount', 'total', 'quantity', 'units', 'value'];
  let detectedSalesCol = headers.find(h => salesCandidates.includes(h.toLowerCase())) ||
    headers.find((h, idx) => idx > 0 && h !== detectedDateCol) || headers[1] || headers[0];

  const rows: RawSalesRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length !== headers.length) continue;

    const rowObj: any = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx];
    });

    // Extract date and sales
    const rawDate = rowObj[detectedDateCol];
    const rawSales = parseFloat(rowObj[detectedSalesCol]);

    if (rawDate && !isNaN(rawSales)) {
      rowObj.date = rawDate;
      rowObj.sales = rawSales;
      rows.push(rowObj);
    }
  }

  return {
    rows,
    detectedDateCol,
    detectedSalesCol,
    availableColumns: headers
  };
}
