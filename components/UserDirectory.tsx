"use client";

import { useState } from "react";
import { Search, Download, Trash2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_USERS = Array.from({ length: 15 }).map((_, i) => ({
    id: `usr_${i}`,
    email: `operative.${i + 142}@sentinel.net`,
    role: i === 0 ? "ADMIN" : "OPERATOR",
    joined: "2025-11-12",
    lastActive: i < 5 ? "Online" : `${i}h ago`,
    status: i < 5 ? "active" : "dormant"
}));

export default function UserDirectory() {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter logic
    const filteredUsers = MOCK_USERS.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Email,Role,Joined,LastActive\n"
            + filteredUsers.map(u => `${u.id},${u.email},${u.role},${u.joined},${u.lastActive}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sentinel_users_export.csv");
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
                            placeholder="SEARCH ENCRYPTED DATABASE..."
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
                            <th className="p-4 rounded-tl-lg">ID</th>
                            <th className="p-4">Identity</th>
                            <th className="p-4">Clearance</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                        {filteredUsers.map((user, idx) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-white/5 transition-colors group"
                            >
                                <td className="p-4 text-xs text-gray-600">#{user.id}</td>
                                <td className="p-4 text-white font-sans">{user.email}</td>
                                <td className="p-4">
                                    <span className={user.role === 'ADMIN' ? 'text-red-400 font-bold' : 'text-blue-400'}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                        {user.lastActive}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-1 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
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
