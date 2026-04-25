import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Code, Edit3, RefreshCw } from 'lucide-react';

const CodePreviewModal = ({ isOpen, onClose, code: initialCode }) => {
    const [code, setCode] = useState(initialCode);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    if (!isOpen) return null;

    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { font-family: sans-serif; background: #fff; color: #333; padding: 0; margin: 0; }
                </style>
            </head>
            <body>
                <div id="root">${code}</div>
                <script>
                    window.onerror = function(msg, url, line) {
                        const div = document.createElement('div');
                        div.style.color = 'red';
                        div.style.padding = '10px';
                        div.style.background = '#ffebee';
                        div.style.fontSize = '12px';
                        div.innerText = 'Zylron Runtime Error: ' + msg + ' (Line ' + line + ')';
                        document.body.prepend(div);
                    }
                </script>
            </body>
        </html>
    `;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-cyan-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/40">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-100 dark:bg-cyan-500/10 rounded-2xl text-emerald-600 dark:text-cyan-400 shadow-inner">
                            <Play size={20} className="fill-current" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter">Zylron Hyper-Sandbox</h2>
                            <p className="text-[10px] text-emerald-600 dark:text-cyan-400 font-black uppercase tracking-widest opacity-80">Live Interactive Execution Environment</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isEditMode ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-500/10'}`}
                        >
                            {isEditMode ? <RefreshCw size={14} className="animate-spin-slow" /> : <Edit3 size={14} />}
                            {isEditMode ? 'Running Live...' : 'Edit Code'}
                        </button>
                        <button onClick={onClose} className="p-2.5 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"><X size={24} /></button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Panel */}
                    {isEditMode && (
                        <div className="w-1/3 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-black/20">
                            <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Source Editor</div>
                            <textarea 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 w-full bg-transparent p-6 text-sm font-mono text-gray-700 dark:text-gray-300 focus:outline-none resize-none spellcheck-false"
                                spellCheck="false"
                            />
                        </div>
                    )}

                    {/* Preview Panel */}
                    <div className="flex-1 bg-white relative">
                        <iframe 
                            title="Zylron Live Preview"
                            srcDoc={srcDoc}
                            className="w-full h-full border-none"
                            sandbox="allow-scripts"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-black/40 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-emerald-500"><Code size={12} /> Runtime: V8 Secure</span>
                        <span className="flex items-center gap-1.5 text-cyan-400"><RefreshCw size={12} /> Hot Reload Active</span>
                    </div>
                    <button onClick={() => window.open('', '_blank').document.write(srcDoc)} className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 transition-all hover:gap-2">
                        Deploy to External Tab <ExternalLink size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodePreviewModal;
