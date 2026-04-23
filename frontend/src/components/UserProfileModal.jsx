import React from 'react';
import { X, User, Mail, Camera, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfileModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <User className="text-emerald-500 dark:text-cyan-400" />
                        User Profile
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Profile Body */}
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="relative group mb-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-lg shadow-cyan-500/20">
                            <img 
                                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D1117&color=00F2FF`} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900"
                            />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-cyan-400 shadow-md hover:scale-110 transition-transform">
                            <Camera size={14} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        {user?.name || 'Zylron Explorer'}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6 bg-gray-100 dark:bg-gray-800/50 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                        <Mail size={14} />
                        {user?.email || 'No email provided'}
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500 dark:text-cyan-400" size={18} />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-cyan-400 bg-emerald-100 dark:bg-cyan-400/10 px-2.5 py-1 rounded-md">Verified</span>
                        </div>

                        <button 
                            onClick={() => alert("Profile editing coming soon in Zylron Pro!")}
                            className="w-full py-3 bg-emerald-600 dark:bg-cyan-600 hover:bg-emerald-500 dark:hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10"
                        >
                            Edit Profile Details
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-black/20 p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                        Zylron ID: {user?.uid?.substring(0, 12)}...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
