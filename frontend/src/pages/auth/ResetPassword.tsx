import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      alert("Password reset successful! Please sign in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.error}>Invalid or missing reset token.</p>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.heading}>Reset Password</h2>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>New Password <span style={{ fontWeight: 400, color: "#718096" }}>(min 8 characters)</span></label>
          <input style={s.input} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={8} />

          <label style={s.label}>Confirm Password</label>
          <input style={s.input} type="password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} required />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
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
};
