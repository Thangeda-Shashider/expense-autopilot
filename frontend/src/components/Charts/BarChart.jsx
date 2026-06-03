import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

export default function DailyBarChart({ data = [], loading }) {
  if (loading) {
    return <div className="skeleton" style={{ height: '220px', borderRadius: '12px' }} />;
  }

  if (!data.length) {
    return (
      <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: '40px' }}>📊</div>
        <div style={{ color: '#64748b', fontSize: '14px' }}>No spending data for last 7 days</div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => parseFloat(d.amount || d.value || 0)));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsBar data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₹${v}`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={800}>
          {data.map((entry, i) => {
            const val = parseFloat(entry.amount || entry.value || 0);
            const isHighest = val === maxVal && maxVal > 0;
            return (
              <Cell
                key={i}
                fill={isHighest ? '#6366f1' : 'rgba(99,102,241,0.4)'}
              />
            );
          })}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  );
}
