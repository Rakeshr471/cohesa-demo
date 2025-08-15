import React, { useMemo, useRef, useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, ChevronLeft, ChevronRight, Coffee, Dumbbell, Filter, Heart, MessageCircle, Moon, Plus, Search, Settings, ShieldCheck, Sun, Users, X, BadgeCheck, Building2, Link2, ClipboardCopy, Image as ImageIcon, Camera, MapPin, Clock, Sparkles, ArrowRightLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";

// Cohesa – Pro Demo
// - Discover with swipe + keyboard support + interest filters
// - Mutual match required; calendar invite ONLY from Messages
// - Partners area: group chats + GC requests
// - HR Admin: approve GC requests, create events, generate onboarding links, and see analytics
// - Polished aesthetic, dark mode, micro-interactions

// ------------------------------
// THEME
const ThemeContext = createContext({ dark:false, toggle:()=>{} });
const useTheme = ()=> useContext(ThemeContext);

// ------------------------------
// GLOBAL APP STATE
const AppStateContext = createContext(null);
const useAppState = ()=> useContext(AppStateContext);

const initialMe = {
  name: "Alex Kim",
  role: "Analyst",
  team: "Global Markets",
  location: "200 West, NYC",
  photo: "https://i.pravatar.cc/160?img=15",
  school: "Columbia University",
  degree: "BS, Financial Engineering",
  gradYear: "2024",
  interests: ["Running","Coffee","Photography","Skiing"],
  prompts: [
    { q: "Two truths and a lie", a: "I ran a marathon, I roast my own beans, I've never left NYC." },
    { q: "My ideal lunch", a: "15-minute walk + deli + park bench." },
  ],
};

const baseCandidates = [
  { id:"1", name:"Jordan Patel", role:"Analyst", team:"IBD – TMT", location:"200 West, NYC", interests:["Coffee","Chess","Cooking"], bio:"New to TMT. Always down for espresso chats and weekend chess.", school:"NYU Stern", photo:"https://i.pravatar.cc/160?img=5" },
  { id:"2", name:"Sam Lee", role:"Associate", team:"Asset Management", location:"Jersey City", interests:["Running","Bouldering","Cooking"], bio:"Morning runner. Looking for a lunch buddy near the esplanade.", school:"Rutgers", photo:"https://i.pravatar.cc/160?img=7" },
  { id:"3", name:"Taylor Chen", role:"Analyst", team:"IBD – Industrials", location:"200 West, NYC", interests:["Photography","Reading","Coffee"], bio:"Street photo walks after work; coffee near Oculus?", school:"Cornell", photo:"https://i.pravatar.cc/160?img=12" },
  { id:"4", name:"Priya Shah", role:"VP", team:"IBD – Healthcare", location:"200 West, NYC", interests:["Tennis","Running","Travel"], bio:"Tennis on Sundays; friendly doubles welcome.", school:"Harvard", photo:"https://i.pravatar.cc/160?img=47" },
  { id:"5", name:"Chris Rivera", role:"Analyst", team:"Global Markets", location:"200 West, NYC", interests:["Gaming","Photography","Coffee"], bio:"Learning film photography; museum lunches?", school:"UChicago", photo:"https://i.pravatar.cc/160?img=22" },
];

function generateRandomProfile(id) {
  const names = ["Morgan Lee", "Jamie Carter", "Avery Brooks", "Riley Tran", "Casey Morgan", "Taylor Price"];
  const roles = ["Analyst", "Associate", "VP", "Director"];
  const teams = ["IBD – TMT", "IBD – Industrials", "Global Markets", "Asset Management", "Healthcare"];
  const locations = ["200 West, NYC", "Jersey City", "Chicago", "SF Office"];
  const interestsList = ["Running", "Coffee", "Photography", "Cooking", "Chess", "Tennis", "Travel", "Bouldering"];

  const name = names[Math.floor(Math.random()*names.length)];
  const role = roles[Math.floor(Math.random()*roles.length)];
  const team = teams[Math.floor(Math.random()*teams.length)];
  const location = locations[Math.floor(Math.random()*locations.length)];
  const interests = Array.from({length:3}, ()=> interestsList[Math.floor(Math.random()*interestsList.length)]);

  return {
    id: id.toString(),
    name,
    role,
    team,
    location,
    interests,
    bio: `Hi, I'm ${name}. Always happy to connect over coffee or events.`,
    school: "University of Example",
    photo: `https://i.pravatar.cc/160?img=${Math.floor(Math.random()*70)}`,
  };
}


function AppContainer({ children }){
  const [dark, setDark] = useState(false);
  useEffect(()=>{ document.documentElement.classList.toggle('dark', dark); },[dark]);
  const toggle = ()=> setDark(d=>!d);
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function App(){
  const [tab, setTab] = useState("employee");
  const [me, setMe] = useState(initialMe);

  // shared state for events and partner requests so Admin can modify them
  const [events, setEvents] = useState([
    { id: "e1", name: "NYC Coffee Crawl", when: "Thu 12:30 PM", location: "Tribeca", attendees: ["Alex Kim","Jordan Patel","Taylor Chen"], companySponsored: true },
    { id: "e2", name: "Tuesday 5k Run", when: "Tue 6:30 PM", location: "Hudson River Park", attendees: ["Sam Lee","Priya Shah"], companySponsored: false },
    { id: "e3", name: "Beginner Photography Walk", when: "Sat 10:00 AM", location: "Battery Park", attendees: ["Chris Rivera"], companySponsored: false },
  ]);

  const [groups, setGroups] = useState([
    { id: "g1", name: "Moms of analysts – NYC", members:["Dana","Riya","Mei"], mode:"In-person" },
    { id: "g2", name: "Remote partners peer chat", members:["Kyle","Asha","Luis","Sam"], mode:"Virtual" },
  ]);

  const [requests, setRequests] = useState([
    { id:"r1", topic:"Evening wellness circle – FiDi", mode:"In-person" },
    { id:"r2", topic:"Parents of first-years – Midtown", mode:"In-person" },
  ]);

  const store = {
    me, setMe,
    events, setEvents,
    groups, setGroups,
    requests, setRequests,
  };

  return (
    <AppContainer>
      <AppStateContext.Provider value={store}>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
          <Header tab={tab} setTab={setTab} />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {tab === "employee" && <EmployeeSwipeView />}
            {tab === "profile" && <ProfileView />}
            {tab === "partner" && <PartnerView />}
            {tab === "admin" && <AdminView />}
          </main>
          <Footer />
        </div>
      </AppStateContext.Provider>
    </AppContainer>
  );
}

function Header({ tab, setTab }){
  const { dark, toggle } = useTheme();

  // keyboard shortcuts for fast nav and swipe
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.altKey && e.key === '1') setTab('employee');
      if(e.altKey && e.key === '2') setTab('profile');
      if(e.altKey && e.key === '3') setTab('partner');
      if(e.altKey && e.key === '4') setTab('admin');
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[setTab]);

  return (
    <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200/70 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div className="font-semibold text-xl tracking-tight text-slate-800 dark:text-slate-100">Cohesa</div>
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">Goldman Sachs – Demo</span>
        </div>
          <nav className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabButton icon={<Users size={16}/>} active={tab === "employee"} onClick={()=>setTab("employee")}>Discover</TabButton>
          <TabButton icon={<BadgeCheck size={16}/>} active={tab === "profile"} onClick={()=>setTab("profile")}>My Profile</TabButton>
          <TabButton icon={<MessageCircle size={16}/>} active={tab === "partner"} onClick={()=>setTab("partner")}>Partners</TabButton>
          <TabButton icon={<Building2 size={16}/>} active={tab === "admin"} onClick={()=>setTab("admin")}>HR Admin</TabButton>
        </nav>
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:block text-[10px] px-2 py-1 rounded border bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-500">Alt+1–4</kbd>
          <button onClick={toggle} className="px-3 py-2 rounded-lg border text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" title="Toggle theme">
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
        </div>
      </div>
    </header>
  );
}

function LogoMark(){
  return (
    <svg width="34" height="34" viewBox="0 0 100 100" className="shrink-0">
      <defs>
        <linearGradient id="g1" x1="0" x2="1"><stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
        <linearGradient id="g2" x1="0" x2="1"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#fff" stroke="#e2e8f0" strokeWidth="4"/>
      <path d="M35 20 C25 32 22 45 22 55 c0 20 12 30 30 30 c-14 -10 -20 -24 -20 -40 c0 -9 1 -17 3 -25 z" fill="url(#g1)"/>
      <path d="M65 20 c2 8 3 16 3 25 c0 16 -6 30 -20 40 c18 0 30 -10 30 -30 c0 -10 -3 -23 -13 -35 z" fill="url(#g2)"/>
      <circle cx="50" cy="32" r="7" fill="#6366f1" />
    </svg>
  );
}

function TabButton({ active, onClick, children, icon }){
  return (
    <button onClick={onClick} className={"px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 "+(active?"bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-100":"text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 hover:shadow")}>{icon}{children}</button>
  );
}

// ------------------------------
// EMPLOYEE – SWIPE + MESSAGES-ONLY INVITES
function EmployeeSwipeView(){
  const { me, events, setEvents } = useAppState();

  const [filters, setFilters] = useState({ query:"", interests:new Set() });
  const candidateDeck = useMemo(()=>{
  let filtered = baseCandidates.filter(c=> {
    const q = filters.query.toLowerCase();
    const hitQ = !q || [c.name,c.role,c.team,c.location,c.school,c.bio].join(" ").toLowerCase().includes(q);
    const interestOk = filters.interests.size===0 || c.interests.some(i=> filters.interests.has(i));
    return hitQ && interestOk;
  });
  if (filtered.length < 5) {
    // Add random profiles until we have at least 10
    const needed = 10 - filtered.length;
    for (let i = 0; i < needed; i++) {
      filtered.push(generateRandomProfile(Date.now()+i));
    }
  }
  return filtered;
}, [filters]);
  // virtual infinite deck
  const [idx, setIdx] = useState(0);
  const current = candidateDeck[(idx % Math.max(candidateDeck.length,1))] || null;

  // messages thread only after mutual
  const [thread, setThread] = useState(null); // { with, matched, messages }
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);
  const [pendingName, setPendingName] = useState("");

  const like = useCallback(()=>{
  if(!current) return;
  setPendingName(current.name);
  setTimeout(()=>{
    setThread({ with: current, matched: true, messages: [ { from: current.name, text: "It’s a match! Want to grab lunch this week?" } ] });
    setPendingName("");
    setShowConnectionPopup(true); // trigger popup
  }, 600);
  setIdx(i=>i+1);
},[current]);


  const pass = useCallback(()=>{ setIdx(i=>i+1); },[]);

  // keyboard support for swipe
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.key === 'ArrowRight') like();
      if(e.key === 'ArrowLeft') pass();
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[like, pass]);

  const addToCalendar = (platform, e)=>{
    alert(`${platform} calendar: added ${e.name} (${e.when}) – stub`);
  };

  // Interests palette
  const allInterests = useMemo(()=> Array.from(new Set(baseCandidates.flatMap(c=>c.interests).concat(me.interests))).sort(),[me.interests]);

  return (
    <section className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <ProfileRibbon me={me} />
        <Card title="Discover colleagues" right={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500"><ChevronLeft size={14}/>Pass <span className="mx-1 text-slate-400">|</span> Connect<ChevronRight size={14}/></div>
          </div>
        }>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 flex items-center gap-2">
              <Search size={16} className="text-slate-400"/>
              <input className="flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Search by name, team, location" value={filters.query} onChange={(e)=> setFilters(f=>({...f, query:e.target.value})) }/>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400"/>
              <select className="flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" onChange={(e)=>{
                const v=e.target.value; setFilters(f=>({ ...f, interests: v? new Set([v]): new Set() }));
              }}>
                <option value="">All interests</option>
                {allInterests.map(i=> <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <SwipeCard person={current} me={me} onLeft={pass} onRight={like} />
            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-slate-500">Swipe endlessly · mutual matches only</div>
              <div className="flex gap-3">
                <GhostButton onClick={pass}><X size={16} className="mr-1"/>Pass</GhostButton>
                <PrimaryButton onClick={like}><Heart size={16} className="mr-1"/>Connect</PrimaryButton>
              </div>
            </div>
            {pendingName && (
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Waiting for {pendingName} to connect back…</div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <MessagesPanel thread={thread} setThread={setThread} />
        <Card title="Events (Goldman NYC)">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Calendar:</span>
              <select className="rounded-lg border px-2 py-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <option>Slack</option>
                <option>Teams</option>
              </select>
            </div>
            {events.map((e)=> (
              <div key={e.id} className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">{e.name} {e.companySponsored && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300">Company</span>}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-3"><Clock size={14}/> {e.when} <MapPin size={14}/> {e.location}</div>
                  </div>
                  <GhostButton onClick={()=>addToCalendar("Slack", e)}><Calendar size={16} className="mr-1"/>Add</GhostButton>
                </div>
                <div className="mt-2 text-sm"><span className="text-slate-500">Attendees:</span> {e.attendees.join(", ")}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {showConnectionPopup && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-emerald-500 to-sky-500 text-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold mb-2">🎉 New Connection!</h2>
          <p>You and {thread?.with?.name} are now connected on Cohesa.</p>
          <button
            onClick={()=>setShowConnectionPopup(false)}
            className="mt-4 px-4 py-2 rounded-lg bg-white text-emerald-600 font-medium hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    )}
    </section>
  );
}

function ProfileRibbon({ me }){
  const completion = useMemo(()=>{
    let filled = 0; const total = 8;
    [me.name, me.role, me.team, me.location, me.photo, me.school, me.degree, me.gradYear].forEach(v=> v && (filled++));
    return Math.round((filled/total)*100);
  },[me]);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4">
      <Avatar src={me.photo} name={me.name} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{me.name}</div>
        <div className="text-sm text-slate-500 truncate">{me.role} · {me.team} · {me.location}</div>
        <div className="mt-1 text-xs text-slate-500 truncate">{me.school} · {me.degree} ({me.gradYear})</div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${completion}%`}} />
        </div>
        <div className="text-[11px] text-slate-500 mt-1">Profile completeness {completion}%</div>
      </div>
    </div>
  );
}

function SwipeCard({ person, me, onLeft, onRight }){
  const ref = useRef(null);
  const pos = useRef({ x:0, y:0, dragging:false, startX:0, startY:0 });
  const onPointerDown = (e)=>{ pos.current.dragging=true; pos.current.startX=e.clientX; pos.current.startY=e.clientY; ref.current.setPointerCapture && ref.current.setPointerCapture(e.pointerId); };
  const onPointerMove = (e)=>{ if(!pos.current.dragging) return; const dx=e.clientX-pos.current.startX; const dy=e.clientY-pos.current.startY; pos.current.x=dx; pos.current.y=dy; ref.current.style.transform=`translate(${dx}px, ${dy}px) rotate(${dx/22}deg)`; };
  const onPointerUp = ()=>{ if(!pos.current.dragging) return; pos.current.dragging=false; const dx=pos.current.x; ref.current.style.transform=""; if(dx>120) onRight(); else if(dx<-120) onLeft(); };
  const overlap = person? person.interests.filter((i)=> me.interests.includes(i)) : [];

  return (
    <div className="relative select-none">
      <AnimatePresence mode="popLayout">
        {person ? (
         <motion.div key={person.id} ref={ref} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          style={{ touchAction: 'pan-y' }}
          initial={{ opacity:0, y:20, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20, scale:0.98 }} transition={{ type:'spring', stiffness:260, damping:22 }}
          className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 md:p-7"
>
            <div className="flex items-start gap-5">
              <Avatar name={person.name} src={person.photo} size="xl" />
              <div className="min-w-0">
                <div className="text-lg font-semibold leading-tight">{person.name}</div>
                <div className="text-sm text-slate-500">{person.role} · {person.team} · {person.location}</div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{person.bio}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{person.school}</span>
                  {overlap.length>0 ? overlap.map((i)=> (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">{i} • match</span>
                  )): <span className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">No shared interests yet</span>}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-slate-900/5 dark:ring-white/5"/>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-500">No candidates match your filters.</div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessagesPanel({ thread, setThread }){
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState("Slack");
  const [inviteTime, setInviteTime] = useState("Thu 12:30 PM");

  const send = () => { if(!thread||!input.trim()) return; const next={...thread, messages:[...thread.messages,{from:"You",text:input.trim()}]}; setThread(next); setInput(""); };
  const sendInvite = () => { if(!thread?.matched) return; alert(`${platform} invite created for ${inviteTime} with ${thread.with.name} (stub)`); };

  return (
    <Card title="Messages">
      {thread ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar name={thread.with.name} src={thread.with.photo} size="md" />
            <div className="font-medium">{thread.with.name}</div>
          </div>
          {!thread.matched && (
            <div className="text-xs text-slate-500">Waiting for mutual match…</div>
          )}
          <div className="max-h-[45vh] md:max-h-52 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 space-y-2">
            {thread.messages.map((m,i)=> (
              <div key={i} className={"text-sm "+(m.from==="You"?"text-slate-800 dark:text-slate-200":"text-slate-600 dark:text-slate-300")}> <span className="font-medium">{m.from}:</span> {m.text}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Write a message" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&send()} />
            <PrimaryButton onClick={send}><ArrowRightLeft size={16} className="mr-1"/>Send</PrimaryButton>
          </div>
          {/* Calendar invite lives ONLY here after mutual match */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <select value={platform} onChange={(e)=>setPlatform(e.target.value)} className="rounded-lg border px-2 py-2 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <option>Outlook</option>
              <option>Google Calendar</option>
            </select>
            <input value={inviteTime} onChange={(e)=>setInviteTime(e.target.value)} className="rounded-lg border px-2 py-2 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
            <SecondaryButton onClick={sendInvite}>
              {thread.matched ? `Send ${platform} calendar invite` : "Invite available after mutual match"}
            </SecondaryButton>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500">Connect with someone to start a conversation.</div>
      )}
    </Card>
  );
}

// ------------------------------
// PARTNERS – GROUP CHATS & REQUESTS
function PartnerView(){
  const { groups, setGroups, requests, setRequests } = useAppState();
  const [newName, setNewName] = useState("");
  const [newMode, setNewMode] = useState("Virtual");
  const createRequest = () => { if(!newName.trim()) return; setRequests((r)=>[{ id: `r${Date.now()}`, topic: newName, mode:newMode }, ...r]); setNewName(""); };
  const join = (id) => { alert(`Joined group ${id} (stub)`); };

  return (
    <section className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <Card title="Partner group chats">
          <div className="grid sm:grid-cols-2 gap-3">
            {groups.map((g)=> (
              <div key={g.id} className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4">
                <div className="font-medium">{g.name}</div>
                <div className="text-sm text-slate-500">{g.mode} · {g.members.length} members</div>
                <div className="mt-2 text-sm"><span className="text-slate-500">Members:</span> {g.members.join(", ")}</div>
                <div className="mt-3"><PrimaryButton onClick={()=>join(g.id)}><Users size={16} className="mr-1"/>Join GC</PrimaryButton></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <Card title="Request a new GC">
          <div className="flex flex-col gap-2">
            <input className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" placeholder="Topic (e.g., Dads of first-years – NYC)" value={newName} onChange={(e)=>setNewName(e.target.value)} />
            <select className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" value={newMode} onChange={(e)=>setNewMode(e.target.value)}>
              <option>Virtual</option>
              <option>In-person</option>
            </select>
            <PrimaryButton onClick={createRequest}><Plus size={16} className="mr-1"/>Submit request</PrimaryButton>
          </div>
        </Card>
        <Card title="Pending requests">
          <ul className="list-disc pl-5 text-sm space-y-1">
            {requests.map((r)=> (<li key={r.id}>{r.topic} <span className="text-slate-500">({r.mode})</span></li>))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

// ------------------------------
// PROFILE EDITOR
function ProfileView(){
  const { me, setMe } = useAppState();
  const [draft, setDraft] = useState({ ...me });
  const [photoPreview, setPhotoPreview] = useState(draft.photo);
  const update = (k, v) => setDraft((m)=> ({ ...m, [k]: v }));
  const onPhoto = (file) => { if(!file) return; const reader=new FileReader(); reader.onload=()=>{ setPhotoPreview(reader.result); update("photo", reader.result); }; reader.readAsDataURL(file); };
  const addPrompt = () => update("prompts", [...draft.prompts, { q: "", a: "" }]);
  const save = () => { setMe(draft); alert("Profile saved (demo)"); };

  return (
    <section className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card title="Profile photo">
          <div className="flex items-center gap-4">
            <Avatar src={photoPreview} name={draft.name} size="xl" />
            <label className="cursor-pointer px-3 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-2"><Camera size={16}/>Upload<input type="file" accept="image/*" className="hidden" onChange={(e)=> onPhoto(e.target.files?.[0]) } /></label>
          </div>
        </Card>
        <Card title="Education">
          <div className="grid gap-3">
            <Field label="School" value={draft.school} onChange={(v)=>update("school", v)} />
            <Field label="Degree" value={draft.degree} onChange={(v)=>update("degree", v)} />
            <Field label="Graduation year" value={draft.gradYear} onChange={(v)=>update("gradYear", v)} />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <Card title="About you">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Full name" value={draft.name} onChange={(v)=>update("name", v)} />
            <Field label="Role" value={draft.role} onChange={(v)=>update("role", v)} />
            <Field label="Team" value={draft.team} onChange={(v)=>update("team", v)} />
            <Field label="Location" value={draft.location} onChange={(v)=>update("location", v)} />
            <Field label="Interests (comma separated)" className="md:col-span-2" value={draft.interests.join(", ")} onChange={(v)=>update("interests", v.split(",").map(s=>s.trim()).filter(Boolean))} />
          </div>
        </Card>
        <Card title="Prompts (à la Hinge)">
          <div className="space-y-4">
            {draft.prompts.map((p, idx)=> (
              <div key={idx} className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4">
                <Field label="Prompt question" value={p.q} onChange={(v)=>{ const arr=[...draft.prompts]; arr[idx] = { ...arr[idx], q: v }; update("prompts", arr); }} />
                <Field label="Your answer" value={p.a} onChange={(v)=>{ const arr=[...draft.prompts]; arr[idx] = { ...arr[idx], a: v }; update("prompts", arr); }} />
              </div>
            ))}
            <SecondaryButton onClick={addPrompt}><Plus size={16} className="mr-1"/>Add another prompt</SecondaryButton>
            <div className="pt-2"><PrimaryButton onClick={save}><Check size={16} className="mr-1"/>Save profile</PrimaryButton></div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ------------------------------
// HR ADMIN – APPROVALS + EVENTS + LINKS + ANALYTICS
function AdminView(){
  const { requests, setRequests, groups, setGroups, events, setEvents } = useAppState();

  // Onboarding links
  const [links, setLinks] = useState([ tokenRow("Goldman – Summer Analysts"), tokenRow("Goldman – NYC IBD") ]);
  const [name, setName] = useState("");
  const [settings, setSettings] = useState({ slack:true, teams:true, sso:true });
  const create = () => { if(!name.trim()) return; setLinks((arr)=> [tokenRow(name), ...arr]); setName(""); };
  const copy = (t) => { navigator.clipboard?.writeText(t.url); alert("Onboarding link copied"); };

  // Event creation
  const [eName,setEName]=useState("");
  const [eWhen,setEWhen]=useState("");
  const [eLoc,setELoc]=useState("");
  const [company, setCompany]=useState(true);
  const createEvent = ()=>{
    if(!eName.trim()||!eWhen.trim()||!eLoc.trim()) return;
    setEvents(arr=> [{ id:`e${Date.now()}`, name:eName, when:eWhen, location:eLoc, attendees:[], companySponsored:company }, ...arr]);
    setEName(""); setEWhen(""); setELoc(""); setCompany(true);
  };

  // Approvals for partner group chat requests
  const approve = (id)=>{
    const req = requests.find(r=>r.id===id);
    if(!req) return; setGroups(g=> [{ id:`g${Date.now()}`, name:req.topic, members:[], mode:req.mode }, ...g]);
    setRequests(reqs=> reqs.filter(r=> r.id!==id));
  };
  const decline = (id)=> setRequests(reqs=> reqs.filter(r=> r.id!==id));

  // Dashboard KPIs and charts
  const kpis = useMemo(()=> ({
    employees: 100,
    partners: 64,
    connections: 326,
    matchRate: 0.76,
    activeGroups: groups.length,
    events: events.length,
    satisfactionDelta: 0.19,
    retentionLift: 0.06,
  }), [groups.length, events.length]);

  const matchTrend = [
    { m:"Apr", matches: 42 },{ m:"May", matches: 57 },{ m:"Jun", matches: 71 },{ m:"Jul", matches: 88 },{ m:"Aug", matches: 102 }
  ];

  const pieData = [
    { name:"In-person", value: events.filter(e=>e.companySponsored).length },
    { name:"Community-led", value: events.filter(e=>!e.companySponsored).length },
  ];

  return (
    <section className="space-y-6">
      <Card title="Pilot analytics" right={<span className="text-xs text-slate-500 flex items-center gap-1"><ShieldCheck size={14}/>Private</span>}>
        <div className="grid md:grid-cols-5 gap-4">
          <KPI label="# Employees" value={kpis.employees} />
          <KPI label="# Partners" value={kpis.partners} />
          <KPI label="# Connections" value={kpis.connections} />
          <KPI label="Match rate" value={`${Math.round(kpis.matchRate*100)}%`} />
          <KPI label="Active groups" value={kpis.activeGroups} />
          <KPI label="# Events" value={kpis.events} />
          <KPI label="Satisfaction delta" value={`+${Math.round(kpis.satisfactionDelta*100)} pts`} />
          <KPI label="Retention lift" value={`+${Math.round(kpis.retentionLift*100)}%`} />
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
            <div className="text-sm text-slate-500 mb-2">Matches over time</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matchTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m"/>
                  <YAxis/>
                  <RTooltip/>
                  <Line type="monotone" dataKey="matches" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
            <div className="text-sm text-slate-500 mb-2">Events mix</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={pieData} innerRadius={40} outerRadius={60} paddingAngle={4}>
                    {pieData.map((entry, index) => <Cell key={`c-${index}`} />)}
                  </Pie>
                  <RTooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
            <div className="text-sm text-slate-500 mb-2">Notes</div>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Calendar invites restricted to mutual matches in Messages.</li>
              <li>HR can approve partner GC requests and spin up groups instantly.</li>
              <li>Company events appear on employee Events panel in real time.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Approve partner GC requests" right={<span className="text-xs text-slate-500">{requests.length} pending</span>}>
        <div className="grid md:grid-cols-2 gap-3">
          {requests.length===0 && <div className="text-sm text-slate-500">No pending requests.</div>}
          {requests.map(r=> (
            <div key={r.id} className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4">
              <div className="font-medium">{r.topic}</div>
              <div className="text-sm text-slate-500">{r.mode}</div>
              <div className="mt-3 flex gap-2">
                <PrimaryButton onClick={()=>approve(r.id)}><Check size={16} className="mr-1"/>Approve</PrimaryButton>
                <GhostButton onClick={()=>decline(r.id)}><X size={16} className="mr-1"/>Decline</GhostButton>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Create company event">
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <Field label="Event name" value={eName} onChange={setEName} />
          <Field label="When" value={eWhen} onChange={setEWhen} />
          <Field label="Location" value={eLoc} onChange={setELoc} />
          <label className="flex items-center gap-2 text-sm mb-2 md:mb-0"><input type="checkbox" checked={company} onChange={(e)=>setCompany(e.target.checked)} /> Company sponsored</label>
          <div className="md:col-span-4"><PrimaryButton onClick={createEvent}><Calendar size={16} className="mr-1"/>Add event</PrimaryButton></div>
        </div>
      </Card>

      <Card title="Onboarding links">
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <label className="block">
            <div className="text-sm text-slate-700 dark:text-slate-200 mb-1">Campaign name</div>
            <input className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" placeholder="e.g., Goldman – New Analysts NYC" value={name} onChange={(e)=>setName(e.target.value)} />
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.slack} onChange={(e)=>setSettings({...settings, slack:e.target.checked})} /> Slack</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.teams} onChange={(e)=>setSettings({...settings, teams:e.target.checked})} /> Teams</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.sso} onChange={(e)=>setSettings({...settings, sso:e.target.checked})} /> SSO</label>
          </div>
          <div className=""><PrimaryButton onClick={create}><Link2 size={16} className="mr-1"/>Generate link</PrimaryButton></div>
        </div>
        <div className="mt-4 grid gap-3">
          {links.map((l)=> (
            <div key={l.token} className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{l.name}</div>
                <div className="text-xs text-slate-500 truncate">{l.url}</div>
              </div>
              <div className="flex items-center gap-2">
                <GhostButton onClick={()=>copy(l)}><ClipboardCopy size={16} className="mr-1"/>Copy link</GhostButton>
                <span className="text-xs text-slate-500">{l.claims} claims</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function tokenRow(name){
  const token = Math.random().toString(36).slice(2,10);
  return { name, token, claims: Math.floor(Math.random()*40)+5, url:`https://cohesa-demo.onboard/${token}` };
}

// ------------------------------
// UI PRIMITIVES
function Card({ title, children, right }){
  return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Sparkles size={16} className="text-emerald-500"/>{title}</h2>{right}</div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function KPI({ label, value }){ return (
  <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
  </div>
); }

function Field({ label, value, onChange, className }){
  return (
    <label className={"block "+(className||"")}>
      <div className="text-sm text-slate-700 dark:text-slate-200 mb-1">{label}</div>
      <input value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
    </label>
  );
}

function PrimaryButton({ children, onClick }){ return <button onClick={onClick} className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 text-white shadow hover:bg-emerald-700 flex items-center">{children}</button>; }
function SecondaryButton({ children, onClick }){ return <button onClick={onClick} className="min-h-[44px] px-4 py-2 rounded-xl border text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">{children}</button>; }
function GhostButton({ children, onClick }){ return <button onClick={onClick} className="min-h-[44px] px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 flex items-center">{children}</button>; }
function Avatar({ src, name, size="md" }){
  const sizes={ sm:28, md:36, lg:48, xl:64 }; const s=sizes[size]||36;
  if(src) return <img alt={name} src={src} style={{ width:s, height:s }} className="rounded-2xl object-cover border border-slate-200 dark:border-slate-700"/>;
  return (<div style={{ width:s, height:s }} className="rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-semibold border border-slate-200 dark:border-slate-700">{initials(name)}</div>);
}

function Footer(){
  return (
    <footer className="mt-12 pb-10 text-center text-xs text-slate-500">© Cohesa – private, secure, SSO-ready</footer>
  );
}

function initials(name){ return name.split(" ").map((n)=>n[0]).join(""); }
