import { useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { ArrowRight, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultScreen = ({ roundData, onNext, isLast }) => {
    const scrollRef = useRef(null);

    // Scroll to the answer line immediately
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
        playerVars: {
            autoplay: 1, // Auto play full song on reveal
        },
    };

    return (
        <div className="flex-1 flex flex-col p-6 gap-6 h-full overflow-hidden">
            {/* Header: The Answer */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-2"
            >
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-1">The Answer is...</h3>
                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {roundData.songName}
                </h1>
                <p className="text-xl md:text-2xl text-purple-300 font-medium mt-1">{roundData.movie}</p>
            </motion.div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                {/* Left: Lyrics */}
                <div className="flex-[1] bg-black/40 rounded-2xl backdrop-blur-md border border-white/10 overflow-hidden flex flex-col relative min-h-0">
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-white/80 uppercase tracking-widest pl-2">Full Lyrics</h3>
                        <div className="text-xs text-white/40">Scroll to explore</div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-8 text-center space-y-4 custom-scrollbar"
                    >
                        {roundData.allLines.map((line, idx) => {
                            const isQuestion = idx >= roundData.questionStartIndex && idx < roundData.questionStartIndex + 2;
                            const isAnswer = idx === roundData.questionStartIndex + 2;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={isAnswer ? { scale: 1.1, opacity: 0 } : { opacity: 0.5 }}
                                    animate={isAnswer ? { scale: 1, opacity: 1 } : { opacity: isQuestion ? 1 : 0.6 }}
                                    transition={{ duration: 0.5 }}
                                    id={isAnswer ? 'answer-highlight' : undefined}
                                    className={`py-3 px-6 rounded-xl transition-all ${isQuestion
                                        ? 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30 text-2xl'
                                        : isAnswer
                                            ? 'bg-green-500/30 text-green-300 font-black text-4xl border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)] my-6'
                                            : 'text-gray-300 hover:text-white text-xl'
                                        }`}
                                >
                                    {line}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Player & Controls */}
                <div className="flex-[2.5] bg-black/60 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col min-h-0">
                    <div className="flex-1 flex items-center justify-center bg-black">
                        {roundData.youtubeId ? (
                            <YouTube
                                videoId={roundData.youtubeId}
                                opts={opts}
                                className="w-full h-full"
                                containerClassName="w-full h-full"
                            />
                        ) : (
                            <div className="text-white/50 flex flex-col items-center gap-2">
                                <Disc size={64} />
                                <span>Video Unavailable</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-2 shrink-0">
                <button
                    onClick={onNext}
                    className="w-full py-5 bg-white text-gray-900 font-black text-2xl rounded-2xl hover:bg-cyan-50 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 group shrink-0"
                >
                    {isLast ? "Finish Game" : "Next Round"}
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ResultScreen;
