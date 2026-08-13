import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "/api/v1";
const F = "'Inter', -apple-system, sans-serif";
const C = {
  navy:"#0D1B3E", blue:"#2563EB", green:"#16A34A", red:"#DC2626",
  amber:"#D97706", white:"#FFFFFF", light:"#F8FAFC", muted:"#94A3B8",
  dark:"#1E293B", border:"#E2E8F0", ltblue:"#EFF6FF", ltgrn:"#F0FDF4",
  ltred:"#FEF2F2", purple:"#7C3AED",
};
const iS = { width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:F, outline:"none", boxSizing:"border-box" };
const lS = { fontSize:10, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:.08, display:"block", marginBottom:5 };

function apiCall(path, token, options = {}) {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-fingoh-auth": `Bearer ${token}`,
      ...(options.headers || {}),
    },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail || "Request failed");
    return data;
  });
}

// ── Quota Bar ─────────────────────────────────────────────────────────────────
function QuotaBar({ label, used, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const barColor = pct > 90 ? C.red : pct > 70 ? C.amber : color || C.blue;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.dark }}>{label}</span>
        <span style={{ fontSize:12, color:C.muted }}>{used} / {total}</span>
      </div>
      <div style={{ height:8, background:C.border, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:99, transition:"width .3s" }}/>
      </div>
      <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{pct}% used</div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ val, label, color }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px" }}>
      <div style={{ fontSize:26, fontWeight:800, color:color||C.navy }}>{val}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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
      onLogin(data.token, data.user, data.organiser);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>
      <div style={{ background:C.white, borderRadius:16, padding:40, width:380, boxShadow:"0 24px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy, letterSpacing:"-0.02em" }}>Fingoh</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Organiser Portal</div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lS}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={iS}/>
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={lS}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password"
            onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={iS}/>
        </div>
        {error && <p style={{ fontSize:12, color:C.red, marginBottom:16, textAlign:"center" }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", padding:"11px 0", background:loading?"#CBD5E1":C.navy, color:C.white, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:F }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

// ── Create Event Modal ────────────────────────────────────────────────────────
function CreateEventModal({ token, onClose, onCreated }) {
  const [form, setForm] = useState({ name:"", venue:"", start_date:"", end_date:"", industry_vertical:"general" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!form.name) { setError("Event name is required"); return; }
    setLoading(true); setError("");
    try {
      await apiCall("/organiser/events", token, { method:"POST", body:JSON.stringify(form) });
      onCreated();
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:C.white, borderRadius:16, padding:32, maxWidth:500, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:C.navy, margin:0 }}>Create New Event</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.muted }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={lS}>Event Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={iS} placeholder="e.g. Pharma Pro & Pack 2026"/></div>
          <div><label style={lS}>Venue</label><input value={form.venue} onChange={e=>setForm(p=>({...p,venue:e.target.value}))} style={iS} placeholder="e.g. Bombay Exhibition Centre"/></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={lS}>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm(p=>({...p,start_date:e.target.value}))} style={iS}/></div>
            <div><label style={lS}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm(p=>({...p,end_date:e.target.value}))} style={iS}/></div>
          </div>
          <div>
            <label style={lS}>Industry Vertical</label>
            <select value={form.industry_vertical} onChange={e=>setForm(p=>({...p,industry_vertical:e.target.value}))} style={iS}>
              <option value="general">General</option>
              <option value="pharma">Pharma</option>
              <option value="electronics">Electronics</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>
        </div>
        {error && <p style={{ fontSize:12, color:C.red, margin:"12px 0 0" }}>{error}</p>}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px 0", background:C.white, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex:2, padding:"10px 0", background:loading?"#CBD5E1":C.navy, color:C.white, border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:F }}>
            {loading ? "Creating…" : "Create Event →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Event Detail ──────────────────────────────────────────────────────────────
function EventDetail({ token, event, onBack }) {
  const [exhibitors, setExhibitors]   = useState([]);
  const [uploads, setUploads]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("exhibitors");
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAlloc, setInviteAlloc] = useState(500);
  const [inviting, setInviting]       = useState(false);
  const [inviteMsg, setInviteMsg]     = useState("");
  const [uploading, setUploading]     = useState(false);
  const [uploadMsg, setUploadMsg]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ex, up] = await Promise.all([
        apiCall(`/organiser/events/${event.id}/exhibitors`, token),
        apiCall(`/organiser/events/${event.id}/visitor-uploads`, token),
      ]);
      setExhibitors(ex);
      setUploads(up);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [event.id, token]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true); setInviteMsg("");
    try {
      await apiCall(`/organiser/events/${event.id}/invite`, token, {
        method: "POST",
        body: JSON.stringify({ invite_email: inviteEmail, data_allocation: parseInt(inviteAlloc) }),
      });
      setInviteMsg("✓ Invite sent successfully");
      setInviteEmail(""); setInviteAlloc(500);
      setShowInvite(false);
      load();
    } catch(e) { setInviteMsg("✗ " + e.message); }
    setInviting(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/upload?event_id=${event.id}`, {
        method: "POST",
        headers: { "x-fingoh-auth": `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setUploadMsg(`✓ ${data.row_count} visitors uploaded successfully`);
      load();
    } catch(e) { setUploadMsg("✗ " + e.message); }
    setUploading(false);
    e.target.value = "";
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm("Delete this upload? This will remove all visitor rows.")) return;
    try {
      await apiCall(`/organiser/visitor-uploads/${uploadId}`, token, { method:"DELETE" });
      load();
    } catch(e) { alert("Failed: " + e.message); }
  };

  const handleUpdateAllocation = async (linkId, current) => {
    const val = window.prompt("New data allocation (rows):", current);
    if (!val) return;
    try {
      await apiCall(`/organiser/exhibitors/${linkId}/allocate`, token, {
        method: "PATCH",
        body: JSON.stringify({ data_allocation: parseInt(val) }),
      });
      load();
    } catch(e) { alert("Failed: " + e.message); }
  };

  const handleRemoveExhibitor = async (linkId) => {
    if (!window.confirm("Remove this exhibitor from the event?")) return;
    try {
      await apiCall(`/organiser/exhibitors/${linkId}`, token, { method:"DELETE" });
      load();
    } catch(e) { alert("Failed: " + e.message); }
  };

  const STATUS_COLORS = {
    invited:  { bg:"#FFF7ED", fg:"#C2410C" },
    accepted: { bg:"#F0FDF4", fg:"#16A34A" },
    active:   { bg:"#EFF6FF", fg:"#1D4ED8" },
    removed:  { bg:"#F1F5F9", fg:"#64748B" },
  };

  return (
    <div style={{ fontFamily:F }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={onBack}
          style={{ padding:"7px 14px", background:C.white, color:C.navy, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F }}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:C.navy, margin:0 }}>{event.name}</h1>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>{event.venue || "No venue"} · {event.industry_vertical}</p>
        </div>
        <span style={{ marginLeft:"auto", fontSize:11, padding:"4px 10px", borderRadius:99, background:C.ltblue, color:C.blue, fontWeight:700 }}>
          {event.status}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:`2px solid ${C.border}` }}>
        {["exhibitors","visitor-data"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding:"8px 18px", background:"none", border:"none", borderBottom:activeTab===tab?`2px solid ${C.blue}`:"2px solid transparent", color:activeTab===tab?C.blue:C.muted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F, marginBottom:-2, textTransform:"capitalize" }}>
            {tab === "visitor-data" ? "Visitor Data" : "Exhibitors"}
          </button>
        ))}
      </div>

      {/* Exhibitors Tab */}
      {activeTab === "exhibitors" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <p style={{ fontSize:13, color:C.muted, margin:0 }}>{exhibitors.length} exhibitor(s) invited</p>
            <button onClick={() => setShowInvite(true)}
              style={{ padding:"8px 18px", background:C.navy, color:C.white, border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:F }}>
              + Invite Exhibitor
            </button>
          </div>

          {inviteMsg && (
            <div style={{ padding:"10px 14px", background:inviteMsg.startsWith("✓")?C.ltgrn:C.ltred, borderRadius:8, fontSize:13, marginBottom:16, color:inviteMsg.startsWith("✓")?C.green:C.red }}>
              {inviteMsg}
            </div>
          )}

          {showInvite && (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:"0 0 14px" }}>Invite Exhibitor</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 160px auto", gap:10, alignItems:"end" }}>
                <div>
                  <label style={lS}>Exhibitor Email *</label>
                  <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} type="email" style={iS} placeholder="exhibitor@company.com"/>
                </div>
                <div>
                  <label style={lS}>Data Allocation</label>
                  <input value={inviteAlloc} onChange={e=>setInviteAlloc(e.target.value)} type="number" style={iS} min="1"/>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setShowInvite(false)}
                    style={{ padding:"9px 14px", background:C.white, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:F }}>
                    Cancel
                  </button>
                  <button onClick={handleInvite} disabled={inviting}
                    style={{ padding:"9px 18px", background:inviting?"#CBD5E1":C.blue, color:C.white, border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:inviting?"not-allowed":"pointer", fontFamily:F }}>
                    {inviting ? "Sending…" : "Send Invite"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:C.muted }}>Loading…</div>
          ) : exhibitors.length === 0 ? (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:40, textAlign:"center", color:C.muted, fontSize:13 }}>
              No exhibitors invited yet
            </div>
          ) : (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 120px 100px", gap:0, padding:"9px 16px", background:"#F8FAFC", borderBottom:`1px solid ${C.border}` }}>
                {["Email","Status","Allocation","Consumed","Actions"].map(h => (
                  <div key={h} style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase" }}>{h}</div>
                ))}
              </div>
              {exhibitors.map((ex, i) => {
                const sc = STATUS_COLORS[ex.status] || STATUS_COLORS.invited;
                return (
                  <div key={ex.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 120px 100px", gap:0, padding:"12px 16px", alignItems:"center", borderBottom: i < exhibitors.length-1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ fontSize:13, color:C.dark, fontWeight:500 }}>{ex.invite_email}</div>
                    <div><span style={{ fontSize:11, padding:"3px 8px", borderRadius:99, background:sc.bg, color:sc.fg, fontWeight:700 }}>{ex.status}</span></div>
                    <div style={{ fontSize:13, color:C.dark }}>{ex.data_allocation} rows</div>
                    <div style={{ fontSize:13, color:C.muted }}>{ex.data_consumed} rows</div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => handleUpdateAllocation(ex.id, ex.data_allocation)}
                        style={{ padding:"4px 8px", background:C.ltblue, color:C.blue, border:"1px solid #BFDBFE", borderRadius:6, fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:F }}>
                        Edit
                      </button>
                      <button onClick={() => handleRemoveExhibitor(ex.id)}
                        style={{ padding:"4px 8px", background:C.ltred, color:C.red, border:"1px solid #FECACA", borderRadius:6, fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:F }}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Visitor Data Tab */}
      {activeTab === "visitor-data" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <p style={{ fontSize:13, color:C.muted, margin:0 }}>{uploads.length} upload(s) · {uploads.reduce((a,u) => a + u.row_count, 0)} total rows</p>
            <label style={{ padding:"8px 18px", background:C.navy, color:C.white, border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:F }}>
              {uploading ? "Uploading…" : "↑ Upload CSV"}
              <input type="file" accept=".csv" onChange={handleUpload} style={{ display:"none" }} disabled={uploading}/>
            </label>
          </div>

          {uploadMsg && (
            <div style={{ padding:"10px 14px", background:uploadMsg.startsWith("✓")?C.ltgrn:C.ltred, borderRadius:8, fontSize:13, marginBottom:16, color:uploadMsg.startsWith("✓")?C.green:C.red }}>
              {uploadMsg}
            </div>
          )}

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:C.muted }}>Loading…</div>
          ) : uploads.length === 0 ? (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:40, textAlign:"center", color:C.muted, fontSize:13 }}>
              No visitor data uploaded yet — upload a CSV to get started
            </div>
          ) : (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 80px", gap:0, padding:"9px 16px", background:"#F8FAFC", borderBottom:`1px solid ${C.border}` }}>
                {["Filename","Rows","Uploaded",""].map(h => (
                  <div key={h} style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase" }}>{h}</div>
                ))}
              </div>
              {uploads.map((up, i) => (
                <div key={up.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 80px", gap:0, padding:"12px 16px", alignItems:"center", borderBottom: i < uploads.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize:13, fontWeight:500, color:C.dark }}>📄 {up.filename}</div>
                  <div style={{ fontSize:13, color:C.dark }}>{up.row_count.toLocaleString()} rows</div>
                  <div style={{ fontSize:12, color:C.muted }}>{new Date(up.uploaded_at).toLocaleDateString()}</div>
                  <button onClick={() => handleDeleteUpload(up.id)}
                    style={{ padding:"4px 10px", background:C.ltred, color:C.red, border:"1px solid #FECACA", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ token, organiser, onSelectEvent }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiCall("/organiser/dashboard", token);
      setData(d);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const STATUS_COLORS = {
    draft:  { bg:"#F1F5F9", fg:"#475569" },
    active: { bg:"#F0FDF4", fg:"#16A34A" },
    closed: { bg:"#FEF2F2", fg:"#DC2626" },
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:C.navy, margin:0 }}>{organiser?.name}</h1>
          <p style={{ fontSize:12, color:C.muted, margin:"4px 0 0" }}>Organiser Dashboard</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ padding:"9px 20px", background:C.navy, color:C.white, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:F }}>
          + New Event
        </button>
      </div>

      {loading ? (
        <div style={{ padding:60, textAlign:"center", color:C.muted }}>Loading…</div>
      ) : data ? (
        <>
          {/* Quota cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:C.navy, margin:"0 0 16px" }}>Quota Usage</h3>
              <QuotaBar label="Exhibitors" used={data.organiser.exhibitor_used} total={data.organiser.exhibitor_quota} color={C.blue}/>
              <QuotaBar label="Data Rows" used={data.organiser.data_used} total={data.organiser.data_quota} color={C.purple}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <StatCard val={data.stats.total_invited}  label="Exhibitors invited" color={C.blue}/>
              <StatCard val={data.stats.total_accepted} label="Accepted invites"   color={C.green}/>
              <StatCard val={data.events.length}        label="Events created"     color={C.navy}/>
              <StatCard val={data.stats.total_data_consumed} label="Rows consumed" color={C.purple}/>
            </div>
          </div>

          {/* Events */}
          <h2 style={{ fontSize:15, fontWeight:700, color:C.navy, margin:"0 0 12px" }}>Events</h2>
          {data.events.length === 0 ? (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:40, textAlign:"center", color:C.muted, fontSize:13 }}>
              No events yet — create your first event
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
              {data.events.map(ev => {
                const sc = STATUS_COLORS[ev.status] || STATUS_COLORS.draft;
                return (
                  <div key={ev.id} onClick={() => onSelectEvent(ev)}
                    style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:20, cursor:"pointer", transition:"box-shadow .15s" }}
                    onMouseOver={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
                    onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0 }}>{ev.name}</h3>
                      <span style={{ fontSize:10, padding:"3px 8px", borderRadius:99, background:sc.bg, color:sc.fg, fontWeight:700, flexShrink:0 }}>{ev.status}</span>
                    </div>
                    <p style={{ fontSize:12, color:C.muted, margin:"0 0 10px" }}>{ev.venue || "No venue"}</p>
                    <div style={{ display:"flex", gap:12, fontSize:11, color:C.muted }}>
                      <span>📅 {ev.start_date || "TBD"}</span>
                      <span>🏭 {ev.industry_vertical}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={{ padding:40, textAlign:"center", color:C.red }}>Failed to load dashboard</div>
      )}

      {showCreate && (
        <CreateEventModal token={token} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }}/>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken]         = useState(localStorage.getItem("org_token") || "");
  const [user, setUser]           = useState(null);
  const [organiser, setOrganiser] = useState(null);
  const [selEvent, setSelEvent]   = useState(null);

  const handleLogin = (t, u, o) => {
    localStorage.setItem("org_token", t);
    setToken(t); setUser(u); setOrganiser(o);
  };

  const handleSignOut = () => {
    localStorage.removeItem("org_token");
    setToken(""); setUser(null); setOrganiser(null); setSelEvent(null);
  };

  if (!token) return <LoginScreen onLogin={handleLogin}/>;

  return (
    <div style={{ fontFamily:F, minHeight:"100vh", background:C.light }}>
      {/* Header */}
      <div style={{ background:C.navy, padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ color:C.white, fontWeight:800, fontSize:16, letterSpacing:"-0.02em" }}>Fingoh</span>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>Organiser Portal</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {organiser && <span style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>{organiser.name}</span>}
          <button onClick={handleSignOut}
            style={{ padding:"6px 14px", background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding:"28px 32px", maxWidth:1100, margin:"0 auto" }}>
        {selEvent ? (
          <EventDetail token={token} event={selEvent} onBack={() => setSelEvent(null)}/>
        ) : (
          <Dashboard token={token} organiser={organiser} onSelectEvent={setSelEvent}/>
        )}
      </div>
    </div>
  );
}
