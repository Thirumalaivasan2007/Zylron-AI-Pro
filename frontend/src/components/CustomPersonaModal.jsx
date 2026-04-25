import React, { useState } from 'react';
import { X, Save, Sparkles, UserPlus, Zap } from 'lucide-react';

const CustomPersonaModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [instructions, setInstructions] = useState('');
    const [tone, setTone] = useState('Professional');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name || !instructions) return;
        onSave({ name, role, instructions, tone });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Zylron Persona Architect</h2>
                            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">Create Your Custom Synthetic Intelligence</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Persona Identity</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. JARVIS / Cyber Mentor"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Directive (Instructions)</label>
                            <textarea 
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Tell Zylron how to behave, what rules to follow, and its core mission..."
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm h-32 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cognitive Tone</label>
                                <select 
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:outline-none"
                                >
                                    <option>Professional</option>
                                    <option>Sarcastic</option>
                                    <option>Aggressive</option>
                                    <option>Friendly</option>
                                    <option>Mysterious</option>
                                </select>
                            </div>
                            <div className="flex flex-col justify-end">
                                <button 
                                    onClick={handleSave}
                                    className="w-full h-[52px] bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Deploy Persona
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPersonaModal;
