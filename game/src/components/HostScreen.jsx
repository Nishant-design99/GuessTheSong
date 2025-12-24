import { useState, useEffect } from 'react';
import { Music2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HostScreen = () => {
    const [data, setData] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            const a = params.get('a');
            const s = params.get('s');

            const safeDecode = (str) => decodeURIComponent(escape(atob(str)));

            if (q && a) {
                setData({
                    question: safeDecode(q),
                    answer: safeDecode(a),
                    songName: s ? safeDecode(s) : null
                });
            }
        } catch (error) {
            console.error("Failed to decode host data", error);
        }
    }, []);

    if (!data) return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
            >
                <Music2 size={48} className="text-purple-400" />
            </motion.div>
            <p className="text-white/60 text-lg">Scan QR code from game screen</p>
            <p className="text-white/40 text-sm mt-2">to see the answer for each round</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white p-5 flex flex-col relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600/20 rounded-full blur-[60px]" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 pb-4 border-b border-white/10 relative z-10"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                        <Music2 size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">Host Mode</div>
                        <h1 className="text-lg font-black">Guess The Song</h1>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1 flex flex-col gap-5 relative z-10">
                {/* Question Card */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm"
                >
                    <h2 className="text-xs uppercase text-white/40 font-bold mb-3 tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-400" />
                        Current Question
                    </h2>
                    <p className="text-lg font-medium text-gray-200 italic leading-relaxed">
                        "{data.question}..."
                    </p>
                </motion.div>

                {/* Answer Card */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 ${showAnswer
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-lg shadow-green-500/10'
                        : 'bg-white/5 border-white/10'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className={`text-xs uppercase font-bold tracking-wider flex items-center gap-2 ${showAnswer ? 'text-green-400' : 'text-white/40'
                            }`}>
                            {showAnswer && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                            The Answer
                        </h2>
                        <button
                            onClick={() => setShowAnswer(!showAnswer)}
                            className={`p-2 rounded-xl transition-all ${showAnswer
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/10 text-white/60 hover:text-white'
                                }`}
                        >
                            {showAnswer ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative min-h-[80px] flex items-center">
                        {showAnswer ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                <div className="text-2xl font-black text-white leading-tight mb-2">
                                    {data.answer}
                                </div>
                                {data.songName && data.songName !== data.answer && (
                                    <div className="flex items-center gap-2 text-sm text-cyan-400 font-medium">
                                        <div className="w-1 h-3 bg-cyan-500/50 rounded-full" />
                                        <span>Song: {data.songName}</span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="text-white/20 text-lg flex items-center gap-2">
                                <Eye size={20} className="text-white/10" />
                                Tap to reveal answer
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Tip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-auto text-center text-white/30 text-xs pt-4"
                >
                    💡 Scan new QR for each round
                </motion.div>
            </main>
        </div>
    );
};

export default HostScreen;
