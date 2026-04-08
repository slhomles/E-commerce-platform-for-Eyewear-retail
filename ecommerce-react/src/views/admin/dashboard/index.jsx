import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import api from '@/services/api';

// ─── Mock Data (remove when backend is ready) ─────────────────────────────────
const MOCK_STATS = {
  totalRevenue:               2_847_500_000,
  revenueThisMonth:             312_750_000,
  revenueLastMonth:             274_200_000,
  revenueToday:                  18_450_000,
  monthOverMonthGrowthPercent:         14.1,
  averageOrderValue:              1_423_750,
  totalOrders:                        1_998,
  ordersThisMonth:                      219,
  ordersToday:                           13,
  paidOrders:                         1_742,
  pendingOrders:                         87,
  cancelledOrders:                      169,
  orderConversionRate:                 87.2,
  monthlyTrend: [
    { year: 2024, month:  5, monthLabel: 'May 2024', revenue:  88_400_000, orderCount:  62 },
    { year: 2024, month:  6, monthLabel: 'Jun 2024', revenue: 102_700_000, orderCount:  72 },
    { year: 2024, month:  7, monthLabel: 'Jul 2024', revenue: 134_200_000, orderCount:  94 },
    { year: 2024, month:  8, monthLabel: 'Aug 2024', revenue: 158_900_000, orderCount: 112 },
    { year: 2024, month:  9, monthLabel: 'Sep 2024', revenue: 145_300_000, orderCount: 102 },
    { year: 2024, month: 10, monthLabel: 'Oct 2024', revenue: 201_500_000, orderCount: 141 },
    { year: 2024, month: 11, monthLabel: 'Nov 2024', revenue: 289_600_000, orderCount: 203 },
    { year: 2024, month: 12, monthLabel: 'Dec 2024', revenue: 374_100_000, orderCount: 262 },
    { year: 2025, month:  1, monthLabel: 'Jan 2025', revenue: 198_200_000, orderCount: 139 },
    { year: 2025, month:  2, monthLabel: 'Feb 2025', revenue: 221_400_000, orderCount: 155 },
    { year: 2025, month:  3, monthLabel: 'Mar 2025', revenue: 274_200_000, orderCount: 192 },
    { year: 2025, month:  4, monthLabel: 'Apr 2025', revenue: 312_750_000, orderCount: 219 },
  ],
  byPaymentMethod: [
    { method: 'VNPAY',         methodLabel: 'VNPay',              revenue: 1_563_750_000, orderCount:  957, percentage: 54.9 },
    { method: 'COD',           methodLabel: 'Cash on Delivery',   revenue:   853_500_000, orderCount:  524, percentage: 30.0 },
    { method: 'BANK_TRANSFER', methodLabel: 'Bank Transfer',      revenue:   430_250_000, orderCount:  261, percentage: 15.1 },
  ],
  byOrderStatus: [
    { status: 'DELIVERED',  statusLabel: 'Delivered',  count: 1_573, percentage: 78.7 },
    { status: 'SHIPPING',   statusLabel: 'Shipping',   count:   169, percentage:  8.5 },
    { status: 'PACKING',    statusLabel: 'Packing',    count:    87, percentage:  4.4 },
    { status: 'PENDING',    statusLabel: 'Pending',    count:    87, percentage:  4.4 },
    { status: 'CANCELLED',  statusLabel: 'Cancelled',  count:   169, percentage:  8.5 },
    { status: 'PAID',       statusLabel: 'Paid',       count:    82, percentage:  4.1 },
  ],
  topProducts: [
    { productId: '1', productName: 'Gong Kinh Rimless Premium LSA-123',    totalRevenue: 387_600_000, totalQuantity: 324, revenueShare: 13.6 },
    { productId: '2', productName: 'Kinh Mat Phi Cong OR1060X',            totalRevenue: 312_450_000, totalQuantity: 278, revenueShare: 11.0 },
    { productId: '3', productName: 'Gong Kinh Vuong Premium SR1010X',      totalRevenue: 258_300_000, totalQuantity: 243, revenueShare:  9.1 },
    { productId: '4', productName: 'Kinh Mat Clubmaster OB1015G',          totalRevenue: 194_750_000, totalQuantity: 187, revenueShare:  6.8 },
    { productId: '5', productName: 'Kinh Mat Sport MV2001N',               totalRevenue: 142_100_000, totalQuantity: 156, revenueShare:  5.0 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
    .format(Number(n) || 0);

const fmtShort = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K';
  return v.toLocaleString();
};

const growthColor = (v) => (v >= 0 ? '#00b341' : '#e53935');
const growthIcon = (v) => (v >= 0 ? '▲' : '▼');

const STATUS_COLORS = {
  PENDING: '#ff9800',
  PAID: '#2196f3',
  PACKING: '#9c27b0',
  SHIPPING: '#00bcd4',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336',
};

const PAYMENT_COLORS = {
  COD: '#ff9800',
  BANK_TRANSFER: '#2196f3',
  VNPAY: '#e91e63',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, growth, icon }) => (
  <div style={{
    background: '#fff', borderRadius: '12px', padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,.07)', flex: '1 1 200px', minWidth: '180px',
  }}>
    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
    <div style={{ fontSize: '12px', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em' }}>
      {label}
    </div>
    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '4px 0' }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '12px', color: '#aaa' }}>{sub}</div>}
    {growth !== undefined && (
      <div style={{ fontSize: '12px', color: growthColor(growth), marginTop: '4px', fontWeight: '600' }}>
        {growthIcon(growth)} {Math.abs(growth)}% vs last month
      </div>
    )}
  </div>
);

const SectionTitle = ({ children }) => (
  <h5 style={{ margin: '0 0 14px', fontSize: '15px', color: '#333', fontWeight: '700', borderLeft: '3px solid #333', paddingLeft: '10px' }}>
    {children}
  </h5>
);

const Card = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: '12px', padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,.07)', ...style,
  }}>
    {children}
  </div>
);

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{ color: '#ccc', textAlign: 'center', padding: '30px' }}>No data</div>;
  const max = Math.max(...data.map(d => Number(d.revenue) || 0), 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', minWidth: `${data.length * 56}px`, height: '160px', paddingBottom: '24px', position: 'relative' }}>
        {data.map((d, i) => {
          const h = Math.max((Number(d.revenue) / max) * 130, 2);
          const isCurrentMonth = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} title={`${d.monthLabel}: ${fmt(d.revenue)}`}>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>
                {fmtShort(d.revenue)}
              </div>
              <div style={{
                width: '100%', height: `${h}px`, borderRadius: '4px 4px 0 0',
                background: isCurrentMonth ? '#1a1a1a' : '#e0e0e0',
                transition: 'height .3s ease',
                cursor: 'default',
              }} />
              <div style={{ fontSize: '9px', color: isCurrentMonth ? '#1a1a1a' : '#bbb', fontWeight: isCurrentMonth ? '700' : '400', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {d.monthLabel.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProgressRow = ({ label, value, total, color, subLabel }) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: '#444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
          {label}
        </span>
        <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>{subLabel}</span>
      </div>
      <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width .5s ease' }} />
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard = () => {
  useDocumentTitle('Analytics | Admin Dashboard');
  useScrollTop();

  const [stats, setStats] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getRevenueStats()
      .then(setStats)
      .catch(() => setStats(MOCK_STATS))   // fallback to mock when API unavailable
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="loader" style={{ minHeight: '80vh' }}>
        <h6>Loading Analytics...</h6>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="loader" style={{ minHeight: '80vh' }}>
        <h6 style={{ color: '#e53935' }}>{error || 'No data available'}</h6>
      </div>
    );
  }

  const totalOrdersForStatus = stats.byOrderStatus.reduce((s, r) => s + r.count, 0) || 1;
  const totalRevenueNum = Number(stats.totalRevenue) || 1;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1a1a1a' }}>Revenue Analytics</h3>
        <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
          Real-time overview of your store performance
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KpiCard
          icon="💰"
          label="Total Revenue"
          value={`₫${fmtShort(stats.totalRevenue)}`}
          sub={fmt(stats.totalRevenue)}
        />
        <KpiCard
          icon="📅"
          label="This Month"
          value={`₫${fmtShort(stats.revenueThisMonth)}`}
          sub={`Last month: ₫${fmtShort(stats.revenueLastMonth)}`}
          growth={stats.monthOverMonthGrowthPercent}
        />
        <KpiCard
          icon="🛒"
          label="Avg. Order Value"
          value={`₫${fmtShort(stats.averageOrderValue)}`}
          sub="Per paid order"
        />
        <KpiCard
          icon="📦"
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`This month: ${stats.ordersThisMonth} · Today: ${stats.ordersToday}`}
        />
        <KpiCard
          icon="✅"
          label="Conversion Rate"
          value={`${stats.orderConversionRate}%`}
          sub={`${stats.paidOrders} paid / ${stats.totalOrders} total`}
        />
        <KpiCard
          icon="☀️"
          label="Today's Revenue"
          value={`₫${fmtShort(stats.revenueToday)}`}
          sub={`${stats.ordersToday} orders today`}
        />
      </div>

      {/* ── Row 2: Revenue Trend + Order Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>

        <Card>
          <SectionTitle>Monthly Revenue Trend (Last 12 Months)</SectionTitle>
          <BarChart data={stats.monthlyTrend} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1a1a1a', display: 'inline-block' }} />
              Current month
            </span>
            <span style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#e0e0e0', display: 'inline-block' }} />
              Previous months
            </span>
          </div>
        </Card>

        <Card>
          <SectionTitle>Order Status</SectionTitle>
          {stats.byOrderStatus.length === 0
            ? <div style={{ color: '#ccc', textAlign: 'center', padding: '20px' }}>No orders yet</div>
            : stats.byOrderStatus.map((s) => (
              <ProgressRow
                key={s.status}
                label={s.statusLabel}
                value={s.count}
                total={totalOrdersForStatus}
                color={STATUS_COLORS[s.status] || '#999'}
                subLabel={`${s.count} (${s.percentage}%)`}
              />
            ))
          }
        </Card>
      </div>

      {/* ── Row 3: Payment Methods + Top Products ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>

        <Card>
          <SectionTitle>Revenue by Payment Method</SectionTitle>
          {stats.byPaymentMethod.length === 0
            ? <div style={{ color: '#ccc', textAlign: 'center', padding: '20px' }}>No paid orders yet</div>
            : stats.byPaymentMethod.map((p) => (
              <ProgressRow
                key={p.method}
                label={p.methodLabel}
                value={Number(p.revenue)}
                total={totalRevenueNum}
                color={PAYMENT_COLORS[p.method] || '#999'}
                subLabel={`₫${fmtShort(p.revenue)} (${p.percentage}%)`}
              />
            ))
          }
          <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '12px', paddingTop: '10px' }}>
            {stats.byPaymentMethod.map((p) => (
              <div key={p.method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                <span>{p.methodLabel}</span>
                <span>{p.orderCount} orders</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Top 5 Products by Revenue</SectionTitle>
          {stats.topProducts.length === 0
            ? <div style={{ color: '#ccc', textAlign: 'center', padding: '20px' }}>No sales data yet</div>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#999', fontWeight: '600' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#999', fontWeight: '600' }}>Product</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#999', fontWeight: '600' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#999', fontWeight: '600' }}>Units</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#999', fontWeight: '600' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p, i) => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #fafafa' }}>
                      <td style={{ padding: '10px 8px', color: '#ccc', fontWeight: '700' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#333', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.productName}
                        </div>
                        <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px', marginTop: '4px' }}>
                          <div style={{ height: '100%', width: `${p.revenueShare}%`, background: '#1a1a1a', borderRadius: '2px' }} />
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a' }}>
                        ₫{fmtShort(p.totalRevenue)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#666' }}>
                        {p.totalQuantity}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#999' }}>
                        {p.revenueShare}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </Card>

      </div>

      {/* ── Footer note ── */}
      <p style={{ marginTop: '24px', color: '#ccc', fontSize: '11px', textAlign: 'right' }}>
        Revenue calculated from paid orders only · Cancelled orders excluded
      </p>

    </div>
  );
};

export default Dashboard;
