import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a] overflow-hidden selection:bg-cyan-500/30">
            
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0f172a]/0 to-transparent rounded-full" />
            </div>

            {/* Core Logo Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                
                {/* Glowing Orbs Behind Text */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                        opacity: [0.4, 0.8, 0.4],
                        scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="absolute -top-10 -left-10 w-48 h-48 bg-cyan-500/40 rounded-full blur-3xl"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{ 
                        duration: 5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute -bottom-10 -right-10 w-56 h-56 bg-purple-600/30 rounded-full blur-3xl"
                />

                {/* Main Brand Text */}
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                        duration: 1.2, 
                        ease: [0.16, 1, 0.3, 1] // Custom spring-like cubic bezier
                    }}
                    className="relative text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-cyan-500 to-purple-600 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                    style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
                >
                    ZYLRON
                </motion.h1>

                {/* Subtitle / Version */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute -right-4 top-0"
                >
                    <span className="text-xs font-mono font-bold text-cyan-400/80 tracking-widest px-2 py-1 bg-cyan-950/50 rounded border border-cyan-800/50">
                        v2.0
                    </span>
                </motion.div>
            </div>

            {/* Futuristic Loading Indicator Container */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="relative z-10 mt-16 flex flex-col items-center gap-6"
            >
                {/* Scanner Line Animation */}
                <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    />
                </div>

                {/* System Status Text */}
                <motion.p 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-xs md:text-sm font-mono tracking-[0.3em] text-cyan-400/80 uppercase font-semibold"
                >
                    Initializing Engine...
                </motion.p>
            </motion.div>
            
            {/* Grid overlay for texture */}
            <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
        </div>
    );
};

export default Loader;
