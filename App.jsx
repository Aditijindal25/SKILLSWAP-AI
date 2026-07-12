import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowRight,
  Sparkles,
  Star,
  Send,
  X,
  Plus,
  MessageCircle,
  Video,
  Users,
  Repeat,
  Mail,
  Lock,
  User,
  LogOut,
} from "lucide-react";

const INK = "#1F2A22";
const MUTED = "#6B7568";
const BG = "#F4F6F1";
const CARD = "#FFFFFF";
const BORDER = "rgba(31,42,34,0.12)";
const PRIMARY = "#3F6B4F";
const PRIMARY_SOFT = "rgba(63,107,79,0.1)";
const GOLD = "#B8912B";

const MY_PROFILE = {
  name: "You",
  offers: ["Guitar", "Spanish", "Photoshop"],
  wants: ["Python", "Public Speaking", "Chess"],
};

const CANDIDATES = [
  {
    id: 1,
    name: "Maya Chen",
    initials: "MC",
    color: "#3F6B4F",
    offers: ["Python", "Data Viz", "SQL"],
    wants: ["Guitar", "Photoshop"],
    rating: 4.8,
    reviews: 23,
    bio: "CS junior. Taught 40+ students Python this year.",
  },
  {
    id: 2,
    name: "Diego Ramirez",
    initials: "DR",
    color: "#B8912B",
    offers: ["Public Speaking", "Debate", "Writing"],
    wants: ["Spanish", "Chess"],
    rating: 4.6,
    reviews: 15,
    bio: "Debate captain. Coaches speech & rhetoric on weekends.",
  },
  {
    id: 3,
    name: "Priya Nair",
    initials: "PN",
    color: "#6E5A9E",
    offers: ["Chess", "Python", "Calculus"],
    wants: ["Guitar", "Spanish"],
    rating: 4.9,
    reviews: 31,
    bio: "Chess club president, rated 1900+.",
  },
  {
    id: 4,
    name: "Jonah Blake",
    initials: "JB",
    color: "#A45A3E",
    offers: ["Photography", "Video Editing"],
    wants: ["Photoshop", "Guitar"],
    rating: 4.3,
    reviews: 9,
    bio: "Runs the campus film club.",
  },
];

function computeMatch(mine, candidate) {
  const theyGiveMeWant = candidate.offers.filter((s) => mine.wants.includes(s));
  const iGiveTheyWant = mine.offers.filter((s) => candidate.wants.includes(s));
  const totalPossible = mine.wants.length + mine.offers.length;
  const score = Math.round(
    ((theyGiveMeWant.length + iGiveTheyWant.length) / Math.max(totalPossible, 1)) * 100
  );
  return { score: Math.min(score, 99), theyGiveMeWant, iGiveTheyWant };
}

const AUTO_REPLIES = [
  "That works for me — want to do a 20 min trial swap this week?",
  "Sounds good! I'm free Tues/Thurs evenings, does that work?",
  "Happy to start with the basics if you are.",
  "Video call or in person? Either is fine by me.",
  "Deal. I'll teach you the fundamentals first, then we can go deeper.",
];

function SkillTag({ label, tone = "default", onRemove }) {
  const styles = {
    default: { bg: PRIMARY_SOFT, color: PRIMARY, border: "transparent" },
    outline: { bg: "transparent", color: MUTED, border: BORDER },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: 20,
        padding: "4px 10px",
        fontSize: 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {onRemove && <X size={11} style={{ cursor: "pointer" }} onClick={onRemove} />}
    </span>
  );
}

function Stars({ value }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} color={GOLD} fill={i < Math.round(value) ? GOLD : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function SkillSwapAI() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState("home");
  const [selectedId, setSelectedId] = useState(CANDIDATES[0].id);
  const [messages, setMessages] = useState({});
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [profile, setProfile] = useState(MY_PROFILE);
  const [skillInput, setSkillInput] = useState("");
  const [skillKind, setSkillKind] = useState("offers");
  const scrollRef = useRef(null);

  const matches = useMemo(
    () => CANDIDATES.map((c) => ({ ...c, match: computeMatch(profile, c) })).sort((a, b) => b.match.score - a.match.score),
    [profile]
  );

  const selected = matches.find((m) => m.id === selectedId) || matches[0];
  const thread = messages[selectedId] || [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, typing]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => ({ ...m, [selectedId]: [...(m[selectedId] || []), { from: "me", text, time }] }));
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setMessages((m) => ({
        ...m,
        [selectedId]: [
          ...(m[selectedId] || []),
          { from: "them", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ],
      }));
    }, 1100 + Math.random() * 700);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    setProfile((p) => ({ ...p, [skillKind]: [...p[skillKind], v] }));
    setSkillInput("");
  };
  const removeSkill = (kind, skill) => setProfile((p) => ({ ...p, [kind]: p[kind].filter((s) => s !== skill) }));

  const submitAuth = (e) => {
    e.preventDefault();
    setAuthError("");
    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthError("Enter an email and password.");
      return;
    }
    if (authMode === "signup" && !authForm.name.trim()) {
      setAuthError("Enter your name.");
      return;
    }
    if (authMode === "signup") {
      setProfile((p) => ({ ...p, name: authForm.name.trim() }));
    }
    setAuthed(true);
    setTab("home");
  };

  const logout = () => {
    setAuthed(false);
    setAuthMode("login");
    setAuthForm({ name: "", email: "", password: "" });
    setTab("home");
  };

  const sharedStyle = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
      .ss-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
      .ss-card { transition: transform .15s ease, box-shadow .15s ease; }
      .ss-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31,42,34,0.08); }
      .ss-nav-btn { transition: color .15s ease; }
      .ss-scroll::-webkit-scrollbar { width: 6px; }
      .ss-scroll::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 4px; }
      .ss-input { width: 100%; box-sizing: border-box; border: 1px solid ${BORDER}; border-radius: 8px; padding: 10px 12px 10px 36px; font-size: 13px; outline: none; font-family: 'Inter', system-ui, sans-serif; }
      .ss-input:focus { border-color: ${PRIMARY}; }
    `}</style>
  );

  if (!authed) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: INK, minHeight: 640, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        {sharedStyle}
        <div style={{ width: 360, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 30 }}>
          <div className="ss-display" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, justifyContent: "center", marginBottom: 4 }}>
            <Repeat size={18} color={PRIMARY} />
            SkillSwap<span style={{ color: PRIMARY }}>AI</span>
          </div>
          <p style={{ textAlign: "center", color: MUTED, fontSize: 12.5, margin: "4px 0 22px" }}>
            {authMode === "login" ? "Welcome back — sign in to see your matches." : "Create an account to start swapping skills."}
          </p>

          <div style={{ display: "flex", background: BG, borderRadius: 8, padding: 3, marginBottom: 20 }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setAuthMode(m);
                  setAuthError("");
                }}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 6,
                  padding: "7px 0",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: authMode === m ? CARD : "transparent",
                  color: authMode === m ? PRIMARY : MUTED,
                  boxShadow: authMode === m ? "0 1px 3px rgba(31,42,34,0.1)" : "none",
                }}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {authMode === "signup" && (
              <div style={{ position: "relative" }}>
                <User size={14} color={MUTED} style={{ position: "absolute", left: 12, top: 12 }} />
                <input
                  className="ss-input"
                  placeholder="Full name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && submitAuth(e)}
                />
              </div>
            )}
            <div style={{ position: "relative" }}>
              <Mail size={14} color={MUTED} style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                className="ss-input"
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && submitAuth(e)}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={14} color={MUTED} style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                className="ss-input"
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && submitAuth(e)}
              />
            </div>

            {authError && <p style={{ color: "#B44B3E", fontSize: 12, margin: 0 }}>{authError}</p>}

            <button
              onClick={submitAuth}
              style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
            >
              {authMode === "login" ? "Log in" : "Create account"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11.5, color: MUTED, marginTop: 16 }}>
            {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
            <span
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
              style={{ color: PRIMARY, fontWeight: 600, cursor: "pointer" }}
            >
              {authMode === "login" ? "Sign up" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: INK, minHeight: 640, border: `1px solid ${BORDER}` }}>
      {sharedStyle}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <div className="ss-display" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18 }}>
          <Repeat size={18} color={PRIMARY} />
          SkillSwap<span style={{ color: PRIMARY }}>AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[
            ["home", "Home"],
            ["matches", "Discover"],
            ["messages", "Messages"],
            ["profile", "Profile"],
          ].map(([key, label]) => (
            <button
              key={key}
              className="ss-nav-btn"
              onClick={() => setTab(key)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 500, color: tab === key ? PRIMARY : MUTED, padding: 0 }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={logout}
            title="Log out"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: MUTED }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {tab === "home" && (
        <div>
          <div style={{ padding: "64px 28px 48px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY_SOFT, color: PRIMARY, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>
              <Sparkles size={12} /> AI-matched skill trades
            </div>
            <h1 className="ss-display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.15, margin: "0 0 16px" }}>
              Teach what you know.
              <br />
              Learn what you don't.
            </h1>
            <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.6, maxWidth: 520, margin: "0 auto 28px" }}>
              List a skill you can teach and one you want to learn. Our matching finds students whose skills complete yours — no money, just trade.
            </p>
            <button
              onClick={() => setTab("matches")}
              style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Find your match <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", padding: "0 28px 56px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: PRIMARY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, textAlign: "center", padding: 8, marginRight: -18, zIndex: 1 }}>
                You teach Guitar
              </div>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", border: `2px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <Repeat size={20} color={INK} />
              </div>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, textAlign: "center", padding: 8, marginLeft: -18 }}>
                They teach Python
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: BORDER, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
            {[
              [Sparkles, "Smart matching", "Scores every student by real skill overlap, not just tags."],
              [MessageCircle, "Real-time chat", "Message your match instantly to plan a session."],
              [Video, "Video calls", "Hop on a call right from the chat when you're ready."],
              [Users, "Ratings & reviews", "Built on trust — every swap ends in a review."],
            ].map(([Icon, title, desc], i) => (
              <div key={i} style={{ background: CARD, padding: "26px 22px" }}>
                <Icon size={18} color={PRIMARY} style={{ marginBottom: 10 }} />
                <div className="ss-display" style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6 }}>
                  {title}
                </div>
                <div style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "matches" && (
        <div style={{ padding: "28px", maxWidth: 920, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 className="ss-display" style={{ fontSize: 21, fontWeight: 700, margin: "0 0 4px" }}>
              Your matches
            </h2>
            <p style={{ color: MUTED, fontSize: 13 }}>Ranked by overlap between what you offer/want and what they offer/want.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {matches.map((m) => (
              <div key={m.id} className="ss-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <Stars value={m.rating} />
                        <span style={{ fontSize: 11, color: MUTED }}>
                          {m.rating} ({m.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: PRIMARY_SOFT, color: PRIMARY, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {m.match.score}%
                  </div>
                </div>

                <p style={{ color: MUTED, fontSize: 12.5, margin: "10px 0", lineHeight: 1.5 }}>{m.bio}</p>

                {m.match.theyGiveMeWant.length > 0 && (
                  <p style={{ fontSize: 11.5, color: INK, margin: "0 0 6px" }}>
                    <strong>They can teach you:</strong> {m.match.theyGiveMeWant.join(", ")}
                  </p>
                )}
                {m.match.iGiveTheyWant.length > 0 && (
                  <p style={{ fontSize: 11.5, color: INK, margin: "0 0 12px" }}>
                    <strong>You can teach them:</strong> {m.match.iGiveTheyWant.join(", ")}
                  </p>
                )}

                <button
                  onClick={() => {
                    setSelectedId(m.id);
                    setTab("messages");
                  }}
                  style={{ background: "transparent", border: `1px solid ${PRIMARY}`, color: PRIMARY, borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  Message <MessageCircle size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div style={{ display: "flex", height: 560 }}>
          <div style={{ width: 230, borderRight: `1px solid ${BORDER}`, background: CARD, overflowY: "auto" }}>
            {matches.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", cursor: "pointer", background: selectedId === m.id ? PRIMARY_SOFT : "transparent", borderBottom: `1px solid ${BORDER}` }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                  {m.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(messages[m.id] || []).slice(-1)[0]?.text || "Say hello"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, background: CARD }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: selected.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                  {selected.initials}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selected.name}</div>
              </div>
              <button style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "6px 10px", fontSize: 12, color: INK, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Video size={13} /> Start call
              </button>
            </div>

            <div ref={scrollRef} className="ss-scroll" style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {thread.length === 0 && (
                <p style={{ color: MUTED, fontSize: 12.5, textAlign: "center", marginTop: 40 }}>
                  No messages yet — say hi to {selected.name.split(" ")[0]}.
                </p>
              )}
              {thread.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.from === "me" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                  <div style={{ background: msg.from === "me" ? PRIMARY : CARD, color: msg.from === "me" ? "#fff" : INK, border: msg.from === "me" ? "none" : `1px solid ${BORDER}`, borderRadius: 12, padding: "8px 12px", fontSize: 13, lineHeight: 1.4 }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 3, textAlign: msg.from === "me" ? "right" : "left" }}>{msg.time}</div>
                </div>
              ))}
              {typing && (
                <div style={{ alignSelf: "flex-start", color: MUTED, fontSize: 12, fontStyle: "italic" }}>
                  {selected.name.split(" ")[0]} is typing…
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, padding: 14, borderTop: `1px solid ${BORDER}`, background: CARD }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message"
                style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }}
              />
              <button onClick={sendMessage} style={{ background: PRIMARY, border: "none", borderRadius: 8, width: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Send">
                <Send size={15} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div style={{ padding: 28, maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: PRIMARY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
              Y
            </div>
            <div>
              <div className="ss-display" style={{ fontSize: 18, fontWeight: 700 }}>
                {profile.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                <Stars value={4.7} />
                <span style={{ fontSize: 12, color: MUTED }}>4.7 (12 reviews)</span>
              </div>
            </div>
          </div>

          {["offers", "wants"].map((kind) => (
            <div key={kind} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {kind === "offers" ? "You can teach" : "You want to learn"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile[kind].map((s) => (
                  <SkillTag key={s} label={s} onRemove={() => removeSkill(kind, s)} />
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginBottom: 30 }}>
            <select value={skillKind} onChange={(e) => setSkillKind(e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 12.5 }}>
              <option value="offers">I can teach</option>
              <option value="wants">I want to learn</option>
            </select>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill"
              style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 12.5, outline: "none" }}
            />
            <button onClick={addSkill} style={{ background: PRIMARY, border: "none", borderRadius: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Add skill">
              <Plus size={15} color="#fff" />
            </button>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Recent reviews
          </div>
          {[
            { from: "Maya Chen", text: "Patient teacher, explained guitar chords really clearly.", stars: 5 },
            { from: "Jonah Blake", text: "Great Photoshop session, learned a ton in 30 minutes.", stars: 4 },
          ].map((r, i) => (
            <div key={i} style={{ borderTop: i === 0 ? "none" : `1px solid ${BORDER}`, padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.from}</span>
                <Stars value={r.stars} />
              </div>
              <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0" }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
