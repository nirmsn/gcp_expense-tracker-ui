import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/client";
import { useAuth } from "../api/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>💸 Helm Expense Tracker Test</h1>
        <p style={s.sub}>Sign in to your account</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="demo@example.com" />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••" />
          <button style={s.btn} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={s.footer}>No account? <Link to="/register" style={s.link}>Register</Link></p>
        <p style={s.hint}>Demo: demo@example.com / demo1234</p>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" },
  card:  { background: "#fff", borderRadius: 12, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 4, textAlign: "center" },
  sub:   { color: "#64748b", fontSize: 14, textAlign: "center", marginBottom: 24 },
  label: { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, marginBottom: 16, outline: "none" },
  btn:   { width: "100%", padding: 11, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 },
  error: { background: "#fef2f2", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 },
  footer:{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" },
  hint:  { textAlign: "center", marginTop: 8, fontSize: 12, color: "#94a3b8" },
  link:  { color: "#6366f1", textDecoration: "none", fontWeight: 500 },
};
