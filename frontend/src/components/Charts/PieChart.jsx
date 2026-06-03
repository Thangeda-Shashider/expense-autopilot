import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: '10px',
        padding: '10px 14px', fontSize: '13px',
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>{payload[0].name}</div>
        <div style={{ color: '#f1f5f9', fontWeight: 700 }}>₹{parseFloat(payload[0].value).toFixed(2)}</div>
        <div style={{ color: '#64748b', fontSize: '11px' }}>{payload[0].payload.percent}% of total</div>
      </div>
    );
  }
  return null;
};

export default function SpendingPieChart({ data = [], loading }) {
  if (loading) {
    return <div className="skeleton" style={{ height: '280px', borderRadius: '12px' }} />;
  }

  if (!data.length) {
    return (
      <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: '40px' }}>🍩</div>
        <div style={{ color: '#64748b', fontSize: '14px' }}>No category data yet</div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + parseFloat(d.total || d.value || 0), 0);
  const formatted = data.map((d, i) => ({
    name: d.category_name || d.name || `Category ${i + 1}`,
    value: parseFloat(d.total || d.value || 0),
    percent: total > 0 ? ((parseFloat(d.total || d.value || 0) / total) * 100).toFixed(1) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsPie>
        <Pie
          data={formatted}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
