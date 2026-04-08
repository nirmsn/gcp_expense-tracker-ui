import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../api/AuthContext";
import { fetchAPI, feedAPI, categoryAPI } from "../api/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ExpenseForm from "../components/ExpenseForm";

export default function Dashboard() {
  const { user, logout }  = useAuth();
  const [expenses,   setExpenses]   = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [loading,    setLoading]    = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, sumRes, catRes] = await Promise.all([
        fetchAPI.list({ limit: 50 }),
        fetchAPI.summary(),
        categoryAPI.list(),
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await feedAPI.delete(id);
    fetchData();
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const pieData = summary?.by_category?.map((c) => ({
    name: c.name, value: c.total, color: c.color,
  })) || [];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.logo}>💸 Expense Tracker</span>
        <div style={s.headerRight}>
          <span style={s.greeting}>Hi, {user?.name}</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.body}>
        {loading ? (
          <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 60 }}>Loading…</p>
        ) : (
          <>
            <div style={s.statRow}>
              <StatCard label="Total Spent"   value={`₹${summary?.total?.toFixed(2) || "0.00"}`} color="#6366f1" />
              <StatCard label="Transactions"  value={summary?.count || 0}                          color="#10b981" />
              <StatCard label="Categories"    value={summary?.by_category?.length || 0}            color="#f59e0b" />
            </div>

            <div style={s.grid}>
              {pieData.length > 0 && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>By Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={s.legend}>
                    {pieData.map((d, i) => (
                      <div key={i} style={s.legendItem}>
                        <span style={{ ...s.dot, background: d.color }} />
                        <span style={s.legendText}>{d.name}</span>
                        <span style={s.legendVal}>₹{d.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={s.card}>
                <div style={s.listHeader}>
                  <h3 style={s.cardTitle}>Recent Expenses</h3>
                  <button style={s.addBtn} onClick={() => setShowForm(true)}>+ Add</button>
                </div>
                {expenses.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 20 }}>No expenses yet. Add one!</p>
                ) : (
                  <div style={s.list}>
                    {expenses.map((e) => (
                      <div key={e.id} style={s.listItem}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                          <span style={{ ...s.catDot, background: e.category?.color || "#6366f1" }} />
                          <div>
                            <div style={s.expTitle}>{e.title}</div>
                            <div style={s.expMeta}>{e.category?.name} · {e.expense_date}</div>
                          </div>
                        </div>
                        <div style={s.expRight}>
                          <span style={s.amount}>₹{parseFloat(e.amount).toFixed(2)}</span>
                          <button style={s.editBtn} onClick={() => { setEditing(e); setShowForm(true); }}>Edit</button>
                          <button style={s.delBtn}  onClick={() => handleDelete(e.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          categories={categories}
          expense={editing}
          onDone={handleFormDone}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const s = {
  page:       { minHeight: "100vh", background: "#f1f5f9" },
  header:     { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo:       { fontWeight: 600, fontSize: 18 },
  headerRight:{ display: "flex", alignItems: "center", gap: 16 },
  greeting:   { fontSize: 14, color: "#64748b" },
  logoutBtn:  { fontSize: 13, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500 },
  body:       { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  statRow:    { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 },
  grid:       { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 },
  card:       { background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  cardTitle:  { fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1e293b" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  addBtn:     { background: "#6366f1", color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  list:       { display: "flex", flexDirection: "column", gap: 8 },
  listItem:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "#f8fafc", gap: 8 },
  catDot:     { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  expTitle:   { fontSize: 14, fontWeight: 500, color: "#1e293b" },
  expMeta:    { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  expRight:   { display: "flex", alignItems: "center", gap: 8 },
  amount:     { fontSize: 14, fontWeight: 600, color: "#1e293b", minWidth: 80, textAlign: "right" },
  editBtn:    { fontSize: 11, color: "#6366f1", background: "none", border: "none", cursor: "pointer" },
  delBtn:     { fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" },
  legend:     { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 },
  legendItem: { display: "flex", alignItems: "center", gap: 8 },
  dot:        { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  legendText: { fontSize: 13, flex: 1, color: "#374151" },
  legendVal:  { fontSize: 13, fontWeight: 500, color: "#1e293b" },
};
