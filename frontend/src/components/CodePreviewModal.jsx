import React from 'react';
import { X, ExternalLink, Play, Code } from 'lucide-react';

const CodePreviewModal = ({ isOpen, onClose, code }) => {
    if (!isOpen) return null;

    // Construct the combined HTML/CSS/JS blob
    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body { font-family: sans-serif; background: #fff; color: #333; padding: 20px; }
                </style>
            </head>
            <body>
                ${code}
                <script>
                    // Catch errors and display them
                    window.onerror = function(msg, url, line) {
                        const div = document.createElement('div');
                        div.style.color = 'red';
                        div.style.padding = '10px';
                        div.style.background = '#ffebee';
                        div.style.marginTop = '10px';
                        div.innerText = 'Error: ' + msg + ' on line ' + line;
                        document.body.appendChild(div);
                    }
                </script>
            </body>
        </html>
    `;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-cyan-500/10 rounded-xl text-emerald-600 dark:text-cyan-400">
                            <Play size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">Live Sandbox Preview</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Zylron Runtime Environment</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-white relative">
                    <iframe 
                        title="Zylron Live Preview"
                        srcDoc={srcDoc}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts"
                    />
                </div>

                {/* Footer / Status */}
                <div className="p-3 bg-gray-50 dark:bg-black/40 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Code size={12} /> HTML/JS Active</span>
                        <span className="flex items-center gap-1.5 text-emerald-500 dark:text-cyan-400">● Sandbox Secure</span>
                    </div>
                    <button className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                        Open in New Tab <ExternalLink size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodePreviewModal;
