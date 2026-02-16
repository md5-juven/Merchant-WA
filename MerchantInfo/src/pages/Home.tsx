import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getSheetData, type SheetDataRow } from '../services/sheetApi';
import './Home.css';

const RESPONSE_INTERESTED = 'Interested';
const RESPONSE_NOT_INTERESTED = 'Not interested';

function parseDate(isoOrEmpty: string | undefined): string | null {
  if (!isoOrEmpty || !isoOrEmpty.trim()) return null;
  try {
    const d = new Date(isoOrEmpty.trim());
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function groupByDate(rows: SheetDataRow[]): { date: string; count: number }[] {
  const byDate: Record<string, number> = {};
  for (const r of rows) {
    const date = parseDate(r['Submitted At']);
    if (date) {
      byDate[date] = (byDate[date] || 0) + 1;
    }
  }
  return Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [rows, setRows] = useState<SheetDataRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSheetData().then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) {
        setRows(result.data.rows || []);
        setStatus('ok');
      } else {
        setError(result.error || 'Failed to load data');
        setStatus('error');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const interested = rows.filter((r) => (r['Merchant Response'] || '').trim() === RESPONSE_INTERESTED).length;
  const notInterested = rows.filter((r) => (r['Merchant Response'] || '').trim() === RESPONSE_NOT_INTERESTED).length;
  const total = rows.length;
  const pieData = [
    { name: RESPONSE_INTERESTED, value: interested, color: 'var(--accent)' },
    { name: RESPONSE_NOT_INTERESTED, value: notInterested, color: 'var(--text-muted)' },
  ].filter((d) => d.value > 0);
  const byDate = groupByDate(rows);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-text">
          <h1 className="dashboard-title">Merchant dashboard</h1>
          <p className="dashboard-subtitle">Insights from your sheet data</p>
        </div>
        <Link to="/form" className="dashboard-cta">
          Add merchant
        </Link>
      </header>

      {status === 'loading' && (
        <div className="dashboard-skeleton" aria-busy="true" aria-label="Loading dashboard">
          <div className="skeleton-cards">
            <div className="skeleton-card skeleton-shimmer" />
            <div className="skeleton-card skeleton-shimmer" />
            <div className="skeleton-card skeleton-shimmer" />
          </div>
          <div className="skeleton-chart-card skeleton-shimmer">
            <div className="skeleton-chart-title" />
            <div className="skeleton-donut" />
          </div>
          <div className="skeleton-chart-card skeleton-shimmer">
            <div className="skeleton-chart-title" />
            <div className="skeleton-bars">
              <span className="skeleton-bar" style={{ height: '40%' }} />
              <span className="skeleton-bar" style={{ height: '65%' }} />
              <span className="skeleton-bar" style={{ height: '30%' }} />
              <span className="skeleton-bar" style={{ height: '80%' }} />
              <span className="skeleton-bar" style={{ height: '55%' }} />
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="dashboard-error">
          <p>{error}</p>
          <p className="dashboard-error-hint">
            Ensure <code>VITE_GOOGLE_SHEET_WEB_APP_URL</code> is set and your Apps Script is deployed with doGet. If you see CORS errors, set <code>VITE_GOOGLE_SHEET_READ_URL</code> to a CORS proxy URL.
          </p>
        </div>
      )}

      {status === 'ok' && (
        <>
          <div className="insight-cards">
            <div className="insight-card">
              <span className="insight-label">Total submissions</span>
              <span className="insight-value">{total}</span>
            </div>
            <div className="insight-card insight-card-accent">
              <span className="insight-label">Interested</span>
              <span className="insight-value">{interested}</span>
            </div>
            <div className="insight-card">
              <span className="insight-label">Not interested</span>
              <span className="insight-value">{notInterested}</span>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-card">
              <h2 className="chart-title">Merchant response</h2>
              <div className="chart-card-inner">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280} minHeight={280}>
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value ?? 0, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="chart-empty">No response data yet. Submit the form to see the pie chart.</p>
              )}
              </div>
            </div>

            <div className="chart-card chart-card-wide">
              <h2 className="chart-title">Submissions over time</h2>
              <div className="chart-card-inner">
              {byDate.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byDate} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                      formatter={(value) => [value ?? 0, 'Submissions']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="count" name="Submissions" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="chart-empty">No dates yet. Add the column header <strong>&quot;Submitted At&quot;</strong> in column I of your sheet and redeploy the Apps Script. New submissions will get the date automatically; existing rows will not have dates.</p>
              )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
