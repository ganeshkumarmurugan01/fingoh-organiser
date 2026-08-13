import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "/api/v1";
const F = "'Inter', -apple-system, sans-serif";
const C = {
  navy:"#0D1B3E", blue:"#2563EB", white:"#FFFFFF",
  light:"#F8FAFC", muted:"#94A3B8", border:"#E2E8F0",
  red:"#DC2626", green:"#16A34A",
};

export default function App() {
  const [token, setToken]   = useState(localStorage.getItem("org_token") || "");
  const [user, setUser]     = useState(null);
  const [screen, setScreen] = useState("login");

  if (!token || screen === "login") {
    return <LoginScreen onLogin={(t, u) => {
      localStorage.setItem("org_token", t);
      setToken(t);
      setUser(u);
      setScreen("dashboard");
    }}/>;
  }

  return (
    <div style={{ fontFamily: F, minHeight: "100vh", background: C.light }}>
      <div style={{ background: C.navy, padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Fingoh Organiser</span>
        <button onClick={() => { localStorage.removeItem("org_token"); setToken(""); setScreen("login"); }}
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: F }}>
          Sign out
        </button>
      </div>
      <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>Dashboard</h1>
        <p style={{ color: C.muted, marginTop: 4 }}>Organiser portal coming soon.</p>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/organiser/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      onLogin(data.token, data.user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
      <div style={{ background: C.white, borderRadius: 16, padding: 40, width: 380, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>Fingoh</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Organiser Portal</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email"
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F, outline: "none", boxSizing: "border-box" }}/>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: F, outline: "none", boxSizing: "border-box" }}/>
        </div>
        {error && <p style={{ fontSize: 12, color: C.red, marginBottom: 16, textAlign: "center" }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", padding: "11px 0", background: loading ? "#CBD5E1" : C.navy, color: C.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: F }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
