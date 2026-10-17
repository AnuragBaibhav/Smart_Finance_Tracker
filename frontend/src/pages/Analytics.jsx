import { useState, useEffect, useMemo } from 'react';
import { getTransactions, getTransactionsByCategory, getTransactionSummary, getAccounts, getCategories } from '../api/endpoints';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fc, symbol, convert } = useCurrency();
  const [filters, setFilters] = useState({
    account: 'all',
    period: '30',
    type: '',
    category: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    search: ''
  });

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { loadTransactions(); }, [filters]);

  const loadMeta = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        getAccounts().catch(() => ({ data: [] })),
        getCategories().catch(() => ({ data: [] })),
      ]);
      setAccounts(accRes.data?.results || accRes.data || []);
      setCategories(catRes.data?.results || catRes.data || []);
    } catch (err) { console.error(err); }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = { page_size: 1000 };
      if (filters.account && filters.account !== 'all') params.account = filters.account;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.min_amount) params.min_amount = filters.min_amount;
      if (filters.max_amount) params.max_amount = filters.max_amount;
      if (filters.search) params.search = filters.search;
      
      // Date logic
      if (filters.start_date) {
        params.start_date = filters.start_date;
      } else if (filters.period && filters.period !== 'all') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - parseInt(filters.period));
        params.start_date = cutoff.toISOString().split('T')[0];
      }
      if (filters.end_date) params.end_date = filters.end_date;

      const txRes = await getTransactions(params);
      setTransactions(txRes.data?.results || txRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // The transactions are already filtered by the backend
  const filtered = transactions;

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    filtered.filter(t => t.transaction_type === 'expense').forEach((tx) => {
      const cat = tx.category_name || 'Uncategorized';
      map[cat] = (map[cat] || 0) + parseFloat(tx.amount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Monthly trend (income vs expense by month)
  const monthlyTrend = useMemo(() => {
    const map = {};
    filtered.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
      if (tx.transaction_type === 'income') map[key].income += parseFloat(tx.amount);
      else map[key].expense += parseFloat(tx.amount);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  // Daily spending (last N days)
  const dailySpending = useMemo(() => {
    const map = {};
    filtered.filter(t => t.transaction_type === 'expense').forEach((tx) => {
      const key = tx.date;
      map[key] = (map[key] || 0) + parseFloat(tx.amount);
    });
    return Object.entries(map)
      .map(([date, amount]) => ({ date, amount: Math.round(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [filtered]);

  // Summary stats
  const stats = useMemo(() => {
    const inc = filtered.filter(t => t.transaction_type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    const exp = filtered.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    let days = 30;
    if (filters.start_date && filters.end_date) {
        const diffTime = Math.abs(new Date(filters.end_date) - new Date(filters.start_date));
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    } else if (filters.period && filters.period !== 'all') {
        days = parseInt(filters.period);
    }
    const avgDaily = days > 0 ? exp / days : 0;
    return { income: inc, expense: exp, savings: inc - exp, avgDaily };
  }, [filtered, filters.period, filters.start_date, filters.end_date]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
            <label>Account</label>
            <select value={filters.account} onChange={(e) => setFilters({ ...filters, account: e.target.value })}>
              <option value="all">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
            <label>Period</label>
            <select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value, start_date: '', end_date: '' })}>
              <option value="all">Custom Dates</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
            <label>Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
            <label>Category</label>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 150px' }}>
            <label>Company / Search</label>
            <input type="text" placeholder="Search payee..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 130px' }}>
            <label>Start Date</label>
            <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value, period: 'all' })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 130px' }}>
            <label>End Date</label>
            <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value, period: 'all' })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 80px' }}>
            <label>Min Amt</label>
            <input type="number" placeholder="Min" value={filters.min_amount} onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 80px' }}>
            <label>Max Amt</label>
            <input type="number" placeholder="Max" value={filters.max_amount} onChange={(e) => setFilters({ ...filters, max_amount: e.target.value })} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ account: 'all', period: '30', type: '', category: '', start_date: '', end_date: '', min_amount: '', max_amount: '', search: '' })}>Clear</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card"><div className="card-body" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Total Income</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{fc(stats.income)}</div>
        </div></div>
        <div className="card"><div className="card-body" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Total Expenses</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{fc(stats.expense)}</div>
        </div></div>
        <div className="card"><div className="card-body" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Net Savings</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: stats.savings >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fc(stats.savings)}</div>
        </div></div>
        <div className="card"><div className="card-body" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Avg Daily Spend</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{fc(stats.avgDaily)}</div>
        </div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Income vs Expense Bar Chart */}
        <div className="card">
          <div className="card-header"><h3>Income vs Expenses</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${symbol}${(convert(v)/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fc(v)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><p>No data for this period</p></div>}
          </div>
        </div>

        {/* Spending by Category Pie */}
        <div className="card">
          <div className="card-header"><h3>Spending by Category</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fc(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><p>No expense data</p></div>}
          </div>
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>Daily Spending Trend</h3></div>
        <div className="card-body" style={{ height: 300 }}>
          {dailySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySpending}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${symbol}${(convert(v) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fc(v)} labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} />
                <Area type="monotone" dataKey="amount" stroke="#f43f5e" fill="url(#spendGrad)" strokeWidth={2} name="Spending" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No spending data</p></div>}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card">
        <div className="card-header"><h3>Category Breakdown</h3></div>
        <div className="card-body">
          {categoryData.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Category</th><th>Amount</th><th>% of Total</th><th>Visual</th></tr></thead>
                <tbody>
                  {categoryData.map((c, i) => {
                    const total = categoryData.reduce((s, x) => s + x.value, 0);
                    const pct = total > 0 ? (c.value / total) * 100 : 0;
                    return (
                      <tr key={c.name}>
                        <td style={{ fontWeight: 500 }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                          {c.name}
                        </td>
                        <td style={{ fontWeight: 600 }}>{fc(c.value)}</td>
                        <td>{pct.toFixed(1)}%</td>
                        <td>
                          <div style={{ background: 'var(--gray-100)', borderRadius: 4, height: 8, width: 120, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], height: '100%', borderRadius: 4 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <div className="empty-state"><p>No data to display</p></div>}
        </div>
      </div>
    </div>
  );
}
