import React, { useEffect, useMemo, useRef, useState } from "react";

// Cohesa – Forum+Events Deck (Sep 29 build)
// Changes in this build:
// • Events behave like matching: show ONE event card at a time with Pass / RSVP buttons.
//   - On RSVP: attendee added + modal pops up saying it's added to calendar.
// • Forum cleanup: users must JOIN a topic to see messages. Posts are anonymous.
//   - After you post, you (only you) see a private AI answer draft based on HR knowledge.
// • HR Admin can paste knowledge text AND upload .txt/.md files. AI suggestion scans both.
// • Maintaining prior matching (people swipes) and mutual-match modal.
// Design: TailwindCSS + React single-file demo; no persistence beyond in-memory.

export default function App() {
  const [route, setRoute] = useState("discover");
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <TopBar route={route} setRoute={setRoute} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        {route === "discover" && <DiscoverView />}
        {route === "profile" && <ProfileView />}
        {route === "forum" && <ForumView />}
        {route === "admin" && <AdminView />}
      </main>
      <Footer />
    </div>
  );
}

function TopBar({ route, setRoute }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Cohesa</span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">Goldman – demo</span>
        </div>
        <nav className="flex items-center gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
          <NavTab onClick={() => setRoute("discover")} active={route === "discover"}>Discover</NavTab>
          <NavTab onClick={() => setRoute("profile")} active={route === "profile"}>My Profile</NavTab>
          <NavTab onClick={() => setRoute("forum")} active={route === "forum"}>Forum</NavTab>
          <NavTab onClick={() => setRoute("admin")} active={route === "admin"}>HR Admin</NavTab>
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/90">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#g)" opacity="0.2" />
      <path d="M7 5c-2 2.2-3 4.6-3 7 0 4.6 3.4 8 8 8-3.9-2.7-6-6.4-6-11 0-1.5.2-2.7 1-4Z" fill="#60a5fa" opacity=".85" />
      <path d="M17 5c.8 1.3 1 2.5 1 4 0 4.6-2.1 8.3-6 11 4.6 0 8-3.4 8-8 0-2.4-1-4.8-3-7Z" fill="#34d399" opacity=".85" />
      <circle cx="12" cy="8.5" r="1.6" fill="#f59e0b" />
    </svg>
  );
}

function NavTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
        active ? "bg-white text-neutral-900 shadow" : "text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ---------- In-memory demo store ----------
const store = {
  me: {
    name: "Alex Kim",
    role: "Analyst",
    team: "Global Markets",
    location: "200 West, NYC",
    photo: "https://i.pravatar.cc/160?img=15",
    school: "Columbia University",
    degree: "BS, Financial Engineering",
    gradYear: "2024",
    interests: ["Running", "Coffee", "Photography", "Skiing"],
    prompts: [
      { q: "Two truths and a lie", a: "I ran a marathon; I roast my own beans; I've never left NYC." },
      { q: "My ideal lunch", a: "15-minute walk + deli + park bench." },
    ],
  },
  forum: {
    topics: [
      { id: "t1", name: "Benefits & Open Enrollment", members: new Set(["Alex Kim"]), messages: [
        { id: "m1", from: "Anonymous", text: "When do dental benefits kick in if I join mid-month?" },
      ]},
      { id: "t2", name: "NYC Office Logistics", members: new Set(), messages: [] },
    ],
    pendingChatRequests: [
      { id: "r1", topic: "Quiet rooms – 200 West" },
    ],
  },
  // HR knowledge base + uploaded docs
  hrKB: "Benefits: medical/dental start day-1; commuter stipend; mental health sessions available via EAP. PTO: accrues monthly; carryover limits apply. Facilities: Quiet rooms on 9F & 23F.",
  hrDocs: [], // <-- JS (no TS assertion)
};

// ---------- Discover (people swipes + messages + events deck) ----------
function DiscoverView() {
  const [me] = useState(store.me);
  const candidates = useMemo(
    () => [
      { id: "1", name: "Jordan Patel", role: "Analyst", team: "IBD – TMT", location: "200 West, NYC", interests: ["Coffee", "Chess", "Cooking"], bio: "New to TMT. Espresso chats & weekend chess.", school: "NYU Stern", photo: "https://i.pravatar.cc/160?img=5" },
      { id: "2", name: "Sam Lee", role: "Associate", team: "Asset Management", location: "Jersey City", interests: ["Running", "Bouldering", "Cooking"], bio: "Morning runner. Lunch buddy near the esplanade?", school: "Rutgers", photo: "https://i.pravatar.cc/160?img=7" },
      { id: "3", name: "Taylor Chen", role: "Analyst", team: "IBD – Industrials", location: "200 West, NYC", interests: ["Photography", "Reading", "Coffee"], bio: "Street photo walks; coffee near Oculus?", school: "Cornell", photo: "https://i.pravatar.cc/160?img=12" },
      { id: "4", name: "Priya Shah", role: "VP", team: "IBD – Healthcare", location: "200 West, NYC", interests: ["Tennis", "Running", "Travel"], bio: "Tennis on Sundays; friendly doubles.", school: "Harvard", photo: "https://i.pravatar.cc/160?img=47" },
      { id: "5", name: "Chris Rivera", role: "Analyst", team: "Global Markets", location: "200 West, NYC", interests: ["Gaming", "Photography", "Coffee"], bio: "Learning film; museum lunches?", school: "UChicago", photo: "https://i.pravatar.cc/160?img=22" },
    ],
    []
  );
  const [idx, setIdx] = useState(0);
  const current = candidates[idx % candidates.length];
  const [thread, setThread] = useState(null); // { with, matched, messages }
  const [pending, setPending] = useState("");
  const [matchModal, setMatchModal] = useState(null); // person

  const swipe = (dir) => {
    if (dir === "right") {
      setPending(current.name);
      setTimeout(() => {
        const match = true; // MVP: always mutual
        if (match) {
          setThread({ with: current, matched: true, messages: [{ from: current.name, text: "It’s a match! Grab lunch this week?" }] });
          setMatchModal(current);
        }
        setPending("");
      }, 500);
    }
    setIdx((n) => n + 1);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-4">
        <GlassCard title="Discover colleagues">
          <SwipeCard person={current} me={me} onLeft={() => swipe("left")} onRight={() => swipe("right")} />
          <div className="mt-5 flex items-center justify-between text-sm">
            <p className="text-white/60">Unlimited swipes · mutual matches only</p>
            <div className="flex gap-2">
              <Ghost onClick={() => swipe("left")}>Pass</Ghost>
              <Primary onClick={() => swipe("right")}>Connect</Primary>
            </div>
          </div>
          {pending && <p className="mt-3 text-xs text-white/60">Waiting for {pending}…</p>}
        </GlassCard>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <MessagesPanel thread={thread} setThread={setThread} />
        <EventsDeck me={me} />
      </div>

      {matchModal && (
        <MatchModal person={matchModal} onClose={() => setMatchModal(null)} />
      )}
    </section>
  );
}

function SwipeCard({ person, me, onLeft, onRight }) {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0, dragging: false, sx: 0, sy: 0 });
  const onDown = (e) => {
    pos.current.dragging = true;
    pos.current.sx = e.clientX;
    pos.current.sy = e.clientY;
    ref.current?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!pos.current.dragging) return;
    const dx = e.clientX - pos.current.sx;
    const dy = e.clientY - pos.current.sy;
    pos.current.x = dx;
    pos.current.y = dy;
    ref.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 22}deg)`;
  };
  const onUp = () => {
    if (!pos.current.dragging) return;
    pos.current.dragging = false;
    const dx = pos.current.x;
    ref.current.style.transform = "";
    if (dx > 120) onRight();
    else if (dx < -120) onLeft();
  };

  const overlap = person.interests.filter((i) => me.interests.includes(i));

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      className="relative select-none rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.06)]"
    >
      <div className="flex items-start gap-5">
        <Avatar src={person.photo} name={person.name} size="xl" />
        <div className="min-w-0">
          <div className="text-xl font-semibold leading-tight">{person.name}</div>
          <div className="text-sm text-white/60">{person.role} · {person.team} · {person.location}</div>
          <p className="mt-3 text-white/80">{person.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag>{person.school}</Tag>
            {overlap.length > 0 ? (
              overlap.map((i) => (
                <Tag key={i} tone="match">{i} • match</Tag>
              ))
            ) : (
              <Tag>No shared interests yet</Tag>
            )}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />
    </div>
  );
}

function MatchModal({ person, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl">
        <div className="text-2xl font-semibold">It’s a match!</div>
        <div className="mt-2 text-white/70">You and {person.name} liked each other.</div>
        <div className="mt-5 flex items-center justify-center gap-6">
          <Avatar src={store.me.photo} name={store.me.name} size="xl" />
          <span className="text-white/40">×</span>
          <Avatar src={person.photo} name={person.name} size="xl" />
        </div>
        <div className="mt-6">
          <Primary onClick={onClose}>Start chatting</Primary>
        </div>
      </div>
    </div>
  );
}

function MessagesPanel({ thread, setThread }) {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState("Slack");
  const [when, setWhen] = useState("Thu 12:30 PM");

  const send = () => {
    if (!thread || !input.trim()) return;
    setThread({ ...thread, messages: [...thread.messages, { from: "You", text: input.trim() }] });
    setInput("");
  };
  const invite = () => {
    if (!thread?.matched) return;
    alert(`${platform} invite created for ${when} with ${thread.with.name} (stub)`);
  };

  return (
    <GlassCard title="Messages">
      {thread ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar name={thread.with.name} src={thread.with.photo} size="md" />
            <div className="font-medium">{thread.with.name}</div>
          </div>
          {!thread.matched && <div className="text-xs text-white/60">Waiting for mutual match…</div>}
          <div className="max-h-56 overflow-auto rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
            {thread.messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.from === "You" ? "text-white" : "text-white/80"}`}>
                <span className="font-medium">{m.from}:</span> {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400/40"
              placeholder="Write a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Primary onClick={send}>Send</Primary>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-2 text-sm">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-lg border border-white/10 bg-neutral-900 px-2 py-2">
              <option>Slack</option>
              <option>Teams</option>
            </select>
            <input value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-lg border border-white/10 bg-neutral-900 px-2 py-2" />
            <Secondary onClick={invite}>
              {thread.matched ? `Send ${platform} calendar invite` : "Invite available after mutual match"}
            </Secondary>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/60">Connect with someone to start a conversation.</p>
      )}
    </GlassCard>
  );
}

// NEW: EventsDeck – single-card events with Pass / RSVP + modal
function EventsDeck({ me }) {
  const [platform, setPlatform] = useState("Slack");
  const [events, setEvents] = useState([
    { id: "e1", name: "NYC Coffee Crawl", when: "Thu 12:30 PM", location: "Tribeca", attendees: ["Alex Kim", "Jordan Patel", "Taylor Chen"] },
    { id: "e2", name: "Tuesday 5k Run", when: "Tue 6:30 PM", location: "Hudson River Park", attendees: ["Sam Lee", "Priya Shah"] },
    { id: "e3", name: "Beginner Photography Walk", when: "Sat 10:00 AM", location: "Battery Park", attendees: ["Chris Rivera"] },
  ]);
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (text) => {
    setToast({ text });
    setTimeout(() => setToast(null), 1600);
  };

  const current = events.length ? events[idx % events.length] : null;

  const next = () => setIdx((n) => n + 1);

  const onPass = () => {
    next();
  };

  const addToCalendar = (e) => alert(`${platform} calendar: added ${e.name} (${e.when}) – stub`);

  const onRSVP = () => {
    if (!current) return;
    setEvents((arr) =>
      arr.map((ev) => (ev.id === current.id && !ev.attendees.includes(me.name) ? { ...ev, attendees: [...ev.attendees, me.name] } : ev))
    );
    addToCalendar(current);
    showToast(`Added to your ${platform} calendar`);
    next();
  };

  return (
    <GlassCard title="Events (Goldman NYC)">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/60">Calendar:</span>
          <select value={platform} onChange={(ev) => setPlatform(ev.target.value)} className="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1">
            <option>Slack</option>
            <option>Teams</option>
          </select>
        </div>
        {current ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-lg font-semibold">{current.name}</div>
            <div className="text-sm text-white/60">{current.when} · {current.location}</div>
            <div className="mt-2 text-sm"><span className="text-white/60">Attendees:</span> {current.attendees.join(", ")}</div>
            <div className="mt-4 flex items-center justify-between">
              <Ghost onClick={onPass}>Pass</Ghost>
              <Primary onClick={onRSVP}>RSVP</Primary>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/60">No more events.</div>
        )}
        {toast && (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-center text-sm text-emerald-200">
            {toast.text}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ---------- Forum (Community Q&A with join-gate + private AI answer) ----------
function ForumView() {
  const me = store.me;
  const [topics, setTopics] = useState([...store.forum.topics]);
  const [active, setActive] = useState(topics[0]?.id || null);
  const [joined, setJoined] = useState(new Set([...topics.filter(t => t.members.has(me.name)).map(t => t.id)]));
  const [question, setQuestion] = useState("");
  const [newReq, setNewReq] = useState("");
  const [privateAI, setPrivateAI] = useState(null); // visible only immediately after your post

  useEffect(() => { setPrivateAI(null); }, [active]);

  const join = (id) => {
    setJoined((prev) => new Set(prev).add(id));
    setTopics((arr) => arr.map((t) => (t.id === id ? { ...t, members: new Set(t.members).add(me.name) } : t)));
  };

  const post = () => {
    if (!question.trim() || !active || !joined.has(active)) return;
    const msg = { id: `m${Date.now()}`, from: "Anonymous", text: question.trim() };
    setTopics((arr) => arr.map((t) => (t.id === active ? { ...t, messages: [...t.messages, msg] } : t)));
    // Private AI suggestion shown ONLY to you right after posting
    const answer = aiSuggest(question.trim(), store.hrKB, store.hrDocs);
    if (answer) setPrivateAI(answer);
    setQuestion("");
  };

  const requestChat = () => {
    if (!newReq.trim()) return;
    store.forum.pendingChatRequests.unshift({ id: `r${Math.random().toString(36).slice(2,8)}`, topic: newReq.trim() });
    alert("Chat request submitted for HR approval (anonymous)");
    setNewReq("");
  };

  const current = topics.find((t) => t.id === active);
  const hasJoined = current && joined.has(current.id);

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-4">
        <GlassCard title="Forum topics">
          <div className="grid gap-2">
            {topics.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left ${active===t.id?"border-emerald-400/30 bg-emerald-400/10":"border-white/10 bg-white/5"}`}>
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="text-xs text-white/50">{t.members.size} members · {t.messages.length} posts</div>
                </div>
                {joined.has(t.id) ? (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">Joined</span>
                ) : (
                  <Secondary onClick={(e)=>{e.stopPropagation(); join(t.id);}}>Join</Secondary>
                )}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Request a new group chat (HR approval)">
          <div className="flex flex-col gap-2">
            <input className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2" placeholder="Topic (e.g., Parents @ NYC)" value={newReq} onChange={(e)=>setNewReq(e.target.value)} />
            <Primary onClick={requestChat}>Submit anonymous request</Primary>
            <div className="text-xs text-white/50">HR will see only the topic text, not who requested it.</div>
          </div>
        </GlassCard>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <GlassCard title={current ? current.name : "Select a topic"}>
          {current ? (
            <div className="space-y-4">
              <div className={`relative max-h-72 overflow-auto rounded-2xl border border-white/10 p-3 ${hasJoined?"bg-white/5":"bg-white/[0.03]"}`}>
                {!hasJoined && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-sm text-white/70">
                    Join this topic to view messages
                  </div>
                )}
                {current.messages.length===0 && (
                  <div className="text-sm text-white/50">No posts yet. Join and ask the first question.</div>
                )}
                {hasJoined && current.messages.map((m)=> (
                  <div key={m.id} className="mb-3">
                    <div className="text-xs text-white/50">{m.from}</div>
                    <div className="text-sm">{m.text}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <textarea
                  disabled={!hasJoined}
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 p-3 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-50"
                  rows={3}
                  placeholder={hasJoined ? "Ask a question anonymously" : "Join this topic to post"}
                  value={question}
                  onChange={(e)=>setQuestion(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Posts are anonymous. After posting, you’ll see a private AI answer based on HR knowledge.</div>
                  <Primary onClick={post}>Post</Primary>
                </div>
                {privateAI && (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
                    <div className="mb-1 text-xs uppercase tracking-wide">Private AI answer (only you can see this)</div>
                    {privateAI}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/60">Pick a topic on the left.</p>
          )}
        </GlassCard>
      </div>
    </section>
  );
}

// Improved AI: scan hrKB and uploaded hrDocs for relevant sentences
function aiSuggest(question, kb, docs) {
  const textBlobs = [kb || "", ...(docs || []).map(d => d.text || "")].filter(Boolean);
  if (textBlobs.length === 0) return null;
  const q = question.toLowerCase();
  const keyTerms = Array.from(new Set(q.split(/[^a-z0-9]+/).filter(Boolean)));
  let best = null;
  for (const blob of textBlobs) {
    const sentences = blob.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      const low = s.toLowerCase();
      let score = 0;
      for (const term of keyTerms) if (low.includes(term)) score += term.length >= 4 ? 2 : 1;
      if (/benefit|pto|leave|policy|insurance|room|quiet|stipend|enroll|deadline|calendar|event/i.test(low)) score += 1.5;
      if (score > 0 && (!best || score > best.score)) best = { sent: s.trim(), score };
    }
  }
  if (!best) return null;
  return best.sent.length > 400 ? best.sent.slice(0, 397) + "…" : best.sent;
}

// ---------- Profile ----------
function ProfileView() {
  const [me, setMe] = useState({ ...store.me });
  const [photoPreview, setPhotoPreview] = useState(me.photo);
  const update = (k, v) => setMe((m) => ({ ...m, [k]: v }));
  const onPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      update("photo", reader.result);
    };
    reader.readAsDataURL(file);
  };
  const addPrompt = () => update("prompts", [...me.prompts, { q: "", a: "" }]);
  const save = () => {
    Object.assign(store.me, me);
    alert("Profile saved (demo)");
  };

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-4">
        <GlassCard title="Profile photo">
          <div className="flex items-center gap-4">
            <Avatar src={photoPreview} name={me.name} size="xl" />
            <label className="cursor-pointer rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600">
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          </div>
        </GlassCard>
        <GlassCard title="Education">
          <div className="grid gap-3">
            <Field label="School" value={me.school} onChange={(v) => update("school", v)} />
            <Field label="Degree" value={me.degree} onChange={(v) => update("degree", v)} />
            <Field label="Graduation year" value={me.gradYear} onChange={(v) => update("gradYear", v)} />
          </div>
        </GlassCard>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <GlassCard title="About you">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Full name" value={me.name} onChange={(v) => update("name", v)} />
            <Field label="Role" value={me.role} onChange={(v) => update("role", v)} />
            <Field label="Team" value={me.team} onChange={(v) => update("team", v)} />
            <Field label="Location" value={me.location} onChange={(v) => update("location", v)} />
            <Field
              label="Interests (comma separated)"
              className="md:col-span-2"
              value={me.interests.join(", ")}
              onChange={(v) => update("interests", v.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </div>
        </GlassCard>
        <GlassCard title="Prompts (à la Hinge)">
          <div className="space-y-4">
            {me.prompts.map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Field label="Prompt question" value={p.q} onChange={(v) => { const arr = [...me.prompts]; arr[idx] = { ...arr[idx], q: v }; update("prompts", arr); }} />
                <Field label="Your answer" value={p.a} onChange={(v) => { const arr = [...me.prompts]; arr[idx] = { ...arr[idx], a: v }; update("prompts", arr); }} />
              </div>
            ))}
            <Secondary onClick={addPrompt}>Add another prompt</Secondary>
            <div className="pt-2"><Primary onClick={save}>Save profile</Primary></div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

// ---------- Admin ----------
function AdminView() {
  const [links, setLinks] = useState([tokenRow("Goldman – Summer Analysts"), tokenRow("Goldman – NYC IBD")]);
  const [name, setName] = useState("");
  const [settings, setSettings] = useState({ slack: true, teams: true, sso: true });
  const [kb, setKb] = useState(store.hrKB);
  const [pending, setPending] = useState([...store.forum.pendingChatRequests]);
  const [uploads, setUploads] = useState(store.hrDocs);

  const create = () => {
    if (!name.trim()) return;
    setLinks((arr) => [tokenRow(name), ...arr]);
    setName("");
  };
  const copy = (t) => { navigator.clipboard?.writeText(t.url); alert("Onboarding link copied"); };

  const kpis = useMemo(
    () => ({ employees: 100, connections: 326, matchRate: 0.76, activeGroups: store.forum.topics.length, events: 41, satisfactionDelta: 0.19, retentionLift: 0.06 }),
    []
  );

  const approve = (id) => {
    const req = pending.find((r) => r.id === id);
    if (!req) return;
    const newTopic = { id: `t${Math.random().toString(36).slice(2,8)}`, name: req.topic, members: new Set(), messages: [] };
    store.forum.topics.push(newTopic);
    setPending((p) => p.filter((x) => x.id !== id));
    alert(`Approved and created forum topic: ${req.topic}`);
  };
  const reject = (id) => setPending((p) => p.filter((x) => x.id !== id));

  const saveKB = () => { store.hrKB = kb; alert("HR knowledge saved for AI suggestions"); };

  const onUpload = async (files) => {
    if (!files) return;
    const acceptedExt = [".txt", ".md"]; // simple demo parser
    for (const f of Array.from(files)) {
      const lower = f.name.toLowerCase();
      if (!acceptedExt.some(ext => lower.endsWith(ext))) {
        alert(`Unsupported file (demo accepts .txt/.md): ${f.name}`);
        continue;
      }
      const text = await f.text();
      const row = { name: f.name, text };
      store.hrDocs.push(row);
    }
    setUploads([...store.hrDocs]);
    alert("Files uploaded to HR knowledge (demo)");
  };

  return (
    <section className="space-y-6">
      <GlassCard title="Pilot analytics">
        <div className="grid gap-4 md:grid-cols-5">
          <KPI label="# Employees" value={kpis.employees} />
          <KPI label="# Connections" value={kpis.connections} />
          <KPI label="Match rate" value={`${Math.round(kpis.matchRate * 100)}%`} />
          <KPI label="Active forum topics" value={store.forum.topics.length} />
          <KPI label="# Events" value={kpis.events} />
          <KPI label="Satisfaction delta" value={`+${Math.round(kpis.satisfactionDelta * 100)} pts`} />
          <KPI label="Retention lift" value={`+${Math.round(kpis.retentionLift * 100)}%`} />
        </div>
      </GlassCard>

      <GlassCard title="Onboarding links">
        <div className="grid items-end gap-3 md:grid-cols-3">
          <label className="block">
            <div className="mb-1 text-sm text-white/80">Campaign name</div>
            <input className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2" placeholder="e.g., Goldman – New Analysts NYC" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.slack} onChange={(e) => setSettings({ ...settings, slack: e.target.checked })} /> Slack</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.teams} onChange={(e) => setSettings({ ...settings, teams: e.target.checked })} /> Teams</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.sso} onChange={(e) => setSettings({ ...settings, sso: e.target.checked })} /> SSO</label>
          </div>
          <div><Primary onClick={create}>Generate link</Primary></div>
        </div>
        <div className="mt-4 grid gap-3">
          {links.map((l) => (
            <div key={l.token} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="min-w-0">
                <div className="truncate font-medium">{l.name}</div>
                <div className="truncate text-xs text-white/60">{l.url}</div>
              </div>
              <div className="flex items-center gap-2">
                <Ghost onClick={() => copy(l)}>Copy link</Ghost>
                <span className="text-xs text-white/60">{l.claims} claims</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="HR knowledge for AI (paste text or upload files)">
        <div className="space-y-3">
          <textarea value={kb} onChange={(e)=>setKb(e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-neutral-900 p-3 text-sm" placeholder="Paste benefits, policies, locations, etc." />
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">
                Upload .txt/.md
                <input type="file" accept=".txt,.md" className="hidden" multiple onChange={(e)=>onUpload(e.target.files)} />
              </label>
              <span className="text-white/50">{uploads.length} file(s) in knowledge</span>
            </div>
            <Primary onClick={saveKB}>Save knowledge</Primary>
          </div>
          <div className="text-xs text-white/50">Forum AI searches pasted text and uploaded files. It does not reveal employee identities.</div>
        </div>
      </GlassCard>

      <GlassCard title="Pending group chat requests">
        {pending.length === 0 ? (
          <div className="text-sm text-white/60">No pending requests.</div>
        ) : (
          <div className="grid gap-2">
            {pending.map((r)=> (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="font-medium">{r.topic}</div>
                  <div className="text-xs text-white/50">Requester: Hidden (anonymous)</div>
                </div>
                <div className="flex gap-2">
                  <Primary onClick={()=>approve(r.id)}>Approve</Primary>
                  <Ghost onClick={()=>reject(r.id)}>Reject</Ghost>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </section>
  );
}

function tokenRow(name) {
  const token = Math.random().toString(36).slice(2, 10);
  return { name, token, claims: Math.floor(Math.random() * 40) + 5, url: `https://cohesa-demo.onboard/${token}` };
}

// ---------- Primitives ----------
function GlassCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,.06)]">
      {title && (
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">{title}</h2></div>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, className }) {
  return (
    <label className={`block ${className || ""}`}>
      <div className="mb-1 text-sm text-white/80">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400/40"
      />
    </label>
  );
}

function Primary({ children, onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl bg-emerald-400 px-4 py-2 font-medium text-neutral-900 shadow hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50">{children}</button>
  );
}
function Secondary({ children, onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10">{children}</button>
  );
}
function Ghost({ children, onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white hover:bg-white/5">{children}</button>
  );
}

function Tag({ children, tone }) {
  const cls = tone === "match" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/5 text-white/80";
  return <span className={`rounded-full border px-2 py-1 text-xs ${cls}`}>{children}</span>;
}

function Avatar({ src, name, size = "md" }) {
  const sizes = { sm: 28, md: 36, lg: 48, xl: 64 };
  const s = sizes[size] || 36;
  if (src) return <img alt={name} src={src} style={{ width: s, height: s }} className="rounded-2xl border border-white/10 object-cover" />;
  return (
    <div style={{ width: s, height: s }} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 font-semibold text-white/90">
      {initials(name)}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-12 text-center text-xs text-white/50">
      © Cohesa · private, secure, SSO-ready
    </footer>
  );
}

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}
