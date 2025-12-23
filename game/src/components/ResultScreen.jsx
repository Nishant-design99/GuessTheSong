import { useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { ArrowRight, Disc, Trophy, Music, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultScreen = ({ roundData, onNext, isLast }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            const answerEl = document.getElementById('answer-highlight');
            if (answerEl) {
                answerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [roundData]);

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 1 },
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 h-full overflow-hidden relative">
            {/* Celebration Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />

                {/* Confetti-like elements */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-[5%] left-[10%] text-3xl"
                >🎉</motion.div>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="absolute top-[8%] right-[15%] text-2xl"
                >✨</motion.div>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute top-[10%] left-[60%] text-3xl"
                >🎵</motion.div>
            </div>

            {/* Header: The Answer */}
            <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="text-center relative z-10"
            >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-2 rounded-full border border-emerald-500/30 mb-3">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-emerald-300 font-bold text-sm uppercase tracking-wider">The Answer Is...</span>
                    <Trophy size={16} className="text-yellow-400" />
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2">
                    <span className="gradient-text">{roundData.songName}</span>
                </h1>

                <p className="text-lg md:text-xl text-purple-300 font-medium flex items-center justify-center gap-2">
                    <Music size={18} />
                    {roundData.movie}
                </p>
            </motion.div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 min-h-0 relative z-10">
                {/* Left: Lyrics Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-[1] glass-dark rounded-2xl overflow-hidden flex flex-col min-h-0"
                >
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-white/80 uppercase tracking-widest text-sm flex items-center gap-2">
                            <Sparkles size={16} className="text-yellow-400" />
                            Full Lyrics
                        </h3>
                        <div className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">Scroll to explore</div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 text-center space-y-3 custom-scrollbar"
                    >
                        {roundData.allLines.map((line, idx) => {
                            const isQuestion = idx >= roundData.questionStartIndex && idx < roundData.questionStartIndex + 2;
                            const isAnswer = idx === roundData.questionStartIndex + 2;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={isAnswer ? { scale: 1.1, opacity: 0 } : { opacity: 0.5 }}
                                    animate={isAnswer ? { scale: 1, opacity: 1 } : { opacity: isQuestion ? 1 : 0.5 }}
                                    transition={{ duration: 0.5 }}
                                    id={isAnswer ? 'answer-highlight' : undefined}
                                    className={`py-3 px-5 rounded-xl transition-all ${isQuestion
                                            ? 'bg-amber-500/20 text-amber-200 font-semibold border border-amber-500/30 text-lg md:text-xl'
                                            : isAnswer
                                                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 font-black text-xl md:text-2xl border-2 border-green-500/50 shadow-lg shadow-green-500/20 my-4'
                                                : 'text-gray-400 hover:text-white/80 text-base md:text-lg hover:bg-white/5'
                                        }`}
                                >
                                    {isAnswer && <span className="mr-2">✓</span>}
                                    {line}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Right: Video Player */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex-[2] glass-dark rounded-2xl overflow-hidden flex flex-col min-h-0"
                >
                    <div className="flex-1 flex items-center justify-center bg-black/50 min-h-[200px] md:min-h-0">
                        {roundData.youtubeId ? (
                            <YouTube
                                videoId={roundData.youtubeId}
                                opts={opts}
                                className="w-full h-full"
                                containerClassName="w-full h-full"
                            />
                        ) : (
                            <div className="text-white/50 flex flex-col items-center gap-3 p-8">
                                <div className="p-4 bg-white/10 rounded-full">
                                    <Disc size={48} className="animate-spin-slow" />
                                </div>
                                <span className="text-lg">Video Unavailable</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="shrink-0 relative z-10"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="w-full py-5 rounded-2xl font-black text-xl md:text-2xl 
                               bg-gradient-to-r from-white via-gray-100 to-white
                               text-gray-900 
                               flex items-center justify-center gap-3 
                               shadow-xl shadow-white/20 
                               hover:shadow-white/30
                               transition-all relative overflow-hidden group"
                >
                    <span>{isLast ? "🎊 Finish Game" : "Next Round"}</span>
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                </motion.button>
            </motion.div>
        </div>
    );
};

export default ResultScreen;
