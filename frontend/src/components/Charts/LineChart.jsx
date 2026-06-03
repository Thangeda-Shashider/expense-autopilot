import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: '10px',
        padding: '10px 14px', fontSize: '13px',
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#f1f5f9', fontWeight: 700 }}>₹{parseFloat(payload[0].value).toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

export default function SpendingLineChart({ data = [], loading }) {
  if (loading) {
    return <div className="skeleton" style={{ height: '220px', borderRadius: '12px' }} />;
  }

  if (!data.length) {
    return (
      <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: '40px' }}>📈</div>
        <div style={{ color: '#64748b', fontSize: '14px' }}>No trend data for last 30 days</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₹${v}`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#colorSpend)"
          dot={false}
          activeDot={{ r: 5, fill: '#6366f1', stroke: '#0f172a', strokeWidth: 2 }}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
