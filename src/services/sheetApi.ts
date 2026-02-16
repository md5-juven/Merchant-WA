/**
 * Google Sheet integration via Apps Script Web App.
 * VITE_GOOGLE_SHEET_WEB_APP_URL = Web app URL (POST for form, GET for dashboard).
 *
 * In dev: dashboard GET uses Vite proxy (/api/sheet → sheet URL), so no CORS or external proxy needed.
 * In production: set VITE_GOOGLE_SHEET_READ_URL to a CORS proxy URL if your host can't proxy to the sheet.
 */

export interface SheetRow {
  'Merchant Store Name': string;
  'Merchant Name': string;
  'Phone Number': string;
  Address: string;
  Pincode: string;
  Location: string;
  'Merchant Response': string;
  'Potenial Problems': string;
}

/** Row as returned by doGet (includes Submitted At when present) */
export interface SheetDataRow extends SheetRow {
  'Submitted At'?: string;
}

export interface SheetDataResponse {
  headers?: string[];
  rows: SheetDataRow[];
  error?: string;
}

export function buildSheetRow(form: {
  storeName: string;
  merchantName: string;
  phoneNumber: string;
  address: string;
  pinCode: string;
  location: string;
  interest: string;
  potentialProblems: string;
}): SheetRow {
  const merchantResponse =
    form.interest === 'interested'
      ? 'Interested'
      : form.interest === 'not-interested'
        ? 'Not interested'
        : '';
  return {
    'Merchant Store Name': form.storeName.trim(),
    'Merchant Name': form.merchantName.trim(),
    'Phone Number': form.phoneNumber.replace(/\D/g, ''),
    Address: form.address.trim(),
    Pincode: form.pinCode.trim(),
    Location: form.location,
    'Merchant Response': merchantResponse,
    'Potenial Problems': (form.potentialProblems || '').trim(),
  };
}

const WEB_APP_URL = import.meta.env.VITE_GOOGLE_SHEET_WEB_APP_URL as string | undefined;
// In dev we use Vite proxy (/api/sheet). In prod use READ_URL or fallback to WEB_APP_URL (may CORS).
const READ_URL = import.meta.env.DEV
  ? '/api/sheet'
  : ((import.meta.env.VITE_GOOGLE_SHEET_READ_URL as string | undefined) || WEB_APP_URL);

export async function submitToSheet(row: SheetRow): Promise<{ ok: boolean; error?: string }> {
  if (!WEB_APP_URL || !WEB_APP_URL.startsWith('http')) {
    return { ok: false, error: 'Google Sheet URL is not configured. Add VITE_GOOGLE_SHEET_WEB_APP_URL to .env' };
  }

  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script doesn't send CORS headers; no-cors lets the request go through
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: message };
  }
}

/** Fetch sheet data for dashboard (doGet). In dev uses /api/sheet proxy; in prod uses READ_URL or WEB_APP_URL. */
export async function getSheetData(): Promise<{ ok: boolean; data?: SheetDataResponse; error?: string }> {
  const url = READ_URL;
  const isProxy = url.startsWith('/');
  if (!url || (!isProxy && !url.startsWith('http'))) {
    return { ok: false, error: 'Sheet URL not configured. Set VITE_GOOGLE_SHEET_WEB_APP_URL in .env' };
  }
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Sheet returned ${res.status}` };
    const data = JSON.parse(text) as SheetDataResponse;
    if (data.error) return { ok: false, error: data.error };
    return { ok: true, data: data };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load sheet data';
    return { ok: false, error: message };
  }
}
