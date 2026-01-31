"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Users, FileText, Settings, LogOut, Download, Search } from "lucide-react";
import UserDirectory from "@/components/UserDirectory";
import clsx from "clsx";
// import { auth } from "@/lib/firebase/config";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Auth Check
    // In real app: onAuthStateChanged(auth, user => ...)
    const isAuthed = sessionStorage.getItem("admin_session") === "active"; // Set this in Login Page success

    // For demo purposes, we might want to bypass if manual testing
    // if (!isAuthed) router.push("/login");
    // else setLoading(false);

    // Temporary: Always allow during dev if "demo" mode, else strict
    // router.push("/login"); 
    // To allow user to see dashboard, let's assume login flow sets session.
    // For now, redirect to login if no session.

    if (!isAuthed) {
      router.push("/login");
    } else {
      setLoading(false);
    }

  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-md flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            <Activity className="text-blue-500" /> SENTINEL
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<Activity />} label="Global Insights" active />
          <NavItem icon={<Users />} label="User Directory" />
          <NavItem icon={<FileText />} label="File Storage" />
          <NavItem icon={<Download />} label="Exports" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_session");
              router.push("/login");
            }}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full p-2"
          >
            <LogOut size={18} />
            <span className="text-sm font-mono">TERMINATE SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Global Insights</h2>
            <p className="text-gray-500 font-mono text-sm mt-1">REAL-TIME DATA STREAM</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              SYSTEM OPTIMAL
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Active Users" value="1,248" trend="+12%" color="blue" />
          <StatCard label="Total Projects" value="8" color="purple" />
          <StatCard label="Security Alerts" value="0" color="green" />
          <StatCard label="Storage Used" value="45%" color="orange" />
        </div>

        {/* Main Chart Area (Placeholder) */}
        <div className="h-96 glass-panel rounded-xl p-6 mb-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50 font-mono text-xs">LIVE TRAFFIC</div>
          {/* Chart would go here */}
          <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono">
            [ REAL-TIME CHART VISUALIZATION ]
          </div>
        </div>


        <div className="mb-8">
          <UserDirectory />
        </div>

        <div className="grid grid-cols-3 gap-6">

          <div className="col-span-2 glass-panel rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
              <span>Recent Activity</span>
              <button className="text-xs text-blue-400 hover:text-blue-300">VIEW ALL</button>
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
                      USR
                    </div>
                    <div>
                      <div className="text-sm text-white">New User Registration</div>
                      <div className="text-xs text-gray-500 font-mono">user_{i}992@gmail.com</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">1{i}m ago</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4">System Status</h3>
            <div className="space-y-3 font-mono text-xs">
              <StatusItem label="Database" status="Connected" color="text-green-400" />
              <StatusItem label="Auth Service" status="Online" color="text-green-400" />
              <StatusItem label="Storage" status="Syncing" color="text-yellow-400" />
              <StatusItem label="Hardware Lock" status="Engaged" color="text-blue-400" />
              <StatusItem label="Encryption" status="AES-256" color="text-purple-400" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={clsx(
      "flex items-center gap-3 w-full p-3 rounded transition-all text-sm font-medium",
      active ? "bg-blue-600/20 text-blue-400 border border-blue-600/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]" : "text-gray-400 hover:text-white hover:bg-white/5"
    )}>
      {icon}
      <span>{label}</span>
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
