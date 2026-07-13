import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "FREELANCER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      navigate("/projects/my");
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) setError(Object.values(errors).join("\n"));
      else setError(err.response?.data?.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.heading}>Create Account</h2>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} value={form.fullName} onChange={set("fullName")} required />

          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={form.email} onChange={set("email")} required />

          <label style={s.label}>Password <span style={{ fontWeight: 400, color: "#718096" }}>(min 8 characters)</span></label>
          <input style={s.input} type="password" value={form.password} onChange={set("password")} required minLength={8} />

          <label style={s.label}>I am a</label>
          <select style={s.input} value={form.role} onChange={set("role")}>
            <option value="FREELANCER">Freelancer</option>
            <option value="CLIENT">Client</option>
          </select>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <p style={s.footer}>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:    { minHeight: "100vh", background: "#f5f7fa", display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem" },
  card:    { background: "#fff", borderRadius: 12, padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" },
  heading: { marginBottom: "1.5rem", fontSize: "1.5rem", color: "#1a1a2e" },
  error:   { color: "#e53e3e", marginBottom: "1rem", fontSize: "0.875rem", whiteSpace: "pre-line" },
  form:    { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label:   { fontWeight: 600, fontSize: "0.875rem", color: "#4a5568", marginTop: "0.5rem" },
  input:   { padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.95rem", width: "100%", boxSizing: "border-box" },
  btn:     { marginTop: "1.25rem", padding: "0.75rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "1rem" },
  footer:  { marginTop: "0.75rem", fontSize: "0.875rem", textAlign: "center" },
};
