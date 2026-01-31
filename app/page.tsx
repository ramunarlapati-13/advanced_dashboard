"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity, Users, FileText, Settings, Download, Search, Bell,
  MapPin, Shield, Smartphone, Globe, Clock, AlertCircle, RefreshCw, Archive,
  PieChart, Database, ChevronLeft, Menu, LogOut, LayoutGrid, Layers
} from "lucide-react";
import UserDirectory from "@/components/UserDirectory";
import clsx from "clsx";
import { collection, getDocs } from "firebase/firestore";
import { db, rtdb } from "@/lib/firebase/config";
import { ref, get } from "firebase/database";
// import { auth } from "@/lib/firebase/config";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("core");
  const [activeProject, setActiveProject] = useState("academy"); // 'academy' | 'zestfolio'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    // Dynamic import to avoid SSR issues with Auth
    import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
      // We need 'app' instance if not using the default singleton, 
      // but typically getAuth() works if initialized.
      // However, to be safe let's import the specific auth instance from config if possible,
      // OR just use getAuth(app) if we import app. 
      // Let's rely on our config file's auth export if we can, or just standard SDK.
      import("@/lib/firebase/config").then(({ default: app }) => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setAuthLoading(false);
        });
        return () => unsubscribe();
      });
    });
  }, []);

  const handleLogin = async () => {
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { default: app } = await import("@/lib/firebase/config");
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed", e);
      alert("Login failed: " + e);
    }
  };

  const handleLogout = async () => {
    const { getAuth } = await import("firebase/auth");
    const { default: app } = await import("@/lib/firebase/config");
    await getAuth(app).signOut();
  };

  // Redirect if not authenticated (Side Effect)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Loading State (covers both initial load and redirecting)
  if (authLoading || !user) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">INITIALIZING SECURITY...</div>;
  }

  const renderContent = () => {
    // 1. ZESTFOLIO VIEW
    if (activeProject === 'zestfolio') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-12 glass-panel rounded-xl border border-white/5">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-pink-900/20">
            <Database size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Zestfolio Configuration</h3>
          <p className="text-gray-400 max-w-md mb-8">
            This module is currently being initialized. Connect your portfolio data sources here.
          </p>
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-mono text-sm transition-colors border border-white/10">
            START SETUP
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return <RealUserList />;
      case "content":
        return <ContentCMS />;
      case "core":
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Zest Active Users" value="1,248" trend="+12%" color="blue" />
              <StatCard label="Total Databases" value="4" color="purple" />
              <StatCard label="Security Alerts" value="0" color="green" />
              <StatCard label="Zest Storage" value="45%" color="orange" />
            </div>

            {/* Main Chart Area */}
            <div className="h-96 glass-panel rounded-xl p-6 mb-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-50 font-mono text-xs text-blue-400">ZEST_ANALYTICS_ENGINE // LIVE</div>
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 font-mono gap-4">
                <Activity className="w-16 h-16 text-white/10" />
                <p>[ ZEST REAL-TIME TRAFFIC VISUALIZATION ]</p>
                <p className="text-xs text-gray-700">Waiting for database connection stream...</p>
              </div>
            </div>

            <div className="mb-8">
              <UserDirectory />
            </div>

            <div className="grid grid-cols-3 gap-6">

              <div className="col-span-2 glass-panel rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                  <span>Zest Activity Feed</span>
                  <button className="text-xs text-blue-400 hover:text-blue-300">VIEW ALL</button>
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
                          ZEST
                        </div>
                        <div>
                          <div className="text-sm text-white">Database Node Sync</div>
                          <div className="text-xs text-gray-500 font-mono">shard_{i}992 successfully replicated</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">1{i}m ago</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4">Zest System Status</h3>
                <div className="space-y-3 font-mono text-xs">
                  <StatusItem label="Zest Core DB" status="Connected" color="text-green-400" />
                  <StatusItem label="Auth Service" status="Online" color="text-green-400" />
                  <StatusItem label="Ledger Sync" status="Processing" color="text-yellow-400" />
                  <StatusItem label="Hardware Lock" status="Engaged" color="text-blue-400" />
                  <StatusItem label="Encryption" status="AES-256" color="text-purple-400" />
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:relative z-20 h-screen bg-[#111] border-r border-white/5 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold">Z</div>
              <span className="font-bold tracking-tight">ZEST ADMIN</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400">
            {isSidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {/* Project Selection in Sidebar */}
          <div className="space-y-2">
            <div className={clsx("text-xs font-mono text-gray-500 uppercase px-3", !isSidebarOpen && "hidden")}>
              Projects
            </div>
            <NavItem
              icon={<Globe size={20} />}
              label="Zest Academy"
              active={activeProject === 'academy'}
              onClick={() => setActiveProject('academy')}
              collapsed={!isSidebarOpen}
            />
            <NavItem
              icon={<Archive size={20} />}
              label="Zestfolio"
              active={activeProject === 'zestfolio'}
              onClick={() => setActiveProject('zestfolio')}
              collapsed={!isSidebarOpen}
            />
          </div>

          {/* Sub-Navigation (Only for Academy) */}
          {activeProject === 'academy' && (
            <div className="space-y-2">
              <div className={clsx("text-xs font-mono text-gray-500 uppercase px-3 mt-6", !isSidebarOpen && "hidden")}>
                Academy Modules
              </div>
              <NavItem icon={<PieChart size={20} />} label="Overview" active={activeTab === 'core'} onClick={() => setActiveTab('core')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Database size={20} />} label="Databases" active={activeTab === 'users' || activeTab === 'content'} onClick={() => setActiveTab('users')} collapsed={!isSidebarOpen} />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-xs overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="avi" /> : user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.displayName || "Admin"}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300"><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex justify-center w-full text-red-400"><LogOut size={18} /></button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="text-white font-bold tracking-wide uppercase">{activeProject.replace('academy', 'Zest Academy').replace('zestfolio', 'Zestfolio')}</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">
              {activeProject === 'zestfolio' ? 'Configuration' : (activeTab === 'core' ? 'Overview' : activeTab === 'users' ? 'User Database' : 'Content CMS')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-500">SYSTEM ONLINE</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* Internal Tab Navigation (Only for Academy) */}
          {activeProject === 'academy' && (
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-white/5">
              <TabButton label="Zest Core (Main)" active={activeTab === 'core'} onClick={() => setActiveTab('core')} />
              <TabButton label="Content CMS" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
              <TabButton label="User Auth DB" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, collapsed = false }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full p-3 rounded-lg transition-all text-sm font-medium group relative",
        active
          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <div className={clsx("transition-transform", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </div>

      {!collapsed && (
        <span className="animate-in fade-in slide-in-from-left-2 duration-300">
          {label}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
          {label}
        </div>
      )}
    </button>
  )
}

function StatCard({ label, value, trend, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  };

  return (
    <div className={clsx("p-6 rounded-xl border backdrop-blur-sm", colors[color])}>
      <div className="text-gray-400 text-xs font-mono uppercase mb-2">{label}</div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      {trend && <div className="text-xs text-green-400 mt-2 font-mono">{trend} since last hour</div>}
    </div>
  )
}

function StatusItem({ label, status, color }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className={color}>{status}</span>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={clsx(
      "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
      active ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
    )}>
      {label}
    </button>
  )
}

function ContentCMS() {
  const [collections, setCollections] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>("articles");
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch List of Collections (Server Side)
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { getCollections } = await import("./actions");
        const result = await getCollections();
        if (result.success && result.collections) {
          setCollections(result.collections);
          // If 'articles' isn't in the list, default to the first one found
          if (result.collections.length > 0 && !result.collections.includes("articles")) {
            setActiveCollection(result.collections[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch collections list", err);
        // Fallback: just assume 'articles' exists
        setCollections(["articles"]);
      }
    };
    fetchCollections();
  }, []);

  // 2. Fetch Documents when Active Collection changes
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, activeCollection));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(data);
      } catch (err: any) {
        console.error(`Error fetching ${activeCollection}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [activeCollection]);

  // 3. Fetch Comments (Sub-collection) when an Article is selected
  // Note: We assume sub-collection is named 'comments' for now. 
  // In a real generic CMS, we would list sub-collections dynamically too.
  useEffect(() => {
    if (!selectedArticleId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const commentsRef = collection(db, activeCollection, selectedArticleId, "comments");
        const querySnapshot = await getDocs(commentsRef);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(data);
      } catch (err: any) {
        console.error("Error fetching comments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [selectedArticleId, activeCollection]);

  if (loading && !articles.length && !collections.length) return <div className="p-8 text-center font-mono animate-pulse text-blue-400">LOADING ZEST CONTENT NODE...</div>;

  // VIEW: COMMENTS LIST (Sub-level)
  if (selectedArticleId) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => { setSelectedArticleId(null); setComments([]); }}
            className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded transition-colors"
          >
            ← BACK TO {activeCollection.toUpperCase()}
          </button>
          <h3 className="text-xl font-bold text-white">
            <span className="text-gray-500">{activeCollection} / </span>
            <span className="text-purple-400 font-mono">{selectedArticleId}</span>
            <span className="text-gray-500"> / comments</span>
          </h3>
        </div>

        {loading && <div className="text-center py-8 text-gray-500 animate-pulse">Loading sub-collection data...</div>}

        {!loading && comments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            NO DATA FOUND IN 'comments' SUB-COLLECTION
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment, idx) => (
            <div key={comment.id || idx} className="p-4 bg-white/5 rounded border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-200 uppercase">{comment.user || comment.author || "Entry"} {idx + 1}</span>
                <span className="text-xs text-gray-500 font-mono">{comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleDateString() : "No Date"}</span>
              </div>
              <p className="text-gray-300 text-sm">{JSON.stringify(comment, null, 2)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VIEW: MAIN GRID
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Content Management System</h3>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">LIVE</span>
      </div>

      {/* Dynamic Collection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {collections.map(col => (
          <button
            key={col}
            onClick={() => setActiveCollection(col)}
            className={clsx(
              "px-4 py-2 text-xs font-mono uppercase rounded transition-colors",
              activeCollection === col
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            {col}
          </button>
        ))}
        {collections.length === 0 && <span className="text-xs text-gray-500 p-2">Scanning schema...</span>}
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded">{error}</div>}

      {!loading && articles.length === 0 && (
        <div className="text-center py-12 text-gray-500 border border-white/5 rounded-xl border-dashed">
          COLLECTION '{activeCollection}' IS EMPTY
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <div key={article.id} className="glass-panel p-5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                {activeCollection}
              </span>
            </div>

            <h4 className="font-bold text-white mb-2 truncate">{article.title || article.name || article.id}</h4>
            <p className="text-sm text-gray-400 line-clamp-3 mb-4 font-mono text-xs">
              {/* Smart preview of first few string fields */}
              {JSON.stringify(article, (key, value) => {
                if (key === 'id') return undefined; // already shown
                return value;
              }).slice(0, 100).replace(/[{}"]/g, '')}
            </p>

            <div className="flex gap-2 mt-auto">
              <button className="flex-1 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-300 rounded transition-colors">
                JSON
              </button>
              <button
                onClick={() => setSelectedArticleId(article.id)}
                className="flex-1 py-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded transition-colors group-hover:bg-purple-600 group-hover:text-white"
              >
                EXPLORE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [source, setSource] = useState<"firestore" | "rtdb" | "auth" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDBUsers = async () => {
    try {
      // 1. Try Firestore First
      try {
        const fsPromise = getDocs(collection(db, "users"));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore Timeout")), 5000));

        const querySnapshot = await Promise.race([fsPromise, timeoutPromise]) as any;

        const userData = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
        setSource("firestore");
        setLoading(false);
        return;
      } catch (fsError: any) {
        console.warn("Firestore failed, trying Realtime Database...", fsError);
      }

      // 2. Fallback to Realtime Database
      const rtdbRef = ref(rtdb, 'users');
      const snapshot = await get(rtdbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setUsers(userData);
        setSource("rtdb");
      } else {
        setUsers([]);
        if (!source) setSource("rtdb");
      }
    } catch (err: any) {
      console.error("All databases failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthUsers = async () => {
    setLoading(true);
    try {
      const { getAuthUsers } = await import("./actions");
      const result = await getAuthUsers();

      if (result.success && result.users) {
        setUsers(result.users);
        setSource("auth");
        setError("");
        setLoading(false);
      } else {
        // If auth fetching failed (e.g. no keys), fall back to DB automatically
        console.warn("Auth fetch failed, falling back to DB:", result.error);
        fetchDBUsers();
      }
    } catch (err: any) {
      console.error("Auth fetch failed:", err);
      // Fallback to DB if Auth fails completely
      fetchDBUsers();
    }
  };

  useEffect(() => {
    // Automatically try to fetch Auth Users first as requested
    fetchAuthUsers();
  }, []);

  if (loading && source !== "auth") return <div className="p-8 text-center font-mono animate-pulse text-blue-400">CONNECTING TO ZEST DATABASES...</div>;

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Zest User Database
          {source === "firestore" && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">FIRESTORE</span>}
          {source === "rtdb" && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">REALTIME DB</span>}
          {source === "auth" && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">FIREBASE AUTH (ADMIN)</span>}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={fetchAuthUsers}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2"
          >
            <Users size={14} /> Refresh Auth
          </button>
          <button
            onClick={fetchDBUsers}
            className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors border border-white/10"
          >
            Switch to DB
          </button>
        </div>
      </div>

      {(error) && (
        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded text-red-200 mb-4 font-mono text-xs space-y-2">
          <p className="font-bold">CONNECTION FAILED: {error}</p>
        </div>
      )}

      {!error && users.length === 0 && source && (
        <div className="text-gray-500 text-center py-8">
          NO RECORDS FOUND IN '{source === 'auth' ? 'Authentication Tab' : source === 'firestore' ? 'users collection' : 'users node'}'
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
              <th className="p-4">UID / ID</th>
              <th className="p-4">User Details</th>
              <th className="p-4">Registration Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user: any) => (
              <tr key={user.id || user.uid} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-xs text-gray-500">{(user.id || user.uid).substring(0, 8)}...</td>
                <td className="p-4">
                  <div className="text-white font-medium">{user.name || user.displayName || user.email || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{user.email || "No Email"}</div>
                </td>
                <td className="p-4 text-sm text-gray-300">
                  {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleString() :
                    user.created_at ? new Date(user.created_at).toLocaleString() :
                      user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString() :
                        "N/A"}
                </td>
                <td className="p-4">
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded",
                    user.disabled ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                  )}>
                    {user.disabled ? "Disabled" : "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
