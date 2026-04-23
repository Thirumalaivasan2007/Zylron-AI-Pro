import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicChat } from '../services/firestore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ZylronLogo from '../logo.png';
import { ArrowLeft, Share2, Sparkles, Code, Zap } from 'lucide-react';

const SharedChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [chatData, setChatData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSharedChat = async () => {
            const data = await fetchPublicChat(id);
            setChatData(data);
            setLoading(false);
        };
        loadSharedChat();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <p className="text-cyan-400 font-bold animate-pulse uppercase tracking-widest text-xs">Retrieving Intelligence...</p>
            </div>
        );
    }

    if (!chatData) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404: Knowledge Lost</h1>
                <p className="text-gray-400 mb-8 max-w-md">The shared conversation you're looking for doesn't exist or has been deleted from the Zylron Archive.</p>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-gray-800 dark:text-gray-200 selection:bg-cyan-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={ZylronLogo} alt="Logo" className="w-8 h-8 rounded-full" />
                    <div>
                        <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Shared Zylron Intelligence</h1>
                        <p className="text-[10px] text-emerald-600 dark:text-cyan-400 font-bold uppercase tracking-widest">Protocol: {chatData.persona.replace('_', ' ')}</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all"
                >
                    <ArrowLeft size={14} /> Start Your Own Chat
                </button>
            </header>

            <main className="max-w-4xl mx-auto pt-24 pb-20 px-6">
                <div className="space-y-8">
                    {chatData.messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.type === 'user' ? 'opacity-70' : ''}`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {msg.type === 'user' ? 'U' : <img src={ZylronLogo} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{msg.type === 'user' ? 'User' : 'Zylron AI'}</p>
                                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        children={String(children).replace(/\n$/, '')}
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    />
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-900 text-center">
                    <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <Share2 size={32} className="text-cyan-400 animate-pulse" />
                        <h2 className="text-xl font-bold">Intrigued by this conversation?</h2>
                        <p className="text-sm text-gray-500 max-w-xs">Zylron AI is the world's most advanced private intelligence engine.</p>
                        <button onClick={() => navigate('/')} className="w-full py-3 bg-emerald-600 dark:bg-cyan-600 hover:bg-emerald-500 dark:hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-xl">
                            Chat with Zylron Now
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SharedChat;
