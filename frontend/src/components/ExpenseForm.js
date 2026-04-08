import { useState } from "react";
import { feedAPI } from "../api/client";

export default function ExpenseForm({ categories, expense, onDone, onClose }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    title:        expense?.title        || "",
    amount:       expense?.amount       || "",
    category_id:  expense?.category_id  || (categories[0]?.id || ""),
    expense_date: expense?.expense_date || new Date().toISOString().split("T")[0],
    note:         expense?.note         || "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount:      parseFloat(form.amount),
        category_id: parseInt(form.category_id),
      };
      if (isEdit) await feedAPI.update(expense.id, payload);
      else        await feedAPI.create(payload);
      onDone();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h3 style={s.title}>{isEdit ? "Edit Expense" : "Add Expense"}</h3>
          <button style={s.close} onClick={onClose}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Title</label>
          <input style={s.input} required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Lunch at office" />

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Amount (₹)</label>
              <input style={s.input} type="number" step="0.01" min="0" required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Date</label>
              <input style={s.input} type="date" required
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
          </div>

          <label style={s.label}>Category</label>
          <select style={s.input} value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label style={s.label}>Note (optional)</label>
          <textarea style={{ ...s.input, height: 72, resize: "vertical" }}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Any details…" />

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit"  style={s.submitBtn} disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Update" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay:   { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:     { background: "#fff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title:     { fontSize: 17, fontWeight: 600 },
  close:     { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#94a3b8" },
  label:     { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#374151" },
  input:     { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, marginBottom: 14, outline: "none" },
  row:       { display: "flex", gap: 12 },
  actions:   { display: "flex", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 10, background: "#f1f5f9", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" },
  submitBtn: { flex: 2, padding: 10, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
  error:     { background: "#fef2f2", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 },
};
