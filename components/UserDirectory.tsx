"use client";

import { useState } from "react";
import { Search, Download, Trash2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

interface UserDirectoryProps {
    users: any[];
}

export default function UserDirectory({ users }: UserDirectoryProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter logic
    const filteredUsers = (users || []).filter(u =>
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.uid || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "UID,Email,Clearance,Joined,LastSignIn\n"
            + filteredUsers.map(u => `${u.uid},${u.email},${u.customClaims?.role || u.metadata?.role || "USER"},${u.metadata?.creationTime},${u.metadata?.lastSignInTime}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "zest_users_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    User Directory
                    <span className="text-xs font-mono text-gray-500 bg-black/50 px-2 py-1 rounded-full">{filteredUsers.length}</span>
                </h3>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="SEARCH BY UID OR EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 p-2 rounded-lg transition-colors"
                        title="Export CSV"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200 font-mono text-xs uppercase">
                        <tr>
                            <th className="p-4 rounded-tl-lg">UID</th>
                            <th className="p-4">Identity</th>
                            <th className="p-4">Clearance</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                        {filteredUsers.map((user, idx) => {
                            const lastSignIn = user.metadata?.lastSignInTime;
                            const isOnline = lastSignIn ? (new Date().getTime() - new Date(lastSignIn).getTime() < 1000 * 60 * 60 * 24) : false; // Online if signed in in last 24h as a heuristic
                            const role = user.customClaims?.role || user.metadata?.role || "USER";

                            return (
                                <motion.tr
                                    key={user.uid}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-4 text-[10px] text-gray-500 uppercase truncate max-w-[120px]" title={user.uid}>
                                        {user.uid.substring(0, 12)}...
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-sans text-sm">{user.displayName || "Unknown"}</span>
                                            <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full border",
                                            role === 'ADMIN' ? 'text-red-400 border-red-400/30 bg-red-400/5 font-bold' : 'text-blue-400 border-blue-400/30 bg-blue-400/5'
                                        )}>
                                            {role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                            {lastSignIn ? new Date(lastSignIn).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-1 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-600 font-mono">
                    NO MATCHING RECORDS FOUND IN DATABASE
                </div>
            )}
        </div>
    );
}

const clsx = (...classes: any[]) => classes.filter(Boolean).join(' ');
