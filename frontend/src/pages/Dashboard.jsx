import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatWithGemini } from '../services/gemini';
import Sidebar from '../components/Sidebar';
import UserProfileModal from '../components/UserProfileModal';
import SettingsModal from '../components/SettingsModal';
import { useNavigate } from 'react-router-dom';
import { 
    Send, 
    User, 
    Menu, 
    Smile, 
    Mic, 
    Sun, 
    Moon, 
    Settings, 
    Shield, 
    LogOut,
    FileText,
    UploadCloud,
    X,
    ChevronDown,
    Zap,
    Code,
    Sparkles,
    Loader2,
    Download,
    Eye,
    Camera,
    Volume2,
    VolumeX,
    Headphones,
    Copy,
    Check,
    ThumbsUp,
    ThumbsDown,
    FileDown,
    Share2,
    Activity,
    MessageSquare,
    Layout,
    HelpCircle,
    GraduationCap,
    Briefcase,
    ShieldCheck,
    Box,
    Terminal,
    Play,
    Search,
    MicOff,
    Plus,
    Globe,
    Brain,
    Wand2,
    FolderOpen,
    Video,
    Maximize2,
    Minimize2,
    Pin,
    PinOff,
    BarChart3,
    Cpu,
    BellRing,
    SearchCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Joyride } from 'react-joyride';
import CodePreviewModal from '../components/CodePreviewModal';
import CustomPersonaModal from '../components/CustomPersonaModal';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const QUICK_PROMPTS = [
    { label: 'Summarize', text: 'Please summarize the key points of our discussion.' },
    { label: 'Fix Bug', text: 'I have a bug in my code. Can you help me debug and provide the fix?' },
    { label: 'Explain (ELI5)', text: "Explain this concept like I'm five years old." },
    { label: 'Optimize', text: 'Review this code/text and make it more professional and optimized.' }
];
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import ZylronLogo from '../logo.png';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EmojiPicker from 'emoji-picker-react';
import { saveChatToCloud, fetchCloudChats, deleteCloudChat, saveFeedbackToCloud, createPublicShare, createPublicShareWithId } from '../services/firestore';
import ZylronSense from '../components/ZylronSense';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Configure PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DataChart = ({ data }) => {
    return (
        <div className="w-full h-64 mt-4 bg-white/5 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '10px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const SlideDeck = ({ slides }) => {
    const [current, setCurrent] = useState(0);
    return (
        <div className="w-full max-w-2xl mx-auto my-8 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Neural Presentation</span>
                <span className="text-[10px] font-bold text-gray-400">{current + 1} / {slides.length}</span>
            </div>
            <div className="p-8 min-h-[300px] flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500" key={current}>
                <h3 className="text-2xl font-bold mb-4">{slides[current].title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{slides[current].content}</p>
            </div>
            <div className="flex gap-2 p-4 bg-gray-50/50 dark:bg-black/20">
                <button onClick={() => setCurrent(Math.max(0, current - 1))} className="flex-1 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold hover:bg-emerald-50 transition-all disabled:opacity-30" disabled={current === 0}>Previous</button>
                <button onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-30" disabled={current === slides.length - 1}>Next Perspective</button>
            </div>
        </div>
    );
};

const TypewriterMarkdown = ({ text, animate }) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            return;
        }

        setDisplayedText('');
        let i = 0;
        
        // Dynamic Speed Engine: Ensure large responses complete in ~2-3 seconds max
        const framesToComplete = 200; 
        const chunk = Math.max(1, Math.ceil(text.length / framesToComplete));

        const interval = setInterval(() => {
            i += chunk;
            setDisplayedText(text.slice(0, i));
            if (i >= text.length) clearInterval(interval);
        }, 15);

        return () => clearInterval(interval);
    }, [text, animate]);

    return (
        <ReactMarkdown
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const content = String(children).replace(/\n$/, '');

                    if (!inline && match && match[1] === 'chart') {
                        try {
                            const data = JSON.parse(content);
                            return <DataChart data={data} />;
                        } catch (e) {
                            return <code className={className}>{children}</code>;
                        }
                    }

                    if (!inline && match && match[1] === 'slides') {
                        try {
                            const slides = JSON.parse(content);
                            return <SlideDeck slides={slides} />;
                        } catch (e) {
                            return <code className={className}>{children}</code>;
                        }
                    }

                    return !inline && match ? (
                        <div className="relative group/code my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{match[1]}</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(content)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-cyan-400 hover:opacity-70 transition-opacity"
                                >
                                    Copy
                                </button>
                            </div>
                            <SyntaxHighlighter
                                {...props}
                                children={content}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}
                            />
                        </div>
                    ) : (
                        <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-emerald-600 dark:text-cyan-300 font-mono text-xs border border-gray-200 dark:border-gray-700">
                            {children}
                        </code>
                    )
                }
            }}
        >
            {displayedText}
        </ReactMarkdown>
    );
};

const TOUR_STEPS = [
    {
        target: '.sidebar-trigger',
        content: 'Access your full chat history and manage cloud sessions here.',
        skipBeacon: true,
    },
    {
        target: '.upload-area',
        content: 'Drop PDFs or Images here for multimodal analysis. Zylron reads images and documents instantly.',
    },
    {
        target: '.sense-toggle',
        content: 'Activate Zylron Sense for touchless gesture control using your webcam.',
    },
    {
        target: '.persona-selector',
        content: 'Switch between specialized experts like Code Architect, Academic Tutor, or Tech Interviewer.',
    },
    {
        target: '.credits-tracker',
        content: 'Monitor your daily AI usage and SaaS credit balance in real-time.',
    }
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState(localStorage.theme || 'dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Phase 2.6: Ultimate Persona System
    const [persona, setPersona] = useState('standard'); 
    const personaColors = {
        standard: { primary: 'emerald', secondary: 'cyan', glow: 'rgba(0, 255, 255, 0.4)' },
        code_master: { primary: 'blue', secondary: 'indigo', glow: 'rgba(59, 130, 246, 0.5)' },
        sarcastic_genius: { primary: 'amber', secondary: 'orange', glow: 'rgba(245, 158, 11, 0.5)' },
        code_architect: { primary: 'purple', secondary: 'violet', glow: 'rgba(168, 85, 247, 0.5)' },
        academic_tutor: { primary: 'rose', secondary: 'pink', glow: 'rgba(244, 63, 94, 0.5)' },
        tech_interviewer: { primary: 'slate', secondary: 'gray', glow: 'rgba(100, 116, 139, 0.5)' }
    };

    const [isTourActive, setIsTourActive] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isCustomPersonaModalOpen, setIsCustomPersonaModalOpen] = useState(false);
    const [previewCode, setPreviewCode] = useState('');
    const [credits, setCredits] = useState(() => {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('zylron_credits_date');
        // If saved date is different from today → new day → reset credits
        if (savedDate !== today) {
            localStorage.setItem('zylron_credits', '0');
            localStorage.setItem('zylron_credits_date', today);
            return 0;
        }
        return parseInt(localStorage.getItem('zylron_credits')) || 0;
    });
    const [xp, setXp] = useState(() => {
        return parseInt(localStorage.getItem('zylron_xp')) || 0;
    });

    useEffect(() => {
        const today = new Date().toDateString();
        localStorage.setItem('zylron_credits', credits);
        localStorage.setItem('zylron_credits_date', today);
        localStorage.setItem('zylron_xp', xp);
    }, [credits, xp]);

    // Midnight auto-reset: check every minute if day changed
    useEffect(() => {
        const midnightCheck = setInterval(() => {
            const today = new Date().toDateString();
            const savedDate = localStorage.getItem('zylron_credits_date');
            if (savedDate !== today) {
                setCredits(0);
                localStorage.setItem('zylron_credits', '0');
                localStorage.setItem('zylron_credits_date', today);
                setFeedbackToast('🌅 New day! Your 50 daily AI credits have been reset!');
                setTimeout(() => setFeedbackToast(null), 4000);
            }
        }, 60000); // Check every 60 seconds
        return () => clearInterval(midnightCheck);
    }, []);

    const handlePersonaChange = (newPersona) => {
        if (newPersona === persona) return;
        
        setPersona(newPersona);
        setPersonaDropdownOpen(false);
        
        // Visual feedback in chat
        const shiftMessage = { 
            type: 'ai', 
            content: `*Zylron has shifted protocols to **${newPersona.replace('_', ' ').toUpperCase()}** mode.*`, 
            animate: true,
            isSystem: true 
        };
        setMessages(prev => [...prev, shiftMessage]);
    };

    const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
    const [activePdf, setActivePdf] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [pdfContext, setPdfContext] = useState('');
    const [isProcessingDoc, setIsProcessingDoc] = useState(false);
    const [isSenseActive, setIsSenseActive] = useState(false);
    const [isAutoSpeak, setIsAutoSpeak] = useState(false);
    const [isSpeakingIndex, setIsSpeakingIndex] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [feedbackToast, setFeedbackToast] = useState(null);
    const [isMemoryEnabled, setIsMemoryEnabled] = useState(localStorage.memory === 'true');
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Phase 3 States
    const [activeFiles, setActiveFiles] = useState([]); // Multiple PDFs
    const [isContinuousVoice, setIsContinuousVoice] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    // Feature 2: Semantic Memory
    // (isMemoryEnabled already declared above)

    // Feature 3: Prompt Engineering Studio
    const [isPromptStudio, setIsPromptStudio] = useState(false);

    // Feature 10: Global Language Engine
    const [activeLanguage, setActiveLanguage] = useState(localStorage.getItem('zylron_lang') || 'auto');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const LANGUAGES = [
        { code: 'auto', label: '🌐 Auto' },
        { code: 'tamil', label: '🇮🇳 Tamil' },
        { code: 'hindi', label: '🇮🇳 Hindi' },
        { code: 'french', label: '🇫🇷 French' },
        { code: 'spanish', label: '🇪🇸 Spanish' },
        { code: 'german', label: '🇩🇪 German' },
        { code: 'japanese', label: '🇯🇵 Japanese' },
    ];

    // Feature 13: Webcam Vision Live
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const webcamRef = useRef(null);
    const webcamStreamRef = useRef(null);

    // NEW FEATURES
    // Feature A: Focus Mode
    const [isFocusMode, setIsFocusMode] = useState(false);
    // Feature B: Chat Search
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Feature C: Pin Messages
    const [pinnedMessages, setPinnedMessages] = useState([]);
    // Feature D: Chat Statistics Modal
    const [showStatsModal, setShowStatsModal] = useState(false);
    // Feature E: Model Switcher
    const [activeModel, setActiveModel] = useState(localStorage.getItem('zylron_model') || 'gemini-1.5-flash');
    const [showModelMenu, setShowModelMenu] = useState(false);
    // Feature F: Follow-up Suggestions
    const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
    // Feature G: Desktop Notifications
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const dropdownRef = useRef(null);
    const personaRef = useRef(null);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleFeedback = async (messageIdx, type) => {
        if (!user || !currentSessionId) return;
        
        try {
            const updatedMessages = [...messages];
            updatedMessages[messageIdx].feedback = type;
            setMessages(updatedMessages);
            await saveFeedbackToCloud(currentSessionId, updatedMessages);
            
            // Show toast
            setFeedbackToast(type === 'up' ? "Positive feedback recorded! Zylron is pleased. ✨" : "Feedback noted. Zylron will analyze and improve. 🛠️");
            setTimeout(() => setFeedbackToast(null), 3000);
        } catch (error) {
            console.error("Feedback Error:", error);
        }
    };

    const exportToPDF = async () => {
        if (messages.length === 0) return;
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text("Zylron AI Intelligence Report", 20, 30);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 400
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(20, 50, pageWidth - 20, 50);
        
        let yPos = 65;
        
        messages.forEach((msg, idx) => {
            if (msg.isSystem) return;
            
            const role = msg.type === 'user' ? 'YOU:' : 'ZYLRON AI:';
            const content = msg.content;
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(msg.type === 'user' ? 71 : 16, msg.type === 'user' ? 85 : 185, msg.type === 'user' ? 105 : 129);
            doc.text(role, 20, yPos);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 41, 59); // Slate 800
            
            const splitText = doc.splitTextToSize(content, pageWidth - 40);
            doc.text(splitText, 20, yPos + 7);
            
            yPos += (splitText.length * 5) + 20;
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 30;
            }
        });
        
        doc.save(`Zylron_Report_${new Date().getTime()}.pdf`);
    };

    const handleShareChat = async () => {
        if (messages.length === 0) return;
        
        // 1. Instant Local ID Generation
        const publicId = Math.random().toString(36).substring(2, 12);
        const url = `${window.location.origin}/share/${publicId}`;

        try {
            // 2. Instant Feedback & Clipboard Copy (No Waiting)
            await navigator.clipboard.writeText(url);
            setFeedbackToast("Link copied to clipboard! 🔗");

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Zylron AI Chat',
                        text: 'Check out my conversation with Zylron AI!',
                        url: url
                    });
                    // If we reach here, it was successful
                    setFeedbackToast("Shared successfully! ✨");
                } catch (err) {
                    // User cancelled or share failed, but link is already copied
                    console.log("Native share dismissed");
                }
            }

            // Auto-clear toast
            setTimeout(() => setFeedbackToast(null), 4000);

            // 3. Background Sync (Firestore upload happens silently)
            const trimmedMessages = messages.map(m => ({
                type: m.type,
                content: m.content,
                imageUrl: m.imageUrl || null,
                isSystem: m.isSystem || false
            }));
            
            // This happens in the background, we don't 'await' it to keep UI fast
            createPublicShareWithId(publicId, trimmedMessages, persona);

        } catch (error) {
            console.error("Share Error:", error);
            // Final fallback
            navigator.clipboard.writeText(url);
            setFeedbackToast("Link copied to clipboard! 🔗");
            setTimeout(() => setFeedbackToast(null), 3000);
        }
    };

    const toggleMemory = () => {
        const newValue = !isMemoryEnabled;
        setIsMemoryEnabled(newValue);
        localStorage.memory = newValue;
    };

    const detectWebCode = (content) => {
        const patterns = [/<html>/i, /<script>/i, /<div/i, /<svg/i, /<!DOCTYPE/i, /<canvas/i];
        return patterns.some(p => p.test(content));
    };

    const handleCodePreview = (content) => {
        // More robust regex: Matches ```[language] optionally followed by space, then newline, then code
        const codeBlockRegex = /```([a-z]*)[ \t]*\n([\s\S]*?)```/gi;
        let match;
        let htmlContent = "";
        let cssContent = "";
        let jsContent = "";
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            const lang = (match[1] || '').trim().toLowerCase();
            const code = match[2];

            if (lang === 'html') {
                htmlContent += code + "\n";
            } else if (lang === 'css') {
                cssContent += code + "\n";
            } else if (lang === 'js' || lang === 'javascript') {
                jsContent += code + "\n";
            } else {
                // Fallback: sniff content only if lang is missing/unknown
                // Check if it's mostly HTML or just JS containing an HTML string
                const isLikelyJS = code.includes('const ') || code.includes('let ') || code.includes('function') || code.includes('document.');
                
                if (!isLikelyJS && (code.includes('<html') || code.includes('<div') || code.includes('<body'))) {
                    htmlContent += code + "\n";
                } else if (!isLikelyJS && code.includes('{') && code.includes(':')) {
                    cssContent += code + "\n";
                } else {
                    jsContent += code + "\n";
                }
            }
        }

        // Assemble valid HTML document
        let finalCode = htmlContent;
        if (cssContent.trim()) finalCode += `\n<style>\n${cssContent}\n</style>`;
        if (jsContent.trim()) finalCode += `\n<script>\n${jsContent}\n</script>`;

        // Fallback: If no blocks found, use whole content
        if (!finalCode.trim()) finalCode = content;

        setPreviewCode(finalCode.trim());
        setIsCodeModalOpen(true);
    };

    // TTS Logic
    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setIsSpeakingIndex(null);
    };

    const speakText = (text, index) => {
        if (isSpeakingIndex === index) {
            stopSpeech();
            return;
        }

        stopSpeech();

        // Strip markdown and code blocks for clean speech
        const cleanText = text
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`.*?`/g, '') // Remove inline code
            .replace(/[*_#]/g, '') // Remove markdown symbols
            .replace(/https?:\/\/\S+/g, 'link') // Replace URLs
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Voice selection logic
        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(v => 
            v.name.includes('Google UK English Female') || 
            v.name.includes('Microsoft Zira') || 
            v.name.includes('Female') ||
            v.lang.startsWith('en-GB')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        utterance.voice = premiumVoice;
        // Feature 9: Voice Persona Engine — pitch/rate per persona
        const personaVoiceMap = {
            standard:         { rate: 1.0, pitch: 1.0 },
            code_master:      { rate: 1.1, pitch: 0.85 },
            sarcastic_genius: { rate: 1.15, pitch: 1.2 },
            code_architect:   { rate: 0.95, pitch: 0.8 },
            academic_tutor:   { rate: 0.9, pitch: 1.05 },
            tech_interviewer: { rate: 1.0, pitch: 0.9 },
        };
        const voiceSettings = personaVoiceMap[persona] || { rate: 1.0, pitch: 1.0 };
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;

        utterance.onstart = () => setIsSpeakingIndex(index);
        utterance.onend = () => {
            setIsSpeakingIndex(null);
            if (isContinuousVoice) {
                setTimeout(() => startListening(), 500);
            }
        };
        utterance.onerror = () => setIsSpeakingIndex(null);

        window.speechSynthesis.speak(utterance);
    };

    // Sync theme to root HTML
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Image Upload Logic (Base64)
    const handleImageUpload = (file) => {
        setIsProcessingDoc(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            // The result is a Base64 encoded string starting with 'data:image/...;base64,'
            // We strip that prefix to get raw base64 data for the API
            const base64Data = reader.result.split(',')[1];
            setActiveImage({
                url: reader.result, // For UI Preview
                data: base64Data,   // For Gemini API inlineData
                mimeType: file.type,
                name: file.name
            });
            setIsProcessingDoc(false);
        };
        reader.readAsDataURL(file);
    };

    // PDF Extraction Logic
    const extractTextFromPdf = async (file) => {
        setIsProcessingDoc(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                fullText += strings.join(" ") + "\n";
            }
            setPdfContext(prev => prev + "\n" + fullText);
            setActiveFiles(prev => [...prev, { 
                id: Date.now(), 
                name: file.name, 
                size: (file.size / 1024).toFixed(1) + " KB",
                type: 'pdf'
            }]);
            setFeedbackToast(`"${file.name}" added to intelligence library.`);
        } catch (error) {
            console.error("PDF Extraction Error:", error);
            alert("Failed to extract text from PDF. Please try a different file.");
        } finally {
            setIsProcessingDoc(false);
        }
    };

    const removeFile = (id) => {
        const fileToRemove = activeFiles.find(f => f.id === id);
        const newFiles = activeFiles.filter(f => f.id !== id);
        setActiveFiles(newFiles);
        
        // Re-generate context from remaining files
        let newContext = "";
        // Note: In a full production app, we would store the extracted text inside the file object
        // For now, we clear context if no files left, or keep it (simplification)
        if (newFiles.length === 0) setPdfContext("");
        
        setFeedbackToast(`Removed "${fileToRemove?.name}"`);
    };

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (!file) return;
        
        if (file.type === "application/pdf") {
            extractTextFromPdf(file);
        } else if (file.type.startsWith("image/")) {
            handleImageUpload(file);
        } else if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
            // Feature 12: Smart Folder Workspace
            handleZipUpload(file);
        } else {
            alert("Please upload a PDF, Image, or ZIP file.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        noClick: true, // Allow manual upload icon click instead
        accept: { 
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        }
    });

    const removePdf = () => {
        setActivePdf(null);
        setPdfContext('');
    };

    const removeImage = () => {
        setActiveImage(null);
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support the Web Speech API.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            setInput(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiObject) => {
        setInput(prev => prev + emojiObject.emoji);
    };

    // Cloud Persistence Layer (Phase 4)
    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const saveToCloud = async (sessionId, updatedMessages) => {
        if (!user) return;
        
        let chatTitle = 'New Chat';
        const existingSession = history.find(s => s.sessionId === sessionId);
        
        if (existingSession) {
            chatTitle = existingSession.message;
        } else {
            const firstUserMsg = updatedMessages.find(m => m.type === 'user' && !m.isSystem);
            chatTitle = firstUserMsg?.content?.substring(0, 40) || 'New Chat';
            
            if (updatedMessages.filter(m => !m.isSystem).length >= 2) {
                try {
                    const titlePrompt = `Analyze this user request and generate a professional 2-word chat title. Return ONLY the title. Request: ${firstUserMsg.content}`;
                    const generatedTitle = await chatWithGemini(titlePrompt, 'standard');
                    chatTitle = generatedTitle.replace(/["'*\.]/g, '').trim();
                } catch (err) {
                    console.warn("Failed to generate AI title:", err);
                }
            }
        }

        // Optimistic UI Update
        const newSessionData = {
            sessionId,
            message: chatTitle,
            messages: updatedMessages,
            userId: user.uid,
            createdAt: existingSession ? existingSession.createdAt : new Date().toISOString()
        };
        
        setHistory(prev => {
            const idx = prev.findIndex(s => s.sessionId === sessionId);
            if (idx !== -1) {
                const newHistory = [...prev];
                newHistory[idx] = newSessionData;
                return newHistory;
            }
            return [newSessionData, ...prev];
        });

        // Save to Firebase
        await saveChatToCloud(user.uid, sessionId, chatTitle, updatedMessages);
    };

    const fetchHistory = async () => {
        if (!user) return;
        const cloudHistory = await fetchCloudChats(user.uid);
        setHistory(cloudHistory);
    };

    const loadSession = async (sessionId) => {
        const session = history.find(s => s.sessionId === sessionId);
        if (session) {
            setCurrentSessionId(sessionId);
            setMessages(session.messages || []);
            if (window.innerWidth < 1024) setSidebarOpen(false);
            
            // Give time for state to update then scroll
            setTimeout(() => scrollToBottom(), 100);
        }
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]); 
        removePdf();
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    const handleSignOut = () => {
        logout();
    };

    const deleteSession = async (sessionId) => {
        if (!user) return;
        
        // Optimistic UI
        setHistory(prev => prev.filter(s => s.sessionId !== sessionId));
        if (currentSessionId === sessionId) handleNewChat();
        
        // Delete from Firebase
        await deleteCloudChat(sessionId);
    };

    const exportToMarkdown = () => {
        if (messages.length === 0) return;
        
        const session = history.find(s => s.sessionId === currentSessionId);
        const title = session ? session.message.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'zylron_chat';
        
        let mdContent = `# Zylron AI Chat Export\n\n**Date:** ${new Date().toLocaleString()}\n**Persona:** ${persona}\n\n---\n\n`;
        
        messages.forEach(msg => {
            if (msg.isSystem) return;
            const role = msg.type === 'user' ? '**You:**' : '**Zylron AI:**';
            mdContent += `${role}\n\n${msg.content}\n\n---\n\n`;
        });

        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll Monitoring
    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
                setShowScrollButton(!isNearBottom && messages.length > 3);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [messages]);

    // Feature 3: Prompt Engineering Studio — optimize prompt with AI
    const optimizePrompt = async () => {
        if (!input.trim()) return;
        setIsPromptStudio(true);
        try {
            const optimized = await chatWithGemini(
                `You are a world-class prompt engineer. Rewrite the following prompt to be more specific, detailed, and effective for an AI. Return ONLY the optimized prompt, nothing else:\n\n"${input}"`,
                'standard', '', [], null, false
            );
            setInput(optimized.replace(/^"|"$/g, '').trim());
            setFeedbackToast('✨ Prompt optimized to God-Mode!');
            setTimeout(() => setFeedbackToast(null), 3000);
        } catch { setFeedbackToast('Prompt Studio failed. Try again.'); }
        setIsPromptStudio(false);
    };

    // Feature 12: Smart Folder Workspace — JSZip handler
    const handleZipUpload = async (file) => {
        try {
            const JSZip = (await import('jszip')).default;
            const zip = await JSZip.loadAsync(file);
            let structure = `📁 **${file.name}** — Project Structure:\n\n`;
            const fileList = [];
            zip.forEach((path) => fileList.push(path));
            structure += fileList.slice(0, 50).map(f => `• ${f}`).join('\n');
            if (fileList.length > 50) structure += `\n...and ${fileList.length - 50} more files`;
            setPdfContext(prev => prev + '\n\n' + structure);
            setFeedbackToast(`📁 ZIP analyzed: ${fileList.length} files indexed!`);
            setTimeout(() => setFeedbackToast(null), 3000);
        } catch (err) {
            setFeedbackToast('ZIP analysis failed. Check file format.');
        }
    };

    // Feature 13: Webcam Vision Live — toggle webcam
    const toggleWebcam = async () => {
        if (isWebcamActive) {
            webcamStreamRef.current?.getTracks().forEach(t => t.stop());
            setIsWebcamActive(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamStreamRef.current = stream;
            setIsWebcamActive(true);
            setFeedbackToast('📷 Zylron Vision Live activated!');
            setTimeout(() => setFeedbackToast(null), 2000);
        } catch { setFeedbackToast('Camera access denied.'); }
    };

    const sendMessage = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!input.trim() && !activePdf && !activeImage) return;

        // Production Limit Enforcement
        if (credits >= 50) {
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: "⚠️ **Daily Limit Reached.** You have exhausted your 50 free daily AI credits. Please upgrade to Zylron Pro to continue using AI services.",
                animate: false,
                isSystem: true
            }]);
            return;
        }

        const userMsg = input;
        const sessionId = currentSessionId || Date.now().toString();
        if (!currentSessionId) setCurrentSessionId(sessionId);

        // Prep image for Gemini and clear it from UI state immediately
        const imagePayload = activeImage ? {
            inlineData: {
                data: activeImage.data,
                mimeType: activeImage.mimeType
            }
        } : null;
        const imageUrlForUI = activeImage?.url;

        setInput('');
        setActiveImage(null);

        const updatedMessages = [...messages, { 
            type: 'user', 
            content: userMsg, 
            imageUrl: imageUrlForUI || null,
            animate: false,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }];
        setFollowUpSuggestions([]);
        setMessages(updatedMessages);
        setIsLoading(true);

        // Phase 10: Long-term Memory Injection
        let memoryContext = "";
        if (isMemoryEnabled && history.length > 0) {
            const keywords = userMsg.toLowerCase().split(' ').filter(w => w.length > 3);
            const relevantChats = history.filter(chat => 
                keywords.some(k => chat.message.toLowerCase().includes(k))
            ).slice(0, 3);
            
            if (relevantChats.length > 0) {
                memoryContext = "\n\n[LONG-TERM MEMORY: You previously discussed these topics with the user. Use this for context if relevant:]\n" + 
                    relevantChats.map(c => `- ${c.message}`).join('\n');
            }
        }

        // Prep history for Gemini (only text parts to save tokens)
        const geminiHistory = updatedMessages.slice(0, -1).filter(m => m.type !== 'error').map(m => ({
            role: m.type === 'user' ? 'user' : 'model',
            parts: [{ text: m.content || "Attached an image." }]
        })).slice(-10);

        // Phase 3: Image Generation Detection (Robust Neural Trigger)
        const imageTriggers = ['generate image', 'create image', 'draw ', 'show me a picture', 'generate a picture', 'create an image'];
        const isImageRequest = imageTriggers.some(t => userMsg.toLowerCase().includes(t));

        if (isImageRequest) {
            setIsGeneratingImage(true);
            // Extract the actual prompt by removing the triggers
            let imagePrompt = userMsg;
            imageTriggers.forEach(t => {
                imagePrompt = imagePrompt.replace(new RegExp(t, 'gi'), '');
            });
            imagePrompt = imagePrompt.trim() || userMsg;

            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&seed=${Date.now()}&model=flux`;
            
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `🎨 **Zylron Creator** has synthesized your request: "${imagePrompt}"`, 
                imageUrl: imageUrl,
                animate: true 
            }]);
            setIsGeneratingImage(false);
            setIsLoading(false);
            return;
        }

        try {
            const chronosContext = `\n\n[CHRONOS ENGINE: Current local time is ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST). Use this for real-time awareness.]\n`;
            const searchContext = isSearchMode ? "\n\n[SEARCH MODE ACTIVE: You have access to real-time web intelligence. Use the most recent facts.]\n" : "";
            // Feature 10: Global Language Engine
            const langContext = activeLanguage !== 'auto' ? `\n\n[LANGUAGE ENGINE: You MUST respond ENTIRELY in ${activeLanguage}. Do not use any other language.]\n` : "";
            // Feature 14: Zylron Automation — URL context scraping
            const urlRegex = /https?:\/\/[^\s]+/g;
            const detectedUrls = userMsg.match(urlRegex);
            let urlContext = "";
            if (detectedUrls && detectedUrls.length > 0) {
                urlContext = `\n\n[ZYLRON AUTOMATION: User shared these URLs: ${detectedUrls.join(', ')}. Analyze and reference them in your response.]\n`;
            }
            const aiResponse = await chatWithGemini(userMsg || "Please describe this image.", persona, pdfContext + memoryContext + searchContext + chronosContext + langContext + urlContext, geminiHistory, imagePayload, isSearchMode);
            const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const finalMessages = [...updatedMessages, { type: 'ai', content: aiResponse, animate: true, timestamp: ts }];
            
            setMessages(finalMessages);
            setIsLoading(false); // 🔥 Fix: Hide loading dots immediately after main response
            setCredits(prev => Math.min(prev + 1, 50));
            setXp(prev => prev + 10);

            // Feature F: AI Follow-up Suggestions (generate in background)
            chatWithGemini(
                `Based on this AI response, suggest exactly 3 short follow-up questions the user might ask. Return ONLY a JSON array of 3 strings, no explanation: ${aiResponse.slice(0, 300)}`,
                'standard', '', [], null, false
            ).then(suggestionsRaw => {
                const match = suggestionsRaw.match(/\[.*?\]/s);
                if (match) setFollowUpSuggestions(JSON.parse(match[0]).slice(0, 3));
            }).catch(() => setFollowUpSuggestions([]));

            // Feature G: Desktop Notification
            if (notificationsEnabled && document.hidden) {
                new Notification('Zylron AI ⚡', { body: aiResponse.slice(0, 80) + '...', icon: '/logo.png' });
            }
            
            // Auto-speak if enabled or continuous
            if (isAutoSpeak || isContinuousVoice) {
                speakText(aiResponse, finalMessages.length - 1);
            }

            // Run cloud sync asynchronously so it doesn't block the UI loading state
            saveToCloud(sessionId, finalMessages).catch(console.error);
        } catch (error) {
            setMessages(prev => [...prev, { type: 'error', content: error.message }]);
            setIsLoading(false);
        }
    };

    // Feature B2: Keyboard Shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.ctrlKey && e.key === 'Enter') { sendMessage({ preventDefault: () => {} }); }
            if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setMessages([]); setFollowUpSuggestions([]); setCurrentSessionId(null); setFeedbackToast('🆕 New chat started! (Ctrl+K)'); setTimeout(() => setFeedbackToast(null), 2000); }
            if (e.ctrlKey && e.key === '/') { e.preventDefault(); document.getElementById('chat-input-main')?.focus(); }
            if (e.ctrlKey && e.key === 'f') { e.preventDefault(); setShowChatSearch(p => !p); }
            if (e.key === 'Escape') { setShowChatSearch(false); setSearchQuery(''); setIsFocusMode(false); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [input, messages]);

    // Feature G2: Request Desktop Notification permission
    const enableDesktopNotifications = async () => {
        if (!('Notification' in window)) { setFeedbackToast('❌ Browser does not support notifications'); return; }
        const perm = await Notification.requestPermission();
        if (perm === 'granted') { setNotificationsEnabled(true); setFeedbackToast('🔔 Desktop notifications enabled!'); }
        else setFeedbackToast('❌ Notification permission denied');
        setTimeout(() => setFeedbackToast(null), 2500);
    };

    // Compute chat statistics
    const chatStats = {
        totalMessages: messages.filter(m => !m.isSystem).length,
        userMessages: messages.filter(m => m.type === 'user').length,
        aiMessages: messages.filter(m => m.type === 'ai' && !m.isSystem).length,
        wordsGenerated: messages.filter(m => m.type === 'ai').reduce((acc, m) => acc + (m.content?.split(' ').length || 0), 0),
        pinnedCount: pinnedMessages.length,
        currentPersona: persona.replace(/_/g, ' ').toUpperCase(),
        level: Math.floor(Math.sqrt(xp / 100)) + 1,
    };

    return (
        <div 
            className="flex h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-emerald-200 dark:selection:bg-cyan-500/30 transition-colors duration-300"
            style={{ 
                '--persona-color': persona === 'standard' ? '#10b981' : persona === 'code_master' ? '#3b82f6' : '#f59e0b',
                '--persona-glow': personaColors[persona].glow
            }}
        >
            
            {/* Fixed Overlay Sidebar */}
            <div className={`fixed z-40 inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition duration-300 ease-in-out shadow-2xl`}>
                <Sidebar 
                    history={history} 
                    loadSession={loadSession} 
                    handleNewChat={handleNewChat} 
                    currentSessionId={currentSessionId} 
                    deleteSession={deleteSession} 
                    credits={credits} 
                    xp={xp}
                    onShare={handleShareChat}
                    onExportPDF={exportToPDF}
                    onExportMD={exportToMarkdown}
                    onTour={() => setIsTourActive(true)}
                    onAdmin={() => setIsAdminModalOpen(true)}
                />
            </div>

            {/* Click outside to close sidebar overlay on smaller screens or just let user click hamburger */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-30 transition-opacity backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main view container */}
            <div className={`flex-1 flex flex-col h-full relative transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
                
                {/* Top Nav Header - Gemini Style */}
                <div className="sticky top-0 z-40 h-14 sm:h-16 w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-900 flex items-center justify-between px-3 sm:px-6 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 transition-all focus:outline-none sidebar-trigger"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-cyan-400 font-bold drop-shadow-sm">
                            <div className="relative group cursor-pointer">
                                {/* Neural Orbit Ring */}
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full blur-md opacity-40 group-hover:opacity-100 group-hover:blur-lg transition-all duration-700 animate-spin-slow"></div>
                                
                                {/* Logo Container */}
                                <div className="relative h-9 w-9 sm:h-11 sm:w-11 bg-white dark:bg-black rounded-full flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden ring-1 ring-white/10">
                                    <img 
                                        src={ZylronLogo} 
                                        alt="Zylron AI" 
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    {/* Glass Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                </div>

                                {/* Active Status Dot */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 dark:bg-cyan-400 rounded-full border-2 border-white dark:border-black shadow-[0_0_10px_rgba(0,255,255,0.8)]"></div>
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="hidden sm:block text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent leading-none">
                                    Zylron AI
                                </span>
                                <span className="hidden sm:block text-[8px] uppercase tracking-[0.3em] font-black text-gray-400 dark:text-cyan-500/50 mt-0.5">
                                    Neural Operating System
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 relative persona-selector" ref={personaRef}>
                        <button 
                            onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all text-sm font-medium`}
                            style={{ borderColor: `var(--persona-color)` }}
                        >
                            {persona === 'standard' && <><Sparkles size={16} className="text-emerald-500" /> <span className="hidden sm:inline">Standard</span></>}
                            {persona === 'code_master' && <><Code size={16} className="text-blue-500" /> <span className="hidden sm:inline">Code Master</span></>}
                            {persona === 'sarcastic_genius' && <><Zap size={16} className="text-amber-500" /> <span className="hidden sm:inline">Sarcastic Genius</span></>}
                            {persona === 'code_architect' && <><ShieldCheck size={16} className="text-purple-500" /> <span className="hidden sm:inline">Architect</span></>}
                            {persona === 'academic_tutor' && <><GraduationCap size={16} className="text-rose-500" /> <span className="hidden sm:inline">Tutor</span></>}
                            {persona === 'tech_interviewer' && <><Briefcase size={16} className="text-slate-500" /> <span className="hidden sm:inline">Interviewer</span></>}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${personaDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {personaDropdownOpen && (
                            <div className="absolute top-12 left-0 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {[
                                    { id: 'standard', name: 'Standard AI', icon: Sparkles, color: 'text-emerald-600 dark:text-cyan-400' },
                                    { id: 'code_master', name: 'Code Master', icon: Code, color: 'text-blue-600 dark:text-blue-400' },
                                    { id: 'sarcastic_genius', name: 'Sarcastic Genius', icon: Zap, color: 'text-amber-600 dark:text-amber-400' },
                                    { id: 'code_architect', name: 'Code Architect', icon: ShieldCheck, color: 'text-purple-600 dark:text-purple-400' },
                                    { id: 'academic_tutor', name: 'Academic Tutor', icon: GraduationCap, color: 'text-rose-600 dark:text-rose-400' },
                                    { id: 'tech_interviewer', name: 'Tech Interviewer', icon: Briefcase, color: 'text-slate-600 dark:text-slate-400' },
                                ].map((p) => (
                                    <button 
                                        key={p.id}
                                        onClick={() => handlePersonaChange(p.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${persona === p.id ? `${p.color} font-semibold` : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <p.icon size={16} /> {p.name}
                                    </button>
                                ))}
                                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                <button 
                                    onClick={() => { setPersonaDropdownOpen(false); setIsCustomPersonaModalOpen(true); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-600 dark:text-cyan-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 transition-all font-bold"
                                >
                                    <Plus size={16} /> Add Custom Persona
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={() => setIsSenseActive(!isSenseActive)}
                            className={`p-2 rounded-full transition-all focus:outline-none sense-toggle ${isSenseActive ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                            title="Toggle Zylron Sense"
                        >
                            <Eye size={20} />
                        </button>

                        <button 
                            onClick={() => setIsAutoSpeak(!isAutoSpeak)}
                            className={`p-2 rounded-full transition-all focus:outline-none hidden sm:flex ${isAutoSpeak ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                            title="Toggle Auto-Speak (TTS)"
                        >
                            <Headphones size={20} />
                        </button>

                        <button 
                            onClick={handleShareChat}
                            disabled={messages.length === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed flex"
                            title="Share Conversation"
                        >
                            <Share2 size={20} />
                        </button>

                        <button 
                            onClick={exportToPDF}
                            disabled={messages.length === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed flex"
                            title="Download PDF Report"
                        >
                            <FileDown size={20} />
                        </button>

                        <button 
                            onClick={() => setIsSearchMode(!isSearchMode)}
                            className={`p-2 rounded-full transition-all focus:outline-none ${isSearchMode ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                            title="Toggle Live Web Search"
                        >
                            <Search size={20} />
                        </button>

                        <button 
                            onClick={() => {
                                if (isContinuousVoice) {
                                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                                }
                                const newState = !isContinuousVoice;
                                setIsContinuousVoice(newState);
                                localStorage.continuousVoice = newState;
                            }}
                            className={`p-2 rounded-full transition-all focus:outline-none ${isContinuousVoice ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                            title="Toggle Continuous Voice Mode"
                        >
                            <Mic size={20} className={isContinuousVoice ? "animate-pulse" : ""} />
                        </button>

                        <button 
                            onClick={() => setIsTourActive(true)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none hidden sm:flex"
                            title="Start Guided Tour"
                        >
                            <HelpCircle size={20} />
                        </button>

                        {/* Separate Credits and Admin Trigger */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 credits-tracker shadow-inner">
                            <Zap size={14} className="text-emerald-600 dark:text-cyan-400" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{credits}</span>
                        </div>

                        <button 
                            onClick={() => setIsAdminModalOpen(true)}
                            className="p-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-all border border-cyan-500/20 shadow-lg shadow-cyan-500/5 group"
                            title="Admin Diagnostics"
                        >
                            <Activity size={18} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <button 
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none hidden sm:flex"
                            title="Open Settings"
                        >
                            <Settings size={20} />
                        </button>

                        <button 
                            onClick={exportToMarkdown}
                            disabled={messages.length === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex"
                            title="Export to Markdown"
                        >
                            <Download size={20} />
                        </button>

                        {/* Model Switcher */}
                        <div className="relative hidden md:block">
                            <button onClick={() => setShowModelMenu(p => !p)} className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all focus:outline-none ${activeModel.includes('flash') ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/40'}`} title="Switch Gemini Model">
                                <Cpu size={13} />{activeModel.includes('flash') ? 'Flash' : 'Pro'}
                            </button>
                            {showModelMenu && (
                                <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50">
                                    {[{id:'gemini-1.5-flash',label:'⚡ Gemini Flash',sub:'Fast & efficient'},{id:'gemini-1.5-pro',label:'🧠 Gemini Pro',sub:'Smart & capable'}].map(m => (
                                        <button key={m.id} onClick={() => { setActiveModel(m.id); localStorage.setItem('zylron_model', m.id); setShowModelMenu(false); setFeedbackToast(`🤖 Switched to ${m.label}!`); setTimeout(() => setFeedbackToast(null), 2000); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${activeModel === m.id ? 'text-emerald-600 dark:text-cyan-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                            <p className="text-xs font-bold">{m.label}</p>
                                            <p className="text-[10px] text-gray-400">{m.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Search */}
                        <button onClick={() => setShowChatSearch(p => !p)} className={`p-2 rounded-full transition-all focus:outline-none hidden md:flex ${showChatSearch ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`} title="Search Chat (Ctrl+F)">
                            <SearchCheck size={20} />
                        </button>

                        {/* Chat Stats */}
                        <button onClick={() => setShowStatsModal(true)} disabled={messages.length === 0} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 hidden md:flex" title="Chat Statistics">
                            <BarChart3 size={20} />
                        </button>

                        {/* Focus Mode */}
                        <button onClick={() => setIsFocusMode(p => !p)} className={`p-2 rounded-full transition-all focus:outline-none hidden md:flex ${isFocusMode ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`} title="Focus Mode (Esc to exit)">
                            {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>

                        {/* Desktop Notifications */}
                        <button onClick={enableDesktopNotifications} className={`p-2 rounded-full transition-all focus:outline-none hidden md:flex ${notificationsEnabled ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`} title="Desktop Notifications">
                            <BellRing size={20} />
                        </button>

                        <button 
                            onClick={toggleTheme} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)} 
                            className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-black border border-emerald-300 dark:border-cyan-500/50 flex items-center justify-center font-bold text-emerald-700 dark:text-cyan-400 shadow-sm dark:shadow-[0_0_8px_rgba(0,255,255,0.3)] transition-all hover:scale-105 focus:outline-none"
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </button>
                        
                        {/* Profile Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute top-12 right-0 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden py-2 focus:outline-none transition-all z-50">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                                </div>
                                <button onClick={() => { setDropdownOpen(false); setIsProfileModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><User size={16} /> Profile</button>
                                <button onClick={() => { setDropdownOpen(false); setIsSettingsModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Settings size={16} /> Settings</button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/privacy-policy'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Shield size={16} /> Privacy Policy</button>
                                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><LogOut size={16} /> Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div {...getRootProps()} ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 relative scroll-smooth">
                    <input {...getInputProps()} />

                    {/* Chat Search Bar */}
                    {showChatSearch && (
                        <div className="sticky top-0 z-30 mb-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-emerald-300 dark:border-cyan-500/50 rounded-2xl px-4 py-2.5 shadow-lg">
                                <Search size={16} className="text-emerald-500 dark:text-cyan-400 shrink-0" />
                                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search messages... (Esc to close)" className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-white placeholder-gray-400" />
                                {searchQuery && <span className="text-[10px] font-bold text-gray-400">{messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase())).length} found</span>}
                                <button onClick={() => { setShowChatSearch(false); setSearchQuery(''); }} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                            </div>
                        </div>
                    )}

                    {/* Focus Mode Overlay — click to exit */}
                    {isFocusMode && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end justify-center pb-8" onClick={() => setIsFocusMode(false)}>
                            <p className="text-white/50 text-xs">Press Esc or click anywhere to exit Focus Mode</p>
                        </div>
                    )}

                    {/* Drag and Drop Overlay */}
                    {isDragActive && (
                        <div className="absolute inset-0 z-50 bg-emerald-500/10 dark:bg-cyan-500/10 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-emerald-500 dark:border-cyan-400 rounded-3xl m-4 pointer-events-none animate-in fade-in duration-300">
                            <UploadCloud size={64} className="text-emerald-600 dark:text-cyan-400 mb-4 animate-bounce" />
                            <h2 className="text-2xl font-bold text-emerald-700 dark:text-cyan-300">Drop your PDF here</h2>
                            <p className="text-emerald-600 dark:text-cyan-400 opacity-80">Zylron will read and analyze its content</p>
                        </div>
                    )}

                    {messages.length === 0 ? (
                        /* Premium Welcome State — 15 Features Showcase */
                        <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in overflow-y-auto">
                            {/* Logo + Title */}
                            <div className="flex flex-col items-center mb-6 md:mb-8">
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-cyan-500/40 dark:border-cyan-500/40 border-emerald-400/40 shadow-xl dark:shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-neural-pulse bg-gray-50 dark:bg-black flex items-center justify-center p-2">
                                        <img src={ZylronLogo} alt="Zylron AI" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 dark:bg-cyan-400 rounded-full border-2 border-white dark:border-black shadow-lg animate-pulse" />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-cyan-400 dark:via-blue-400 dark:to-emerald-400">
                                        Hello, {user?.name?.split(' ')[0] || 'there'} 👋
                                    </span>
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-lg text-base md:text-lg font-medium">
                                    {activePdf ? `📄 I've analyzed ${activePdf.name}. Ask me anything!` : "Your Neural AI is ready. What can I do for you?"}
                                </p>
                            </div>

                            {/* 15 Feature Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 w-full max-w-5xl mb-6">
                                {[
                                    { icon: '🧠', label: 'AI Personas', desc: '6+ neural modes', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', glow: 'shadow-purple-500/10', action: () => { setFeedbackToast('🧠 Click the "Standard" dropdown in the header to switch AI personas!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '📄', label: 'PDF Analysis', desc: 'Smart doc reader', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10', action: () => { setFeedbackToast('📄 Click the Upload Cloud icon in the input bar to upload a PDF!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '🖼️', label: 'Vision AI', desc: 'Image analysis', color: 'from-blue-500/20 to-sky-500/20', border: 'border-blue-500/30', glow: 'shadow-blue-500/10', action: () => { setFeedbackToast('🖼️ Click the Camera icon in the input bar to upload an image for analysis!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '🎙️', label: 'Voice Input', desc: 'Speech to text', color: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', glow: 'shadow-red-500/10', action: () => { startListening(); setFeedbackToast('🎙️ Listening... speak now!'); setTimeout(() => setFeedbackToast(null), 3000); } },
                                    { icon: '🔊', label: 'Auto-Speak', desc: 'TTS responses', color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', glow: 'shadow-orange-500/10', action: () => { setIsAutoSpeak(p => !p); setFeedbackToast(isAutoSpeak ? '🔇 Auto-Speak OFF' : '🔊 Auto-Speak ON — AI will read all responses!'); setTimeout(() => setFeedbackToast(null), 2500); } },
                                    { icon: '🌐', label: 'Web Search', desc: 'Live internet', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30', glow: 'shadow-amber-500/10', action: () => { setIsSearchMode(p => !p); setFeedbackToast(isSearchMode ? '🔍 Search Mode OFF' : '🌐 Search Mode ON — Zylron uses live web data!'); setTimeout(() => setFeedbackToast(null), 2500); } },
                                    { icon: '👁️', label: 'Zylron Sense', desc: 'Gesture control', color: 'from-cyan-500/20 to-teal-500/20', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/10', action: () => { setFeedbackToast('👁️ Click the Eye icon in the header to activate gesture control!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '💻', label: 'Live Preview', desc: 'Code renderer', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/10', action: () => setInput('Build me a beautiful landing page with HTML, CSS and JavaScript') },
                                    { icon: '📊', label: 'Data Charts', desc: 'AI visualizations', color: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-500/30', glow: 'shadow-teal-500/10', action: () => setInput('Create a data chart showing monthly sales trends for 2024') },
                                    { icon: '🎭', label: 'Custom Persona', desc: 'Build your AI', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', glow: 'shadow-pink-500/10', action: () => { setFeedbackToast('🎭 Click the Persona dropdown → "+ Add Custom Persona" to build your AI!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '✨', label: 'Prompt Studio', desc: 'AI optimizes prompt', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', glow: 'shadow-violet-500/10', action: () => { setFeedbackToast('✨ Type any prompt in the input bar, then click the Wand 🪄 icon to optimize it!'); setTimeout(() => setFeedbackToast(null), 4000); } },
                                    { icon: '🌍', label: 'Language Engine', desc: 'Respond in any lang', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', glow: 'shadow-amber-500/10', action: () => { setFeedbackToast('🌍 Click the Globe icon in the input bar to switch response language!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '📁', label: 'ZIP Workspace', desc: 'Project analyzer', color: 'from-slate-500/20 to-gray-500/20', border: 'border-slate-500/30', glow: 'shadow-slate-500/10', action: () => { setFeedbackToast('📁 Click the Folder icon in the input bar to upload a ZIP project for analysis!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '⚡', label: 'Neural XP', desc: `Level ${Math.floor(Math.sqrt(xp / 100)) + 1} · ${xp} XP`, color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/10', action: () => { setFeedbackToast(`⚡ You are Level ${Math.floor(Math.sqrt(xp / 100)) + 1} with ${xp} XP! Send messages to earn more XP!`); setTimeout(() => setFeedbackToast(null), 3500); } },
                                    { icon: '☁️', label: 'Cloud Sync', desc: 'Auto-saves chats', color: 'from-sky-500/20 to-blue-500/20', border: 'border-sky-500/30', glow: 'shadow-sky-500/10', action: () => { setFeedbackToast('☁️ All your chats auto-sync to Firebase Cloud. Open Sidebar to see history!'); setTimeout(() => setFeedbackToast(null), 3500); } },
                                ].map((feat, i) => (
                                    <button
                                        key={i}
                                        onClick={feat.action}
                                        className={`feature-card group flex flex-col items-start gap-1.5 p-3 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.border} shadow-md ${feat.glow} hover:border-opacity-60 transition-all duration-300 text-left`}
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform duration-300">{feat.icon}</span>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-800 dark:text-white leading-tight">{feat.label}</p>
                                            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{feat.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Quick Action Prompts */}
                            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                                {[
                                    { label: '✨ Generate an image', prompt: 'Generate a stunning futuristic cityscape at night' },
                                    { label: '💡 Explain a concept', prompt: 'Explain quantum computing in simple terms' },
                                    { label: '🔧 Write code', prompt: 'Write a Python web scraper with BeautifulSoup' },
                                    { label: '📊 Analyze data', prompt: 'Create a bar chart showing global temperature rise from 2000-2024' },
                                ].map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(p.prompt)}
                                        className="px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-cyan-900/30 hover:text-emerald-700 dark:hover:text-cyan-300 hover:border-emerald-300 dark:hover:border-cyan-500/50 transition-all duration-300 shadow-sm"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Active Chat Log */
                        <div className="space-y-6 pb-20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} ${msg.isSystem ? 'justify-center my-6' : ''}`}>
                                    {msg.isSystem ? (
                                        <div className="flex items-center gap-4 w-full max-w-xl">
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                                {msg.content.replace(/\*/g, '')}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                                        </div>
                                    ) : (
                                        <div className={`w-full max-w-[95%] md:max-w-[85%] lg:max-w-5xl xl:max-w-6xl flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div 
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 overflow-hidden ${msg.type === 'user' ? 'bg-emerald-100 dark:bg-black border border-emerald-300 dark:border-cyan-500/80 shadow-sm dark:shadow-[0_0_15px_rgba(0,255,255,0.4)]' : msg.type === 'error' ? 'bg-red-100 dark:bg-red-600' : 'bg-gray-100 dark:bg-black border border-gray-300 dark:border-cyan-500/30 shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.2)]'}`}
                                                style={msg.type === 'ai' ? { borderColor: 'var(--persona-color)', boxShadow: `0 0 15px var(--persona-glow)` } : {}}
                                            >
                                                {msg.type === 'user' ? <User size={20} className="text-emerald-700 dark:text-cyan-400 dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" /> : <img src={ZylronLogo} alt="Zylron AI" className="h-8 w-8 rounded-full object-cover" />}
                                            </div>

                                            <div className={`px-5 py-4 rounded-3xl overflow-hidden transition-all duration-300 relative group/msg ${msg.type === 'user'
                                                ? 'bg-emerald-50 dark:bg-black border border-gray-200 dark:border-cyan-500/60 text-black dark:text-white rounded-tr-sm shadow-sm dark:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                                                : msg.type === 'error'
                                                    ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 shadow-sm dark:shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-tl-sm'
                                                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-black dark:text-white rounded-tl-sm shadow-sm dark:shadow-xl'
                                                }`}
                                                style={msg.type === 'ai' ? { 
                                                    borderLeft: `4px solid var(--persona-color)`,
                                                    background: theme === 'dark' 
                                                        ? `linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(0, 0, 0, 0.9))` 
                                                        : `linear-gradient(to bottom right, rgba(255, 255, 255, 1), rgba(243, 244, 246, 0.5))`,
                                                    boxShadow: `0 4px 20px -5px rgba(0, 0, 0, 0.1), 0 0 15px -3px var(--persona-glow)`
                                                } : {}}
                                            >
                                                {msg.type === 'user' ? (
                                                    <div className="flex flex-col gap-3">
                                                        {msg.imageUrl && (
                                                            <div className="relative max-w-sm rounded-xl overflow-hidden border border-gray-200 dark:border-cyan-500/30 shadow-md">
                                                                <img src={msg.imageUrl} alt="Uploaded content" className="w-full h-auto object-cover max-h-[300px]" />
                                                            </div>
                                                        )}
                                                        <p className="whitespace-pre-wrap leading-relaxed">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-4">
                                                        {msg.imageUrl && (
                                                            <div className="relative group/img rounded-2xl overflow-hidden border border-gray-200 dark:border-cyan-500/30 shadow-2xl animate-in zoom-in-95 duration-500">
                                                                <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto object-cover max-h-[500px]" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100 backdrop-blur-[2px]">
                                                                    <button 
                                                                        onClick={async () => {
                                                                            const downloadPromise = async () => {
                                                                                try {
                                                                                    setFeedbackToast("Downloading Zylron Creation... 📥");
                                                                                    const res = await fetch(msg.imageUrl);
                                                                                    if (!res.ok) throw new Error("CORS or Network Error");
                                                                                    const blob = await res.blob();
                                                                                    const url = window.URL.createObjectURL(blob);
                                                                                    const link = document.createElement('a');
                                                                                    link.href = url;
                                                                                    link.download = `zylron-ai-${Date.now()}.jpg`;
                                                                                    link.click();
                                                                                    window.URL.revokeObjectURL(url);
                                                                                    setFeedbackToast("Download Complete! ✨");
                                                                                } catch (e) {
                                                                                    console.warn("Direct download failed, falling back to new tab...");
                                                                                    window.open(msg.imageUrl, '_blank');
                                                                                    setFeedbackToast("Opening in new tab for manual save... 🚀");
                                                                                }
                                                                                setTimeout(() => setFeedbackToast(null), 3000);
                                                                            };
                                                                            downloadPromise();
                                                                        }}
                                                                        className="p-4 bg-white/10 hover:bg-emerald-600 backdrop-blur-xl rounded-full text-white transition-all transform hover:scale-110 shadow-2xl border border-white/20"
                                                                    >
                                                                        <Download size={28} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed prose-p:leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-cyan-400 drop-shadow-none dark:drop-shadow-sm">
                                                            <TypewriterMarkdown text={msg.content} animate={msg.animate} />
                                                        </div>
                                                    </div>
                                                )}

                                                {!msg.isSystem && msg.type !== 'error' && (
                                                    <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between opacity-40 group-hover/msg:opacity-100 transition-all">
                                                        <div className="flex items-center gap-1">
                                                            <button type="button" onClick={() => handleFeedback(idx, 'up')} className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all ${msg.feedback === 'up' ? 'text-emerald-500 dark:text-cyan-400' : 'text-gray-400'}`}>
                                                                <ThumbsUp size={14} fill={msg.feedback === 'up' ? 'currentColor' : 'none'} />
                                                            </button>
                                                            <button type="button" onClick={() => handleFeedback(idx, 'down')} className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all ${msg.feedback === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}>
                                                                <ThumbsDown size={14} fill={msg.feedback === 'down' ? 'currentColor' : 'none'} />
                                                            </button>
                                                            {detectWebCode(msg.content) && (
                                                                <button type="button" onClick={() => handleCodePreview(msg.content)} className="ml-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 dark:bg-cyan-500/10 text-emerald-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-all">
                                                                    <Layout size={12} /> Live Preview
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => copyToClipboard(msg.content, idx)} className={`flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-wider ${copiedIndex === idx ? 'text-emerald-500 dark:text-cyan-400' : 'text-gray-400'}`}>
                                                                {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />} {copiedIndex === idx ? 'Copied' : 'Copy'}
                                                            </button>
                                                            <button type="button" onClick={() => speakText(msg.content, idx)} className={`p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all ${isSpeakingIndex === idx ? 'text-emerald-500 dark:text-cyan-400 animate-pulse' : 'text-gray-400'}`}>
                                                                {isSpeakingIndex === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                                            </button>

                                                            {/* Pin button */}
                                                            {msg.type === 'ai' && !msg.isSystem && (
                                                                <button onClick={() => setPinnedMessages(prev => prev.find(p => p === msg) ? prev.filter(p => p !== msg) : [...prev, msg])} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all" title="Pin message">
                                                                    {pinnedMessages.includes(msg) ? <PinOff size={14} className="text-amber-500" /> : <Pin size={14} className="text-gray-400" />}
                                                                </button>
                                                            )}

                                                            {/* Timestamp */}
                                                            {msg.timestamp && (
                                                                <span className="text-[9px] text-gray-400 dark:text-gray-600 font-bold ml-2 self-center">{msg.timestamp}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] md:max-w-3xl flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-cyan-500/30 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all duration-300 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                                            <img src={ZylronLogo} alt="Zylron AI" className="h-7 w-7 relative object-contain animate-pulse" />
                                        </div>
                                        <div className="px-5 py-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm flex items-center gap-2 shadow-sm dark:shadow-lg">
                                            <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-cyan-500 dark:shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                            <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-cyan-500 dark:shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                            <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-cyan-500 dark:shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />

                            {/* AI Follow-up Suggestions */}
                            {followUpSuggestions.length > 0 && !isLoading && (
                                <div className="flex flex-wrap gap-2 mt-4 mb-2 px-2 animate-in slide-in-from-bottom-3 duration-400">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 self-center">💡 Follow up:</span>
                                    {followUpSuggestions.map((s, i) => (
                                        <button key={i} onClick={() => setInput(s)} className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-cyan-900/30 hover:text-emerald-700 dark:hover:text-cyan-300 hover:border-emerald-300 dark:hover:border-cyan-500/50 transition-all shadow-sm">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Pinned Messages Tray */}
                            {pinnedMessages.length > 0 && (
                                <div className="sticky bottom-0 bg-amber-50/90 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-500/30 backdrop-blur-sm px-4 py-2 z-20">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Pin size={12} className="text-amber-500 shrink-0" />
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{pinnedMessages.length} Pinned</span>
                                        {pinnedMessages.map((m, i) => (
                                            <span key={i} className="text-[10px] bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-300 truncate max-w-[150px]">{m.content?.slice(0, 40)}...</span>
                                        ))}
                                        <button onClick={() => setPinnedMessages([])} className="ml-auto text-[10px] text-amber-500 hover:text-red-500 font-bold">Clear</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Glassmorphism Input Area */}
                <div className="p-2 sm:p-4 bg-transparent relative z-10 w-full mb-1 sm:mb-2">
                    <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-3">
                        
                        {/* Status / Active File Banners */}
                        <div className="flex flex-wrap gap-2 px-1">
                            {isProcessingDoc && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold animate-pulse shadow-sm shadow-emerald-500/10">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Zylron is processing your file...</span>
                                </div>
                            )}
                            {activePdf && !isProcessingDoc && (
                                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-emerald-500/30 dark:border-cyan-500/30 text-emerald-600 dark:text-cyan-400 text-xs font-bold shadow-md animate-in slide-in-from-bottom-2 duration-300">
                                    <FileText size={14} className="text-emerald-500 dark:text-cyan-400" />
                                    <span className="truncate max-w-[150px]">{activePdf.name}</span>
                                    <button onClick={removePdf} className="hover:text-red-500 transition-colors bg-white dark:bg-black rounded-full p-0.5 ml-1">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            {activeImage && !isProcessingDoc && (
                                <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-emerald-500/30 dark:border-cyan-500/30 shadow-md animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                        <img src={activeImage.url} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col pr-1">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Image Ready</span>
                                        <span className="text-[11px] text-emerald-600 dark:text-cyan-400 font-bold truncate max-w-[100px]">{activeImage.name}</span>
                                    </div>
                                    <button onClick={removeImage} className="hover:text-red-500 transition-colors bg-white dark:bg-black rounded-full p-0.5 self-start">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}

                            {activeFiles.length > 0 && !isProcessingDoc && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                    {activeFiles.map(file => (
                                        <div key={file.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-emerald-500/30 dark:border-cyan-500/30 shadow-sm animate-in zoom-in-95 duration-300">
                                            <FileText size={14} className="text-emerald-500 dark:text-cyan-400" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[80px]">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(file.id)} className="hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => { setActiveFiles([]); setPdfContext(''); }} className="text-[10px] font-bold text-red-500 hover:underline px-2 self-center">Clear Library</button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={sendMessage} className="relative group flex items-center gap-2 sm:gap-3 flex-row">
                            <div className="relative flex-1 flex items-center w-full bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.1)] focus-within:shadow-md dark:focus-within:shadow-[0_0_20px_rgba(0,255,255,0.3)] focus-within:border-emerald-300 dark:focus-within:border-cyan-500/50 transition-all duration-300">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-3 z-50 shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                        <EmojiPicker theme={theme === 'dark' ? 'dark' : 'light'} onEmojiClick={onEmojiClick} />
                                    </div>
                                )}
                                {/* Feature 2: Memory | Feature 3: Prompt Studio | Feature 10: Language */}
                                <button type="button" onClick={() => { setIsMemoryEnabled(p => { const v = !p; localStorage.memory = v; return v; }); setFeedbackToast(isMemoryEnabled ? '🧠 Memory OFF' : '🧠 Memory ON — Zylron remembers!'); setTimeout(() => setFeedbackToast(null), 2000); }} className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${isMemoryEnabled ? 'text-emerald-500 dark:text-cyan-400 bg-emerald-50 dark:bg-cyan-400/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Semantic Memory">
                                    <Brain size={24} />
                                </button>

                                <button type="button" onClick={() => { if (!input.trim()) { setFeedbackToast('✨ Type a prompt first, then click Wand to optimize it!'); setTimeout(() => setFeedbackToast(null), 3000); return; } optimizePrompt(); }} disabled={isPromptStudio} className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${isPromptStudio ? 'animate-spin text-purple-500' : 'text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Prompt Engineering Studio — Type a prompt then click to optimize">
                                    <Wand2 size={24} />
                                </button>

                                {/* Language Engine */}
                                <div className="relative">
                                    <button type="button" onClick={() => setShowLangMenu(p => !p)} className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${activeLanguage !== 'auto' ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Global Language Engine">
                                        <Globe size={24} />
                                    </button>
                                    {showLangMenu && (
                                        <div className="absolute bottom-full mb-2 left-0 w-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {LANGUAGES.map(lang => (
                                                <button key={lang.code} type="button" onClick={() => { setActiveLanguage(lang.code); localStorage.setItem('zylron_lang', lang.code); setShowLangMenu(false); setFeedbackToast(`🌐 Language: ${lang.label}`); setTimeout(() => setFeedbackToast(null), 2000); }} className={`w-full text-left px-4 py-2 text-xs font-semibold transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${activeLanguage === lang.code ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {lang.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="pl-4 pr-2 text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 transition-all duration-300 z-10 drop-shadow-none dark:hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] focus:outline-none font-bold"
                                >
                                    <Smile size={24} />
                                </button>
                                
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={activePdf ? `Ask Zylron about ${activePdf.name}...` : activeImage ? "Describe this image..." : "Message Zylron..."}
                                    className="w-full bg-transparent text-gray-800 dark:text-gray-100 py-4 px-3 focus:outline-none placeholder:text-gray-500/70 text-base font-medium"
                                    disabled={isLoading || isProcessingDoc}
                                />
                                
                                <div className="flex items-center pr-2 gap-1 upload-area">
                                    <div className="relative" title="Upload Image">
                                        <div onClick={() => document.getElementById('image-upload').click()} className="p-2 cursor-pointer text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/upload">
                                            <Camera size={24} className="group-hover/upload:scale-110 transition-transform" />
                                        </div>
                                        <input 
                                            id="image-upload" 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => onDrop(e.target.files)} 
                                        />
                                    </div>

                                    <div className="relative" title="Upload Document">
                                        <div onClick={() => document.getElementById('file-upload').click()} className="p-2 cursor-pointer text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/upload">
                                            <UploadCloud size={24} className="group-hover/upload:scale-110 transition-transform" />
                                        </div>
                                        <input 
                                            id="file-upload" 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf" 
                                            onChange={(e) => onDrop(e.target.files)} 
                                        />
                                    </div>

                                    {/* Feature 12: ZIP Upload */}
                                    <div className="relative" title="Upload ZIP Project">
                                        <div onClick={() => document.getElementById('zip-upload').click()} className="p-2 cursor-pointer text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/upload">
                                            <FolderOpen size={22} className="group-hover/upload:scale-110 transition-transform" />
                                        </div>
                                        <input id="zip-upload" type="file" className="hidden" accept=".zip" onChange={(e) => e.target.files[0] && handleZipUpload(e.target.files[0])} />
                                    </div>

                                    {/* Feature 13: Webcam Vision Live */}
                                    <button type="button" onClick={toggleWebcam} className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${isWebcamActive ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Zylron Vision Live (Webcam)">
                                        <Video size={22} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${isListening ? 'text-red-500 dark:text-cyan-400 bg-red-50 dark:bg-cyan-400/10 animate-pulse shadow-sm dark:shadow-[0_0_20px_rgba(0,255,255,0.6)]' : 'text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm dark:hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]'}`}
                                        title="Use Microphone"
                                    >
                                        <Mic size={24} className={isListening ? "drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" : ""} />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || isProcessingDoc || (!input.trim() && !activePdf)}
                                className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-600 dark:bg-black border border-emerald-500 dark:border-cyan-500/50 hover:bg-emerald-500 dark:hover:bg-cyan-950 text-white dark:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md dark:shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] flex items-center justify-center focus:outline-none"
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin text-white dark:text-cyan-400" /> : <Send size={24} className="drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] ml-1" />}
                            </button>
                        </form>

                        {/* Webcam Vision Live Preview */}
                        {isWebcamActive && (
                            <div className="relative w-full rounded-2xl overflow-hidden border border-pink-500/30 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
                                <video ref={el => { if (el && webcamStreamRef.current) el.srcObject = webcamStreamRef.current; el?.play(); }} className="w-full max-h-40 object-cover" autoPlay muted />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <span className="px-2 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full animate-pulse">LIVE</span>
                                    <button onClick={toggleWebcam} className="p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all"><X size={12} /></button>
                                </div>
                            </div>
                        )}
                        {/* Quick Prompt Library - Relocated to Bottom for 'Cinematic' layout */}
                        <div className="flex gap-2 w-full max-w-full overflow-x-auto pt-2 scrollbar-hide px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {QUICK_PROMPTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(qp.text)}
                                    className="whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-white/40 dark:bg-gray-900/30 backdrop-blur-md border border-gray-100 dark:border-gray-800/50 text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 hover:text-emerald-600 dark:hover:text-cyan-400 transition-all duration-300 shadow-sm"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
            {/* Zylron Sense HCI Component */}
            {isSenseActive && (
                <ZylronSense 
                    onSendTrigger={() => sendMessage({ preventDefault: () => {} })}
                    onClose={() => setIsSenseActive(false)}
                    scrollContainerRef={scrollContainerRef}
                />
            )}

            {/* Modals & Overlays */}
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)} 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMemoryEnabled={isMemoryEnabled}
                toggleMemory={toggleMemory}
                tourClass="credits-tracker"
                credits={credits}
            />

            <CodePreviewModal 
                isOpen={isCodeModalOpen} 
                onClose={() => setIsCodeModalOpen(false)} 
                code={previewCode} 
            />
            <CustomPersonaModal 
                isOpen={isCustomPersonaModalOpen} 
                onClose={() => setIsCustomPersonaModalOpen(false)}
                onSave={(newPersona) => {
                    // Update the local colors object for immediate UI response
                    personaColors[newPersona.id] = { 
                        primary: newPersona.color, 
                        secondary: newPersona.color, 
                        glow: `rgba(0, 255, 255, 0.4)` 
                    };
                    handlePersonaChange(newPersona.id);
                }}
            />

            <Joyride
                steps={TOUR_STEPS}
                run={isTourActive}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                onEvent={(data) => {
                    if (data.status === 'finished' || data.status === 'skipped') {
                        setIsTourActive(false);
                    }
                }}
                styles={{
                    options: {
                        primaryColor: theme === 'dark' ? '#06b6d4' : '#10b981',
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                        textColor: theme === 'dark' ? '#fff' : '#333',
                        arrowColor: theme === 'dark' ? '#0f172a' : '#fff',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                        borderRadius: '20px',
                        padding: '10px'
                    },
                    buttonNext: {
                        borderRadius: '12px',
                        padding: '10px 20px',
                        fontWeight: 'bold'
                    }
                }}
            />

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-4 sm:bottom-32 sm:right-6 z-30 p-3.5 rounded-full bg-emerald-600 dark:bg-cyan-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce border-2 border-white/20"
                >
                    <ChevronDown size={24} className="animate-pulse" />
                </button>
            )}

            {/* Feedback Toast */}
            {feedbackToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-white/90 dark:bg-black/80 backdrop-blur-md border border-emerald-500/50 dark:border-cyan-500/50 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
                    <Zap size={18} className="text-emerald-500 dark:text-cyan-400 animate-pulse" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{feedbackToast}</span>
                </div>
            )}

            {/* Admin Intelligence Dashboard */}
            <AnimatePresence>
                {isAdminModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdminModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-cyan-500/10 rounded-2xl">
                                            <Activity className="text-cyan-500" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Intelligence</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest mt-1">Zylron System Diagnostics</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsAdminModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-cyan-400 mb-2">
                                            <Zap size={16} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Credit Balance</span>
                                        </div>
                                        <div className="text-3xl font-bold dark:text-white mb-1">{credits} <span className="text-sm font-normal text-gray-400">Tokens</span></div>
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-4">
                                            <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]" style={{ width: `${(credits/50)*100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl">
                                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                                            <MessageSquare size={16} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Interactions</span>
                                        </div>
                                        <div className="text-3xl font-bold dark:text-white mb-1">{messages.length} <span className="text-sm font-normal text-gray-400">Nodes</span></div>
                                        <p className="text-xs text-gray-500 mt-2">Active across {history.length} unique cloud sessions.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                            <span className="text-sm dark:text-gray-300">Gemini 2.5 Flash-Lite</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Operational</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                            <span className="text-sm dark:text-gray-300">Zylron Search Engine</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-cyan-500 uppercase">Connected</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                                <button 
                                    onClick={() => setIsAdminModalOpen(false)}
                                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-80 transition-all"
                                >
                                    Dismiss Diagnostics
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Chat Statistics Modal */}
            {showStatsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowStatsModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} className="text-emerald-500 dark:text-cyan-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Chat Statistics</h3>
                            </div>
                            <button onClick={() => setShowStatsModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            {[
                                { label: 'Total Messages', value: chatStats.totalMessages, color: 'text-emerald-500 dark:text-cyan-400' },
                                { label: 'Your Messages', value: chatStats.userMessages, color: 'text-blue-500' },
                                { label: 'AI Responses', value: chatStats.aiMessages, color: 'text-purple-500' },
                                { label: 'Words Generated', value: chatStats.wordsGenerated.toLocaleString(), color: 'text-amber-500' },
                                { label: 'Neural XP', value: `${xp} XP`, color: 'text-yellow-500' },
                                { label: 'Level', value: `Level ${chatStats.level}`, color: 'text-rose-500' },
                                { label: 'Pinned Messages', value: chatStats.pinnedCount, color: 'text-orange-500' },
                                { label: 'Active Persona', value: persona.replace(/_/g,' '), color: 'text-teal-500' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 text-center">
                                    <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-4 text-center">
                            <p className="text-[10px] text-gray-400">📊 Keep chatting to grow your stats!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
