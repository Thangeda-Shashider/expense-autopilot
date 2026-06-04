import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Hash, RefreshCw } from 'lucide-react';
import { format, subDays, startOfMonth, isWithinInterval, startOfWeek } from 'date-fns';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import ExpenseTable from '../components/ExpenseTable';
import SpendingPieChart from '../components/Charts/PieChart';
import DailyBarChart from '../components/Charts/BarChart';
import SpendingLineChart from '../components/Charts/LineChart';

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/expenses/summary'),
      ]);
      setExpenses(expRes.data?.data || expRes.data || []);
      setSummary(sumRes.data?.categories || sumRes.data?.data || sumRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived stats
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const allExpenses = Array.isArray(expenses) ? expenses : [];

  const thisMonthTotal = allExpenses
    .filter(e => e.expense_date && new Date(e.expense_date) >= monthStart)
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  const thisWeekTotal = allExpenses
    .filter(e => e.expense_date && new Date(e.expense_date) >= weekStart)
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  // Build last-7-days bar chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(now, 6 - i);
    const dayStr = format(d, 'EEE');
    const amount = allExpenses
      .filter(e => e.expense_date && format(new Date(e.expense_date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    return { day: dayStr, amount: parseFloat(amount.toFixed(2)) };
  });

  // Build last-30-days line chart data
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(now, 29 - i);
    const dateKey = format(d, 'MMM d');
    const amount = allExpenses
      .filter(e => e.expense_date && format(new Date(e.expense_date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    return { date: dateKey, amount: parseFloat(amount.toFixed(2)) };
  });

  const recentExpenses = [...allExpenses]
    .sort((a, b) => new Date(b.expense_date || b.created_at) - new Date(a.expense_date || a.created_at))
    .slice(0, 5);

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: '1400px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
            Good {getGreeting()}, {user.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {format(now, "EEEE, MMMM d, yyyy")} — Here's your financial overview.
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          className="btn-ghost"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard
          title="This Month"
          value={`₹${thisMonthTotal.toFixed(2)}`}
          icon={DollarSign}
          color="#6366f1"
          subtitle="Total spending"
          loading={loading}
        />
        <StatCard
          title="This Week"
          value={`₹${thisWeekTotal.toFixed(2)}`}
          icon={TrendingUp}
          color="#22c55e"
          subtitle="Weekly total"
          loading={loading}
        />
        <StatCard
          title="Transactions"
          value={allExpenses.length}
          icon={Hash}
          color="#f59e0b"
          subtitle="All time"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Pie chart */}
        <div className="card fade-in">
          <SectionHeader title="Spending by Category" subtitle="Where your money goes" />
          <SpendingPieChart data={Array.isArray(summary) ? summary : []} loading={loading} />
        </div>
        {/* Bar chart */}
        <div className="card fade-in">
          <SectionHeader title="Daily Spending" subtitle="Last 7 days" />
          <DailyBarChart data={last7} loading={loading} />
        </div>
      </div>

      {/* Line chart */}
      <div className="card fade-in" style={{ marginBottom: '24px' }}>
        <SectionHeader title="Spending Trend" subtitle="Last 30 days" />
        <SpendingLineChart data={last30} loading={loading} />
      </div>

      {/* Recent expenses */}
      <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <SectionHeader title="Recent Transactions" subtitle="Your last 5 expenses" />
          <a href="/expenses" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            View all →
          </a>
        </div>
        <ExpenseTable expenses={recentExpenses} loading={loading} compact />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
