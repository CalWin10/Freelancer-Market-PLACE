import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/projects/my");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.heading}>Sign In</h2>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} required />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)} required />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p style={s.footer}><Link to="/forgot-password">Forgot password?</Link></p>
        <p style={s.footer}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:    { minHeight: "100vh", background: "#f5f7fa", display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem" },
  card:    { background: "#fff", borderRadius: 12, padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" },
  heading: { marginBottom: "1.5rem", fontSize: "1.5rem", color: "#1a1a2e" },
  error:   { color: "#e53e3e", marginBottom: "1rem", fontSize: "0.875rem" },
  form:    { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label:   { fontWeight: 600, fontSize: "0.875rem", color: "#4a5568", marginTop: "0.5rem" },
  input:   { padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.95rem", width: "100%", boxSizing: "border-box" },
  btn:     { marginTop: "1.25rem", padding: "0.75rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "1rem" },
  footer:  { marginTop: "0.75rem", fontSize: "0.875rem", textAlign: "center" },
};
