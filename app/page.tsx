"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Users, FileText, Settings, Download, Search, Bell,
  MapPin, Shield, Smartphone, Globe, Clock, AlertCircle, RefreshCw, Archive,
  PieChart, Database, ChevronLeft, Menu, LogOut, LayoutGrid, Layers
} from "lucide-react";
import UserDirectory from "@/components/UserDirectory";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import clsx from "clsx";
import { collection, getDocs } from "firebase/firestore";
import { db, rtdb } from "@/lib/firebase/config";
import { ref, get } from "firebase/database";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("core");
  const [activeProject, setActiveProject] = useState("academy"); // 'academy' | 'zestfolio'
  const [activeView, setActiveView] = useState<'global' | 'database' | 'activity' | 'users' | 'common'>('global'); // New: track view type
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGlobalExpanded, setIsGlobalExpanded] = useState(true);
  const [isDatabaseExpanded, setIsDatabaseExpanded] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [totalUserCount, setTotalUserCount] = useState<number>(0);
  const [academyUserCount, setAcademyUserCount] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<any[]>([]); // Store full user list
  const [academyUsers, setAcademyUsers] = useState<any[]>([]);
  const [zestfolioUsers, setZestfolioUsers] = useState<any[]>([]);
  const [commonUserCount, setCommonUserCount] = useState<number>(0);
  const [commonUsers, setCommonUsers] = useState<any[]>([]);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Combined User Count from Both Databases
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const { getAuthUsers } = await import("./actions");

        // Fetch from both databases
        const [academyResult, zestfolioResult] = await Promise.all([
          getAuthUsers('academy'),
          getAuthUsers('zestfolio')
        ]);

        const academyCount = academyResult.success ? academyResult.users?.length || 0 : 0;
        const zestfolioCount = zestfolioResult.success ? zestfolioResult.users?.length || 0 : 0;

        const combinedUsers = [...(academyResult.users || []), ...(zestfolioResult.users || [])];
        setAllUsers(combinedUsers);
        setAcademyUsers(academyResult.users || []);
        setZestfolioUsers(zestfolioResult.users || []);

        setAcademyUserCount(academyCount);
        setTotalUserCount(academyCount + zestfolioCount);

        // Calculate Common Users
        const academyEmails = new Set((academyResult.users || []).map((u: any) => u.email).filter(Boolean));
        const commonList = (zestfolioResult.users || []).filter((u: any) => u.email && academyEmails.has(u.email));
        setCommonUserCount(commonList.length);
        setCommonUsers(commonList);
      } catch (error) {
        console.error("Failed to fetch total user count:", error);
      }
    };

    if (user) {
      fetchTotalUsers();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed", e);
      alert("Login failed: " + e);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
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
    // Global Insights View (Combined data from both databases)
    if (activeView === 'global') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-12 glass-panel rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-900/20">
                <PieChart size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Global Insights Dashboard</h3>
              <p className="text-gray-400 max-w-md">
                Viewing combined analytics from Zest Academy and Zestfolio. Select a database from the sidebar to view specific data.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-4">Zest System Status</h3>
              <div className="space-y-3 font-mono text-xs">
                <StatusItem label="Zest Core DB" status="Connected" color="text-green-400" />
                <StatusItem label="Auth Service" status="Online" color="text-green-400" />
                <StatusItem label="Hardware Lock" status="Engaged" color="text-blue-400" />
                <StatusItem label="Encryption" status="AES-256" color="text-purple-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="All Zest Users"
              value={totalUserCount.toString()}
              color="green"
              onClick={() => setActiveView('users')}
            />
            <StatCard
              label="Common Users"
              value={commonUserCount.toString()}
              color="orange"
              onClick={() => setActiveView('common')}
            />
            <StatCard label="Total Databases" value="2" color="purple" />
            <StatCard label="Integration Status" value="ACTIVE" color="blue" />
          </div>

          <div className="p-6 glass-panel rounded-xl border border-white/5 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-purple-400" />
              User Growth Analytics
            </h3>
            <AnalyticsCharts users={allUsers} />
          </div>
        </div>
      );
    }

    if (activeView === 'users') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <UserDirectory users={allUsers} />
        </div>
      );
    }

    if (activeView === 'common') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <UserDirectory users={commonUsers} />
        </div>
      );
    }

    if (activeView === 'activity') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="p-8 glass-panel rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity size={28} className="text-blue-400" />
                Zest Activity Feed
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">Live Monitoring Active</span>
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-all duration-300 border border-white/5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 group-hover:scale-110 transition-transform">
                      ZEST
                    </div>
                    <div>
                      <div className="text-lg text-white font-medium group-hover:text-blue-400 transition-colors">Database Node Sync</div>
                      <div className="text-sm text-gray-500 font-mono opacity-80">shard_{i}992 successfully replicated to global cluster</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs font-mono text-gray-500">
                    <span className="text-gray-400 italic">1{i}m ago</span>
                    <span className="text-[10px] opacity-30 tracking-tighter uppercase">ID: 0x{i}F92B</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
              <button className="text-sm text-blue-400 hover:text-blue-300 font-medium tracking-wide flex items-center gap-2 transition-all">
                LOAD PREVIOUS LOGS <ChevronLeft size={14} className="rotate-[270deg]" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Database-specific views
    switch (activeTab) {
      case "users":
        return <RealUserList project={activeProject} />;
      case "content":
        return <ContentCMS project={activeProject} />;
      case "core":
      default:
        if (activeProject === 'zestfolio') {
          // Zestfolio Specific Overview
          return (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Zestfolio Users" value={zestfolioUsers.length.toString()} color="green" />
                <StatCard label="Media Assets" value="2.4GB" color="purple" />
                <StatCard label="Integration Status" value="ACTIVE" color="blue" />
              </div>



              <div className="p-6 glass-panel rounded-xl border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-purple-400" />
                  Zestfolio User Growth
                </h3>
                <AnalyticsCharts users={zestfolioUsers} />
              </div>
            </div>
          );
        }

        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard label="Zest Academy Users" value={academyUserCount.toString()} color="blue" />
            </div>

            <div className="p-6 glass-panel rounded-xl border border-white/5 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Academy User Growth
              </h3>
              <AnalyticsCharts users={academyUsers} />
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
            <div
              className="flex items-center gap-2 cursor-pointer group/brand"
              onClick={() => setActiveView('global')}
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold group-hover/brand:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all">Z</div>
              <span className="font-bold tracking-tight group-hover/brand:text-white transition-colors">ZEST ADMIN</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400">
            {isSidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          {/* 1. Global Overview */}
          <div
            className="space-y-1"
            onMouseEnter={() => setIsGlobalExpanded(true)}
            onMouseLeave={() => setIsGlobalExpanded(false)}
          >
            <NavItem
              icon={<PieChart size={20} />}
              label="Global Insights"
              active={activeView === 'global' || activeView === 'users' || activeView === 'common'}
              onClick={() => {
                if (activeView !== 'users' && activeView !== 'common') {
                  setActiveView('global');
                }
              }}
              collapsed={!isSidebarOpen}
            />
            <AnimatePresence>
              {isSidebarOpen && isGlobalExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="ml-9 space-y-1 border-l border-white/5 pl-2 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveView('global')}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors mb-1",
                      activeView === 'global' ? "bg-white/5 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveView('users')}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors mb-1",
                      activeView === 'users' ? "bg-white/5 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    User Directory
                  </button>
                  <button
                    onClick={() => setActiveView('common')}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                      activeView === 'common' ? "bg-white/5 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    Common Users
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <NavItem
              icon={<Activity size={20} />}
              label="Activity Feed"
              active={activeView === 'activity'}
              onClick={() => setActiveView('activity')}
              collapsed={!isSidebarOpen}
            />
          </div>

          {/* 2. Database Group */}
          <div
            className="space-y-1"
            onMouseEnter={() => setIsDatabaseExpanded(true)}
            onMouseLeave={() => setIsDatabaseExpanded(false)}
          >
            <NavItem
              icon={<Database size={20} />}
              label="Databases"
              active={activeView === 'database'}
              onClick={() => { }}
              collapsed={!isSidebarOpen}
            />

            {/* Project List (Indented) */}
            <AnimatePresence>
              {isSidebarOpen && isDatabaseExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="ml-9 space-y-1 border-l border-white/5 pl-2 overflow-hidden"
                >
                  <button
                    onClick={() => { setActiveView('database'); setActiveProject('academy'); setActiveTab('core'); }}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors mb-1",
                      activeView === 'database' && activeProject === 'academy' ? "bg-white/5 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    Zest Academy
                  </button>
                  <button
                    onClick={() => { setActiveView('database'); setActiveProject('zestfolio'); setActiveTab('core'); }}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                      activeView === 'database' && activeProject === 'zestfolio' ? "bg-white/5 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    Zestfolio
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            <span
              className="text-white font-bold tracking-wide uppercase cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => setActiveView('global')}
            >
              {activeView === 'global' || activeView === 'users' || activeView === 'common' ? 'Zest Admin' : activeView === 'activity' ? 'System Monitoring' : activeProject.replace('academy', 'Zest Academy').replace('zestfolio', 'Zestfolio')}
            </span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">
              {activeView === 'global' ? 'Global Insights' : activeView === 'users' ? 'User Directory' : activeView === 'common' ? 'Common Users' : activeView === 'activity' ? 'Live Activity Feed' : (activeTab === 'core' ? 'Overview' : activeTab === 'users' ? 'User Database' : 'Content CMS')}
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

          {/* Internal Tab Navigation (Only show for database views) */}
          {activeView === 'database' && (
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-white/5">
              <TabButton label="Overview" active={activeTab === 'core'} onClick={() => setActiveTab('core')} />
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

function NavItem({ icon, label, active = false, onClick, collapsed = false, className }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full p-3 rounded-lg transition-all text-sm font-medium group relative",
        active
          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
          : "text-gray-400 hover:text-white hover:bg-white/5",
        className
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

function StatCard({ label, value, trend, color, onClick }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "p-6 rounded-xl border backdrop-blur-sm transition-all duration-300",
        colors[color],
        onClick && "cursor-pointer hover:scale-[1.02] hover:bg-white/[0.05] active:scale-[0.98]"
      )}
    >
      <div className="text-gray-400 text-xs font-mono uppercase mb-2">{label}</div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      {trend && <div className="text-xs text-green-400 mt-2 font-mono">{trend} since last hour</div>}
    </div>
  )
}

function ZestfolioLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { auth } = await import("@/lib/firebase/zestfolio");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, pass);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Zestfolio Login Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 glass-panel rounded-xl border border-white/10 text-center">
      <h3 className="text-xl font-bold mb-4 text-white">Zestfolio Admin Access</h3>
      <p className="text-gray-400 mb-6 text-sm">
        This project requires explicit authentication. Please sign in with your Zestfolio Admin credentials.
      </p>
      <form onSubmit={handleLogin} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1">ADMIN EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-purple-500"
            placeholder="admin@zestfolio.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1">PASSWORD</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-purple-500"
            required
          />
        </div>
        {error && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors disabled:opacity-50"
        >
          {loading ? "AUTHENTICATING..." : "UNLOCK ZESTFOLIO"}
        </button>
      </form>
    </div>
  );
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

// ------------------------------------------------------------------
// COMPONENT: CONTENT CMS
// ------------------------------------------------------------------
function ContentCMS({ project = 'academy' }: { project?: string }) {
  const [collections, setCollections] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>("articles");
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch List of Collections
  useEffect(() => {
    const fetchCollections = async () => {
      // If Zestfolio, we might have different collections or just default to common ones for now
      // Since we can't easily auto-detect server-side for a client-side initialized secondary app without a new admin SDK setup,
      // we will default to standard collections for Zestfolio for now.
      if (project === 'zestfolio') {
        setCollections(["portfolios", "blogs", "experience", "testimonials"]);
        setActiveCollection("portfolios");
        return;
      }

      try {
        const { getCollections } = await import("./actions");
        const result = await getCollections();
        if (result.success && result.collections) {
          setCollections(result.collections);
          if (result.collections.length > 0 && !result.collections.includes("articles")) {
            setActiveCollection(result.collections[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch collections list", err);
        setCollections(["articles"]);
      }
    };
    fetchCollections();
  }, [project]);

  // 2. Fetch Documents
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError("");
      setArticles([]);

      try {
        const { getCMSContent } = await import("./actions");
        const result = await getCMSContent(activeCollection, project);

        if (result.success && result.data) {
          setArticles(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch content");
        }
      } catch (err: any) {
        console.error(`Error fetching ${activeCollection} [${project}]:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [activeCollection, project]);

  // 3. Fetch Sub-collection (Comments) - Skip for portfolios
  useEffect(() => {
    if (!selectedArticleId) return;
    if (activeCollection === 'portfolios') return; // Portfolios don't have comments

    const fetchComments = async () => {
      setLoading(true);
      try {
        let targetDb = db;
        if (project === 'zestfolio') {
          const { db: zestDb, ensureZestAuth } = await import("@/lib/firebase/zestfolio");
          await ensureZestAuth();
          targetDb = zestDb;
        }

        // Note: Zestfolio might not have 'comments', but we keep the logic generic
        const commentsRef = collection(targetDb, activeCollection, selectedArticleId, "comments");
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
  }, [selectedArticleId, activeCollection, project]);

  // ... (Render Logic remains similar, just returning JSX)
  if (loading && !articles.length && !collections.length) return <div className="p-8 text-center font-mono animate-pulse text-blue-400">LOADING {project === 'zestfolio' ? 'ZESTFOLIO' : 'ZEST'} CONTENT NODE...</div>;

  // VIEW: DETAIL VIEW (Portfolio or Comments)
  if (selectedArticleId) {
    const selectedItem = articles.find(a => a.id === selectedArticleId);

    // Portfolio Detail View
    if (activeCollection === 'portfolios' && selectedItem) {
      return (
        <div className="glass-panel p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedArticleId(null)}
              className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded transition-colors"
            >
              ← BACK TO PORTFOLIOS
            </button>
            <h3 className="text-xl font-bold text-white">
              <span className="text-gray-500">Portfolio Details / </span>
              <span className="text-purple-400">{selectedItem.fullName || selectedItem.name || selectedArticleId}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="glass-panel p-5 rounded-lg border border-white/5">
              <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Personal Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <p className="text-white font-medium">{selectedItem.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-white">{selectedItem.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">URL Name</label>
                  <p className="text-white">{selectedItem.urlName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${selectedItem.status === 'live' || selectedItem.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedItem.status === 'live' || selectedItem.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      {selectedItem.status === 'live' || selectedItem.isActive ? 'Live' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Projects & Skills */}
            <div className="glass-panel p-5 rounded-lg border border-white/5">
              <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Content Summary</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Projects</label>
                  <p className="text-white font-medium text-2xl">{selectedItem.projects?.length || selectedItem.projectCount || 0}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Skills</label>
                  <p className="text-white font-medium text-2xl">{selectedItem.skills?.length || selectedItem.skillCount || 0}</p>
                </div>
              </div>
            </div>


            {/* Portfolio Preview */}
            <div className="md:col-span-2 glass-panel p-5 rounded-lg border border-white/5">
              <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Portfolio Preview</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">Live Portfolio URL</p>
                  <p className="text-purple-400 font-mono text-sm">
                    https://zestfolio.zestacademy.tech/u/{selectedItem.urlName || selectedItem.username || selectedItem.id}
                  </p>
                </div>
                <a
                  href={`https://zestfolio.zestacademy.tech/u/${selectedItem.urlName || selectedItem.username || selectedItem.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Live Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Comments View for Other Collections
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
        <h3 className="text-xl font-bold text-white">Content Management System <span className="text-gray-500 text-sm">[{project.toUpperCase()}]</span></h3>
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

      {/* Table View for Portfolios */}
      {activeCollection === 'portfolios' ? (
        <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Full Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">URL Name</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-300">Projects</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-300">Skills</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{article.fullName || article.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{article.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{article.urlName || article.username || 'N/A'}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{article.projects?.length || article.projectCount || 0}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{article.skills?.length || article.skillCount || 0}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${article.status === 'live' || article.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${article.status === 'live' || article.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      {article.status === 'live' || article.isActive ? 'Live' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedArticleId(article.id)}
                      className="inline-flex items-center gap-2 px-4 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View for Other Collections */
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
                {JSON.stringify(article, (key, value) => {
                  if (key === 'id') return undefined;
                  return value;
                }).slice(0, 100).replace(/[{}\"]/g, '')}
              </p>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setSelectedArticleId(article.id)}
                  className="flex-1 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium rounded transition-colors"
                >
                  VIEW
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT: REAL USER LIST
// ------------------------------------------------------------------
function RealUserList({ project = 'academy' }: { project?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [source, setSource] = useState<"firestore" | "rtdb" | "auth" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDBUsers = async () => {
    try {
      let targetDb = db;
      let targetRtdb = rtdb;

      if (project === 'zestfolio') {
        const { db: zDb, rtdb: zRtdb, ensureZestAuth } = await import("@/lib/firebase/zestfolio");
        await ensureZestAuth();
        targetDb = zDb;
        targetRtdb = zRtdb;
      }

      // 1. Try Firestore First
      try {
        const fsPromise = getDocs(collection(targetDb, "users"));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore Timeout")), 5000));

        const querySnapshot = await Promise.race([fsPromise, timeoutPromise]) as any;

        const userData = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
        setSource("firestore");
        setLoading(false);
        return;
      } catch (fsError: any) {
        // console.warn("Firestore failed, trying Realtime Database...", fsError);
      }

      // 2. Fallback to Realtime Database
      const rtdbRef = ref(targetRtdb, 'users');
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
      if (err.message === "AUTH_DISABLED") {
        setError("Auth Error: Enable 'Anonymous' in Zestfolio Console.");
      } else if (err.code === "permission-denied") {
        setError("Access Denied: Update Zestfolio Rules to allow anonymous dashboard access.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthUsers = async () => {
    setLoading(true);
    try {
      const { getAuthUsers } = await import("./actions");
      const result = await getAuthUsers(project);

      if (result.success && result.users) {
        setUsers(result.users);
        setSource("auth");
        setError("");
        setLoading(false);
      } else {
        console.warn("Auth fetch failed:", result.error);

        // For debugging, if specifically Zestfolio, show the error
        if (project === "zestfolio") {
          setError(`Auth Error: ${result.error}`);
          // Still try DB as backup, but keep error visible if DB is empty
          fetchDBUsers();
        } else {
          fetchDBUsers();
        }
      }
    } catch (err: any) {
      console.error("Auth fetch failed:", err);
      fetchDBUsers();
    }
  };

  useEffect(() => {
    // Automatically try to fetch Auth Users first as requested
    fetchAuthUsers();
  }, [project]);

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

      {!error && users.length === 0 && (
        <div className="text-gray-500 text-center py-8 border border-white/5 rounded border-dashed bg-white/5">
          <p>NO RECORDS IN '{source === 'auth' ? 'Authentication' : 'Firestore: users'}'</p>
          {project === 'zestfolio' && (
            <p className="text-xs mt-2 text-gray-600">
              Note: Zestfolio Auth Listing is limited. Only users with profiles in the
              <code className="mx-1 bg-black/30 px-1 rounded">users</code> collection are shown.
            </p>
          )}
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
