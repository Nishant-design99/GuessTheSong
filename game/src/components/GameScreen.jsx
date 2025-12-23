import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Eye, HelpCircle, Music2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const GameScreen = ({ roundData, roundNumber, totalRounds, onReveal }) => {
    const [isPlayingHint, setIsPlayingHint] = useState(false);
    const [hintTime, setHintTime] = useState(0); // Tracks current playback position for hints
    const playerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Reset state when round changes
    useEffect(() => {
        setIsPlayingHint(false);
        setHintTime(0);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, [roundData]);

    const onPlayerReady = (event) => {
        playerRef.current = event.target;
    };

    const playHint = (duration, fromStart = false) => {
        if (playerRef.current) {
            const startAt = fromStart ? 0 : hintTime;
            setIsPlayingHint(true);
            playerRef.current.seekTo(startAt);
            playerRef.current.playVideo();

            // Clear previous timeout if any
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                playerRef.current.pauseVideo();
                setIsPlayingHint(false);
                setHintTime(startAt + duration);
            }, duration * 1000);
        }
    };

    const opts = {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 0,
        },
    };

    return (
        <div className="flex-1 flex flex-col p-8 relative overflow-hidden">
            {/* Hidden Player for Hint */}
            {roundData.youtubeId && (
                <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0">
                    <YouTube
                        videoId={roundData.youtubeId}
                        opts={opts}
                        onReady={onPlayerReady}
                    />
                </div>
            )}

            <header className="flex justify-between items-center mb-12">
                <div className="bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
                    <span className="text-gray-300 uppercase text-sm font-bold tracking-wider mr-2">Round</span>
                    <span className="text-white font-mono text-xl">{roundNumber} / {totalRounds}</span>
                </div>
                <div className="bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/5 max-w-[50%] truncate">
                    <span className="text-cyan-300 font-bold truncate">Guess the Song</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={roundData.questionLines[0]} // changing key triggers animation
                    className="mb-16 w-full"
                >
                    <h2 className="text-gray-400 text-lg uppercase tracking-[0.2em] mb-6">Complete the Lyrics</h2>
                    <div className="relative inline-block space-y-4">
                        {roundData.questionLines.map((line, idx) => (
                            <h3 key={idx} className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl px-4">
                                "{line}"
                            </h3>
                        ))}
                        <div className="text-6xl md:text-8xl mt-8 font-black text-white/10 animate-pulse">
                            ? ? ?
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl justify-center items-stretch">
                    <div className="flex-[2] flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => playHint(20, true)}
                            disabled={isPlayingHint || !roundData.youtubeId}
                            className={clsx(
                                "flex-1 py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform shadow-xl border border-white/10",
                                isPlayingHint
                                    ? "bg-yellow-500/80 text-white scale-95 cursor-wait"
                                    : "bg-white/10 hover:bg-white/20 text-yellow-300 hover:scale-105"
                            )}
                        >
                            {isPlayingHint ? (
                                <>
                                    <Music2 className="animate-bounce" /> Playing...
                                </>
                            ) : (
                                <>
                                    <Play fill="currentColor" /> {hintTime === 0 ? "Play 20s Hint" : "Restart Hint"}
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => playHint(10, false)}
                            disabled={isPlayingHint || !roundData.youtubeId}
                            className={clsx(
                                "flex-1 py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform shadow-xl border border-white/10",
                                isPlayingHint
                                    ? "bg-cyan-500/80 text-white scale-95 cursor-wait"
                                    : "bg-white/10 hover:bg-white/20 text-cyan-300 hover:scale-105"
                            )}
                        >
                            {isPlayingHint ? (
                                <Music2 className="animate-pulse" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" /> 10s More
                                </>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={onReveal}
                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-purple-500/20"
                    >
                        <Eye /> Reveal Answer
                    </button>
                </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        </div >
    );
};

export default GameScreen;
