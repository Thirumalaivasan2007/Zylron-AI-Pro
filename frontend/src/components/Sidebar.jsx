import { Plus, Trash2, MessageSquare, Zap, Search, RefreshCw, Share2, FileDown, HelpCircle, Download } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ history, loadSession, handleNewChat, currentSessionId, deleteSession, credits = 0, onShare, onExportPDF, onExportMD, onTour }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = history.filter(chat => 
        chat.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-72 h-full bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-cyan-900/30 flex flex-col transition-colors duration-300">
            <div className="p-4 pt-6 space-y-4">
                <button
                    onClick={handleNewChat}
                    className="flex items-center justify-start gap-3 bg-emerald-50 dark:bg-cyan-950/30 hover:bg-emerald-100 dark:hover:bg-cyan-900/50 text-emerald-700 dark:text-cyan-400 font-medium py-3 px-5 rounded-2xl transition-all duration-300 border border-emerald-200/50 dark:border-cyan-800/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] w-full group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-sm tracking-wide">New Chat</span>
                </button>

                {/* Smart Search Input */}
                <div className="relative group">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-300 dark:focus:border-cyan-500/50 transition-all text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Mobile-Friendly Quick Actions */}
            <div className="px-4 mb-4 sm:hidden">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onShare} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 transition-all border border-gray-100 dark:border-gray-800">
                        <Share2 size={12} /> Share
                    </button>
                    <button onClick={onExportPDF} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 transition-all border border-gray-100 dark:border-gray-800">
                        <FileDown size={12} /> PDF
                    </button>
                    <button onClick={onExportMD} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 transition-all border border-gray-100 dark:border-gray-800">
                        <Download size={12} /> MD
                    </button>
                    <button onClick={onTour} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 transition-all border border-gray-100 dark:border-gray-800">
                        <HelpCircle size={12} /> Tour
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-4 px-6">
                    Cloud History
                </div>

                <div className="space-y-1 px-3">
                    {filteredHistory.length === 0 ? (
                        <div className="text-sm text-gray-400 dark:text-gray-600 px-3 italic py-8 text-center flex flex-col items-center gap-2">
                            <Search size={24} className="opacity-20" />
                            {searchQuery ? "No matching chats found" : "No history found"}
                        </div>
                    ) : (
                        filteredHistory.map((chat) => (
                            <div
                                key={chat.sessionId}
                                onClick={() => loadSession(chat.sessionId)}
                                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer group flex items-center justify-between gap-3 ${currentSessionId === chat.sessionId ? 'bg-emerald-100/50 dark:bg-cyan-900/40 text-emerald-900 dark:text-cyan-300 shadow-[inset_0_0_20px_rgba(0,255,255,0.05)] border border-emerald-200/50 dark:border-cyan-800/50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-cyan-950/30 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <MessageSquare size={16} className={`shrink-0 ${currentSessionId === chat.sessionId ? 'text-emerald-500 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-600'}`} />
                                    <div className="truncate text-sm font-medium">
                                        {chat.message}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Delete this cloud session permanently?")) {
                                            deleteSession(chat.sessionId);
                                        }
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-white dark:hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 focus:outline-none"
                                    title="Delete session"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* AI Usage Tracker (SaaS Prep) */}
            <div className="p-5 mt-auto border-t border-gray-100 dark:border-cyan-900/20 bg-gray-50/30 dark:bg-black/20">
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-cyan-400 uppercase tracking-[0.15em]">
                        <Zap size={12} className="fill-current" />
                        Daily Credits
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-cyan-300">{credits} / 50</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800/50 rounded-full overflow-hidden shadow-inner border border-gray-200/20 dark:border-cyan-900/10">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-cyan-600 dark:to-blue-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-1000"
                        style={{ width: `${(credits / 50) * 100}%` }}
                    ></div>
                </div>
                <div className="mt-2.5">
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 leading-relaxed text-center">
                        Need more? <span className="text-emerald-600 dark:text-cyan-400 cursor-pointer hover:underline">Upgrade to Pro</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
