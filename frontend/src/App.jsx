import { useState, useEffect, useRef, useCallback } from "react";
import useWebSocket from "./hooks/useWebSocket";
import useSpeech from "./hooks/useSpeech";
import "./App.css";

const DEFAULT_HEYGEN_URL = "https://embed.liveavatar.com/v1/c067d5e1-d158-4d6b-a18b-b0845004ea04?orientation=horizontal";

function loadSettings() {
  try { return JSON.parse(localStorage.getItem("csbb_settings") || "{}"); } catch { return {}; }
}
function saveSettings(s) { localStorage.setItem("csbb_settings", JSON.stringify(s)); }

const ROLES = [
  { id: "cs", label: "chief secretary" },
  { id: "ps", label: "principal secretary" },
  { id: "support_cell", label: "support cell" },
];

const SUGGESTIONS = [
  { q: "Aaj ka schedule kya hai?", label: "aaj ka schedule" },
  { q: "MGNREGA status", label: "MGNREGA status" },
  { q: "Koi critical alert hai?", label: "koi alert hai?" },
  { q: "Show high priority pending files", label: "pending files" },
];

function Avatar({ heygenUrl }) {
  return (
    <div className="avatar-screen">
      <iframe
        src={heygenUrl || DEFAULT_HEYGEN_URL}
        allow="microphone; autoplay; encrypted-media"
        title="HeyGen LiveAvatar"
      />
    </div>
  );
}

/* ==================== LANDING PAGE ==================== */
function Landing({ onStart, role, setRole, scrolled }) {
  return (
    <>
      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="wrap">
          <div className="wordmark"><span className="b">briefing</span><span className="dim">.system</span></div>
          <div className="nav-meta">
            <span className="ver"><span className="dot" /> v0.2</span>
            <span className="nav-gov">Office of the Chief Secretary &middot; Bihar</span>
            <button className="nav-start" onClick={onStart}>Start briefing</button>
          </div>
        </div>
      </nav>

      <div className="page">
        {/* HERO */}
        <header className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-main">
                <div className="marker hero-kicker hero-anim d1 in">// briefing.system</div>
                <h1 className="hero-anim d2 in">AI briefing assistant for the{" "}<span className="accent">Office&nbsp;of&nbsp;the<br />Chief&nbsp;Secretary</span></h1>
                <p className="hero-sub hero-anim d3 in">A bilingual voice and chat assistant for senior governance. <b>Every answer is grounded in a named source.</b> Every official action waits for human approval.</p>
                <div className="hero-ctas hero-anim d4 in">
                  <button className="btn btn-primary" onClick={onStart}>Start briefing <span className="arr">&rarr;</span></button>
                  <a className="btn btn-ghost" href="#capabilities">What it can do</a>
                </div>
              </div>
              <div className="hero-side hero-anim d5 in">
                <div className="spec">
                  <div className="spec-row"><span className="k">status</span><span className="v"><span className="live">&bull; live</span></span></div>
                  <div className="spec-row"><span className="k">languages</span><span className="v">EN &middot; &#2361;&#2367;&#2306;&#2342;&#2368; &middot; Hinglish</span></div>
                  <div className="spec-row"><span className="k">tools</span><span className="v"><span className="em">6</span> grounded</span></div>
                  <div className="spec-row"><span className="k">sources</span><span className="v">cited inline</span></div>
                  <div className="spec-row"><span className="k">voice</span><span className="v">web-speech</span></div>
                  <div className="spec-row"><span className="k">actions</span><span className="v">human-gated</span></div>
                </div>
              </div>
            </div>
            <div className="hero-tricolor hero-anim d5 in"><div className="tricolor" /></div>
          </div>
        </header>

        {/* AVATAR BAND */}
        <section className="avatar-band">
          <div className="wrap">
            <div className="avatar-row">
              <div className="avatar-copy reveal in">
                <div className="marker">// live avatar</div>
                <h3>A face for the briefing.</h3>
                <p>Voice-first, with barge-in. Ask aloud or type &mdash; the avatar answers in your language and reads the briefing back.</p>
                <div className="avatar-chips">
                  <span className="chip">&#127908; voice in</span>
                  <span className="chip">&#128266; voice out</span>
                  <span className="chip"><span className="g">EN</span> &middot; &#2361;&#2367;&#2306;&#2342;&#2368; &middot; Hinglish</span>
                </div>
              </div>
              <div className="avatar-frame reveal in">
                <div className="avatar-glow" />
                <Avatar />
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="section" id="capabilities">
          <div className="wrap">
            <div className="sec-head reveal in">
              <div className="rule"><span className="marker">// capabilities</span><span className="line" /></div>
              <h2 className="sec-title">What it can <em>brief</em> on.</h2>
              <p className="sec-sub">Six grounded tools across calendar, files, schemes, alerts, officers, and operational workflows. Bilingual throughout &mdash; English, Hindi, or Hinglish.</p>
            </div>
            <div className="cap-grid">
              {[
                { idx: "01", mk: "// calendar", t: "Today\u2019s agenda & meetings", p: "Cabinet sub-committees, VC reviews, DM check-ins, and pre-cabinet prep across every secretariat.", src: "CS Office Calendar" },
                { idx: "02", mk: "// schemes", t: "Scheme progress", p: "MGNREGA, PMAY-G, Jal Jeevan Mission, JEEViKA, PM POSHAN \u2014 status, deltas, lagging districts.", src: "Scheme MIS Dashboard" },
                { idx: "03", mk: "// alerts", t: "Situational alerts", p: "Heatwave readiness, flood risk, river levels, SLA breaches. Severity-sorted, district-scoped.", src: "State Situation Room" },
                { idx: "04", mk: "// files", t: "Pending files", p: "Files pending CS approval with ageing summaries, department info, and financial implications.", src: "CS File Tracking System" },
                { idx: "05", mk: "// officers", t: "Officer profiles", p: "30-second cards for any post, name, or district. Service batch, contact, and posting history.", src: "HR-MIS, GAD" },
                { idx: "06", mk: "// operations", t: "Approval & broadcast workflows", p: "Draft MoMs, cancellations, broadcasts. Held for human confirmation \u2014 never sent autonomously.", src: "Workflow Engine" },
              ].map((c) => (
                <article className="cap reveal in" key={c.idx}>
                  <span className="idx">{c.idx}</span>
                  <div className="marker">{c.mk}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                  <div className="cap-src">{c.src}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* GOVERNANCE */}
        <section className="section section--tight">
          <div className="wrap">
            <div className="sec-head reveal in">
              <div className="rule"><span className="marker">// governance</span><span className="line" /></div>
              <h2 className="sec-title">Trust by <em>construction.</em></h2>
            </div>
            <div className="gov-stats">
              <div className="stat reveal in">
                <div className="num">100<span className="u">%</span></div>
                <div className="marker">// audit-logged</div>
                <p>Every query, every reply, every source, every tool call. Append-only JSONL.</p>
              </div>
              <div className="stat reveal in">
                <div className="num">6</div>
                <div className="marker">// tool sources</div>
                <p>Calendar, files, schemes, alerts, officers, workflows &mdash; each cited inline.</p>
              </div>
              <div className="stat reveal in">
                <div className="num">0</div>
                <div className="marker">// fabricated facts</div>
                <p>Grounding is non-negotiable. If a tool returns nothing, the bot says so plainly.</p>
              </div>
            </div>
            <div className="roles-line reveal in">
              <span className="marker">// access</span>
              <div>
                <p>Three roles &mdash; <b>Chief Secretary</b>, <b>PS to CS</b>, <b>Support cell</b> &mdash; each with scoped access to tools and sensitive material. Role enforcement is server-side.</p>
                <div className="roles-tags">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      className={`role-tag${role === r.id ? " active" : ""}`}
                      onClick={() => setRole(r.id)}
                      style={role === r.id ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}}
                    >
                      {r.id} &middot; {r.id === "cs" ? "full" : r.id === "ps" ? "portfolio" : "read-limited"}
                    </button>
                  ))}
                  <span className="role-tag">server-side enforced</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BILINGUAL DEMO */}
        <section className="section section--tight">
          <div className="wrap">
            <div className="sec-head reveal in">
              <div className="rule"><span className="marker">// bilingual</span><span className="line" /></div>
              <h2 className="sec-title">Works in <em>your</em> language.</h2>
            </div>
            <div className="demo-grid">
              <div className="demo reveal in">
                <div className="q">Aaj ka schedule kya hai?</div>
                <div className="a">&#2360;&#2352;, &#2310;&#2332; &#2310;&#2346;&#2325;&#2368; <b>4 &#2348;&#2376;&#2336;&#2325;&#2375;&#2306;</b> &#2361;&#2376;&#2306;&#2404; &#2346;&#2361;&#2354;&#2368; PS &#2325;&#2375; &#2360;&#2366;&#2341; &#2360;&#2369;&#2348;&#2361; 9 &#2348;&#2332;&#2375; morning briefing, &#2347;&#2367;&#2352; 10:30 &#2348;&#2332;&#2375; Jal Jeevan Mission review&#8230;</div>
                <div className="tag"><span className="lang">hi &rarr; hi</span> &middot; CS Office Calendar</div>
              </div>
              <div className="demo reveal in">
                <div className="q">MGNREGA status</div>
                <div className="a"><b>12.3 Cr</b> persondays against 18 Cr target (68.3%). 3 lagging districts: Araria (42%), Kishanganj (45%), Katihar (48%).</div>
                <div className="tag"><span className="lang">en &rarr; en</span> &middot; MGNREGA MIS Dashboard</div>
              </div>
              <div className="demo reveal in">
                <div className="q">Koi critical alert hai?</div>
                <div className="a">Sir, <b>2 high alerts</b> hain: &#128308; Heatwave &mdash; North Bihar (8 districts, 46&ndash;48&deg;C). &#128992; Flood &mdash; Kosi basin (Supaul, Saharsa, Madhepura).</div>
                <div className="tag"><span className="lang">hinglish</span> &middot; State Situation Room</div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT / CTA */}
        <section className="section">
          <div className="wrap">
            <div className="about-grid">
              <div className="about-copy reveal in">
                <div className="rule" style={{ marginBottom: 26 }}><span className="marker">// about</span><span className="line" /></div>
                <h2 className="sec-title">Built for the <em>Office of the Chief Secretary,</em> Bihar.</h2>
                <p>Bilingual briefing on calendar, files, schemes, alerts, officer postings. Voice-first via Web Speech. Approval-gated for every official action.</p>
              </div>
              <div className="about-cta reveal in">
                <div className="big">Begin a briefing.</div>
                <button className="btn btn-primary" onClick={onStart}>Start briefing <span className="arr">&rarr;</span></button>
                <div className="about-note">no login &middot; proof of concept</div>
              </div>
            </div>
          </div>
        </section>

        <div className="tricolor" />

        {/* FOOTER */}
        <footer className="footer">
          <div className="wrap">
            <div className="wordmark"><span className="b">briefing</span><span className="dim">.system</span></div>
            <span>v0.2 &middot; POC</span>
            <span>built for the office of the chief secretary, bihar</span>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ==================== EMAIL MODAL ==================== */
function EmailModal({ text, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [customEmail, setCustomEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${apiUrl}/contacts`).then(r => r.json()).then(setContacts).catch(() => {});
  }, [apiUrl]);

  const toggleContact = (email) => {
    setSelected(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const addCustom = () => {
    const em = customEmail.trim();
    if (em && em.includes("@") && !selected.includes(em)) {
      setSelected(prev => [...prev, em]);
      setCustomEmail("");
    }
  };

  const handleSend = async () => {
    if (selected.length === 0) return;
    setSending(true);
    try {
      const res = await fetch(`${apiUrl}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected, content: text }),
      });
      const data = await res.json();
      setResult(data.error ? `Error: ${data.error}` : "Sent!");
      if (!data.error) setTimeout(onClose, 1500);
    } catch {
      setResult("Failed to send");
    }
    setSending(false);
  };

  return (
    <div className="email-overlay" onClick={onClose}>
      <div className="email-modal" onClick={e => e.stopPropagation()}>
        <div className="email-header">
          <span className="marker">// send via email</span>
          <button className="email-close" onClick={onClose}>&times;</button>
        </div>
        <div className="email-preview">{text.length > 200 ? text.slice(0, 200) + "..." : text}</div>
        <div className="email-contacts">
          {contacts.map(c => (
            <button
              key={c.email}
              className={`email-contact${selected.includes(c.email) ? " active" : ""}`}
              onClick={() => toggleContact(c.email)}
            >
              <span className="ec-name">{c.name}</span>
              <span className="ec-post">{c.post}</span>
            </button>
          ))}
        </div>
        <div className="email-custom">
          <input
            type="email"
            placeholder="Add email address..."
            value={customEmail}
            onChange={e => setCustomEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
          />
          <button onClick={addCustom}>Add</button>
        </div>
        {selected.length > 0 && (
          <div className="email-selected">
            {selected.map(em => (
              <span key={em} className="email-chip">{em} <button onClick={() => toggleContact(em)}>&times;</button></span>
            ))}
          </div>
        )}
        <button className="email-send" onClick={handleSend} disabled={sending || selected.length === 0}>
          {sending ? "Sending..." : result || `Send to ${selected.length} recipient${selected.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}

/* ==================== SETTINGS MODAL ==================== */
function SettingsModal({ onClose, sessionId }) {
  const [s, setS] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const update = (key, val) => setS(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    saveSettings(s);
    if (sessionId) {
      try {
        await fetch(`${apiUrl}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, ...s }),
        });
      } catch {}
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div className="email-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="email-header">
          <span className="marker">// settings</span>
          <button className="email-close" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-group">
          <label className="settings-label">Groq API Key</label>
          <input type="password" className="settings-input" placeholder="gsk_..." value={s.groq_api_key || ""} onChange={e => update("groq_api_key", e.target.value)} />
        </div>

        <div className="settings-group">
          <label className="settings-label">ElevenLabs API Key</label>
          <input type="password" className="settings-input" placeholder="sk_..." value={s.elevenlabs_api_key || ""} onChange={e => update("elevenlabs_api_key", e.target.value)} />
        </div>

        <div className="settings-group">
          <label className="settings-label">ElevenLabs Voice ID</label>
          <input type="text" className="settings-input" placeholder="EXAVITQu4vr4xnSDxMaL" value={s.elevenlabs_voice_id || ""} onChange={e => update("elevenlabs_voice_id", e.target.value)} />
        </div>

        <div className="settings-group">
          <label className="settings-label">HeyGen Avatar URL</label>
          <input type="text" className="settings-input" placeholder="https://embed.liveavatar.com/v1/..." value={s.heygen_url || ""} onChange={e => update("heygen_url", e.target.value)} />
        </div>

        <div className="settings-hint">Keys are saved in your browser. Leave blank to use defaults.</div>

        <button className="email-send" onClick={handleSave}>{saved ? "Saved!" : "Save settings"}</button>
      </div>
    </div>
  );
}

/* ==================== SESSION VIEW ==================== */
function Session({ role, messages, isThinking, onSend, onDisconnect, sessionId }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [emailText, setEmailText] = useState(null);
  const [kbChunks, setKbChunks] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);
  const msgsRef = useRef(null);
  const { isListening, transcript, startListening, stopListening } = useSpeech();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;
    e.target.value = "";
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("session_id", sessionId);
      const res = await fetch(`${apiUrl}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (data.error) {
        setUploadError(data.error);
      } else {
        setKbChunks(data.total_chunks);
      }
    } catch {
      setUploadError("Upload failed");
    }
    setUploading(false);
  };

  const scrollChat = useCallback(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollChat(); }, [messages, isThinking, scrollChat]);

  const send = (text) => {
    if (!text.trim()) return;
    setShowSuggestions(false);
    onSend(text.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
    setInput("");
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => { if (text.trim()) send(text.trim()); });
    }
  };

  const roleLabel = ROLES.find((r) => r.id === role)?.label || role;

  return (
    <div className="session show">
      <nav className="session-nav">
        <div className="wordmark"><span className="b">briefing</span><span className="dim">.system</span></div>
        <div className="session-role">// role <span className="em">{roleLabel}</span></div>
        <div className="session-right-nav">
          <div className="session-conn"><span className="dot" /> connected</div>
          <button className="btn-settings" onClick={() => setShowSettings(true)} title="Settings">&#9881;</button>
          <button className="btn-dc" onClick={onDisconnect}>Disconnect</button>
        </div>
      </nav>

      <div className="session-main">
        <div className="session-left">
          <div className="marker">// live avatar</div>
          <div className="session-avatar">
            <div className="avatar-glow" />
            <Avatar heygenUrl={loadSettings().heygen_url} />
          </div>
          <div className="session-facts">
            <div className="row"><span className="k">status</span><span className="v"><span className="g">&bull; live</span></span></div>
            <div className="row"><span className="k">language</span><span className="v">auto &middot; hi / en</span></div>
            <div className="row"><span className="k">grounding</span><span className="v"><span className="g">on</span></span></div>
            <div className="row"><span className="k">actions</span><span className="v">human-gated</span></div>
          </div>
        </div>

        <div className="session-right-pane">
          <div className="chat-head"><span className="marker">// briefing</span></div>
          <div className="chat-msgs" ref={msgsRef}>
            {messages.map((msg, i) => {
              if (msg.type === "user") {
                return (
                  <div className="m user" key={i}>
                    <div className="label">you</div>
                    <div className="body">{msg.text}</div>
                  </div>
                );
              }
              if (msg.type === "assistant") {
                return (
                  <div className="m bot" key={i}>
                    <div className="label">csbb</div>
                    <div className="body">{msg.text}</div>
                    <button className="email-btn-msg" onClick={() => setEmailText(msg.text)}>&#9993; Email this</button>
                  </div>
                );
              }
              if (msg.type === "tool_call") {
                return (
                  <div className="m tool" key={i}>
                    <div className="tn">{msg.tool}</div>
                    <div>{JSON.stringify(msg.input)}</div>
                  </div>
                );
              }
              if (msg.type === "error") {
                return (
                  <div className="m bot" key={i}>
                    <div className="label" style={{ color: "#e2603a" }}>error</div>
                    <div className="body" style={{ color: "#f0a58c" }}>{msg.text}</div>
                  </div>
                );
              }
              return null;
            })}
            {isThinking && (
              <div className="m think">
                <span /><span /><span />
              </div>
            )}
          </div>

          {showSuggestions && messages.length <= 1 && (
            <div className="suggest">
              {SUGGESTIONS.map((s) => (
                <button className="sg" key={s.q} onClick={() => send(s.q)}>{s.label}</button>
              ))}
            </div>
          )}

          <form className="chat-input" onSubmit={handleSubmit}>
            {transcript && <div className="mic-tip show">&#127897; {transcript}</div>}
            {uploadError && <div className="upload-error">{uploadError}</div>}
            <button type="button" className={`mic${isListening ? " rec" : ""}`} onClick={handleMic} title="Voice input">&#127908;</button>
            <button type="button" className={`upload-btn${uploading ? " uploading" : ""}`} onClick={() => fileInputRef.current?.click()} title="Upload to knowledge base" disabled={uploading}>
              &#128206;{kbChunks > 0 && <span className="kb-badge">{kbChunks}</span>}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md" style={{ display: "none" }} onChange={handleUpload} />
            <input
              className="cinput"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak \u2014 Hindi, English, or Hinglish\u2026"
            />
            <button type="submit" className="csend">Send</button>
          </form>
        </div>
      </div>
      {emailText && <EmailModal text={emailText} onClose={() => setEmailText(null)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} sessionId={sessionId} />}
    </div>
  );
}

/* ==================== APP ==================== */
export default function App() {
  const [role, setRole] = useState("cs");
  const [scrolled, setScrolled] = useState(false);
  const { messages, isConnected, isThinking, sessionId, connect, disconnect, sendMessage } = useWebSocket(role);
  const { speak, unlockAudio } = useSpeech();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-speak assistant messages
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.type === "assistant") speak(last.text, sessionId);
  }, [messages, speak, sessionId]);

  // Add welcome message on connect
  const [welcomeSent, setWelcomeSent] = useState(false);
  const allMessages = isConnected && !welcomeSent ? messages : messages;

  useEffect(() => {
    if (isConnected && !welcomeSent) setWelcomeSent(true);
    if (!isConnected) setWelcomeSent(false);
  }, [isConnected, welcomeSent]);

  // Push saved settings to backend when session connects
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  useEffect(() => {
    if (!sessionId) return;
    const s = loadSettings();
    if (s.groq_api_key || s.elevenlabs_api_key || s.elevenlabs_voice_id || s.heygen_url) {
      fetch(`${apiUrl}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, ...s }),
      }).catch(() => {});
    }
  }, [sessionId, apiUrl]);

  const handleStart = () => {
    unlockAudio();
    if (!isConnected) connect();
  };

  const handleDisconnect = () => {
    disconnect();
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Background */}
      <div className="bg" aria-hidden="true">
        <div className="bg-ink" />
        <div className="bg-cols" />
        <div className="bg-grain" />
      </div>

      {!isConnected && (
        <div className="landing-root">
          <Landing onStart={handleStart} role={role} setRole={setRole} scrolled={scrolled} />
        </div>
      )}

      {isConnected && (
        <Session
          role={role}
          messages={messages}
          isThinking={isThinking}
          onSend={sendMessage}
          onDisconnect={handleDisconnect}
          sessionId={sessionId}
        />
      )}
    </>
  );
}
