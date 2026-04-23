import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, 
    Loader2, 
    ArrowRight, 
    Github, 
    Facebook, 
    Chrome, 
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import ZylronLogo from '../logo.png';
import { auth } from '../config/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const navigate = useNavigate();
    const { loginWithGoogle, loginWithFacebook, loginWithEmail } = useAuth();

    useEffect(() => {
        // Handle Email Link Sign-In Completion
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');
            if (!emailForSignIn) {
                emailForSignIn = window.prompt('Please provide your email for confirmation');
            }
            
            setIsLoading(true);
            signInWithEmailLink(auth, emailForSignIn, window.location.href)
                .then(() => {
                    window.localStorage.removeItem('emailForSignIn');
                    navigate('/');
                })
                .catch((error) => {
                    setMsg({ type: 'error', text: error.message });
                    setIsLoading(false);
                });
        }
    }, [navigate]);

    const handleSocialLogin = async (provider) => {
        setIsLoading(true);
        setMsg({ type: '', text: '' });
        
        let result;
        if (provider === 'google') result = await loginWithGoogle();
        else if (provider === 'facebook') result = await loginWithFacebook();
        
        if (result?.success) {
            navigate('/');
        } else {
            setMsg({ type: 'error', text: result?.message || 'Authentication failed' });
            setIsLoading(false);
        }
    };

    const handleEmailLink = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        setIsLoading(true);
        setMsg({ type: '', text: '' });
        
        const result = await loginWithEmail(email);
        if (result.success) {
            setMsg({ type: 'success', text: 'Sign-in link sent! Check your inbox.' });
        } else {
            setMsg({ type: 'error', text: result.message });
        }
        setIsLoading(false);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030711] font-sans">
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, -120, 0],
                        x: [0, -80, 0],
                        y: [0, -60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"
                />
            </div>

            {/* Login Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[440px] px-6"
            >
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] ring-1 ring-white/5">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-20 h-20 bg-black rounded-3xl border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden"
                        >
                            <img src={ZylronLogo} alt="Logo" className="w-full h-full object-cover" />
                        </motion.div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                            Zylron <span className="text-emerald-400">AI</span>
                        </h1>
                        <p className="text-gray-400 font-medium text-lg leading-relaxed">
                            Premium Intelligence Ecosystem
                        </p>
                    </div>

                    {/* Messages */}
                    <AnimatePresence mode="wait">
                        {msg.text && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                                    msg.type === 'error' 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}
                            >
                                {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                <span className="text-sm font-medium leading-tight">{msg.text}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleEmailLink} className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 font-medium"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.9)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Send Magic Link</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-[#0b101b] px-4 text-gray-500 rounded-full">Or continue with</span>
                        </div>
                    </div>

                    {/* Social logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl py-3.5 text-white font-semibold transition-all"
                        >
                            <Chrome size={20} className="text-emerald-400" />
                            <span>Google</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl py-3.5 text-white font-semibold transition-all"
                        >
                            <Facebook size={20} className="text-blue-400" />
                            <span>Facebook</span>
                        </motion.button>
                    </div>

                    <p className="mt-10 text-center text-gray-500 text-sm font-medium">
                        Securely encrypted by Zylron Cloud Engine
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
