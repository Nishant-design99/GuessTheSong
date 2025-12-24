import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Eye, Music2, Plus, ShieldCheck, Smartphone, Pause, Volume2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const GameScreen = ({ roundData, roundNumber, totalRounds, onReveal }) => {
    const [isPlayingHint, setIsPlayingHint] = useState(false);
    const [hintTime, setHintTime] = useState(0);
    const [isVerifyVisible, setIsVerifyVisible] = useState(false);
    const [isQRVisible, setIsQRVisible] = useState(false);
    const playerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Generate Host URL
    const hostUrl = (() => {
        try {
            const safeEncode = (str) => btoa(unescape(encodeURIComponent(str)));
            const q = encodeURIComponent(safeEncode(roundData.questionLines[1]));
            const a = encodeURIComponent(safeEncode(roundData.answerLine));
            const s = encodeURIComponent(safeEncode(roundData.songName));
            const baseUrl = window.location.href.split('?')[0];
            return `${baseUrl}?mode=host&q=${q}&a=${a}&s=${s}`;
        } catch (e) {
            console.error("QR Gen Error", e);
            return '';
        }
    })();

    useEffect(() => {
        setIsPlayingHint(false);
        setHintTime(0);
        setIsVerifyVisible(false);
        setIsQRVisible(false);
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
        playerVars: { autoplay: 0 },
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]" />

                {/* Floating music notes */}
                <motion.div
                    animate={{ y: [-10, 10, -10], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-[10%] left-[5%] text-4xl"
                >🎵</motion.div>
                <motion.div
                    animate={{ y: [10, -10, 10], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-[15%] right-[8%] text-3xl"
                >🎶</motion.div>
            </div>

            {/* Hidden Player */}
            {roundData.youtubeId && (
                <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0">
                    <YouTube videoId={roundData.youtubeId} opts={opts} onReady={onPlayerReady} />
                </div>
            )}

            {/* Header */}
            <header className="flex justify-between items-center mb-8 md:mb-12 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10"
                >
                    <span className="text-white/60 uppercase text-xs font-bold tracking-wider">Round</span>
                    <div className="text-white font-black text-2xl">
                        {roundNumber} <span className="text-white/40 font-normal text-lg">/ {totalRounds}</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10"
                >
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isPlayingHint ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                        <span className="text-cyan-300 font-bold text-sm md:text-base">
                            {isPlayingHint ? '♫ Playing...' : 'Guess the Song'}
                        </span>
                    </div>
                </motion.div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center z-10 relative">
                {/* Host Tools */}
                <div className="absolute top-0 right-0 z-50 flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsQRVisible(!isQRVisible)}
                            className={clsx(
                                "p-2.5 transition-all rounded-xl",
                                isQRVisible
                                    ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                                    : "bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10"
                            )}
                            title="Host Companion"
                        >
                            <Smartphone size={18} />
                        </button>
                        <button
                            onClick={() => setIsVerifyVisible(!isVerifyVisible)}
                            className={clsx(
                                "p-2.5 transition-all rounded-xl",
                                isVerifyVisible
                                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                                    : "bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10"
                            )}
                            title="Verify Answer"
                        >
                            <ShieldCheck size={18} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {isQRVisible && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="bg-white p-4 rounded-2xl shadow-2xl"
                            >
                                <div className="mb-2 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
                                    Scan for Answer
                                </div>
                                <QRCodeSVG value={hostUrl} size={140} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isVerifyVisible && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-dark rounded-2xl p-4 max-w-xs text-left"
                            >
                                <div className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-2">🔒 Host Check</div>
                                <div className="group cursor-help relative">
                                    <div className="text-white/0 select-none group-hover:text-white transition-all duration-300 font-bold blur-md group-hover:blur-0 text-lg">
                                        {roundData.answerLine}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-mono group-hover:opacity-0 transition-opacity">
                                        [ HOVER TO REVEAL ]
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Question Display */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={roundData.questionLines[0]}
                    className="mb-12 w-full max-w-4xl"
                >
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
                        <span className="text-white/40 text-sm uppercase tracking-[0.3em] font-medium">
                            Complete the Lyrics
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        {roundData.questionLines.map((line, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative"
                            >
                                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight px-4">
                                    <span className="text-white/30">"</span>
                                    {line}
                                    <span className="text-white/30">"</span>
                                </h3>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mystery line */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 relative"
                    >
                        <div className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
                            ? ? ?
                        </div>
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-48 h-16 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl rounded-full" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
                    <div className="flex-[2] flex flex-col sm:flex-row gap-3">
                        {/* Play Hint Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => playHint(20, true)}
                            disabled={isPlayingHint || !roundData.youtubeId}
                            className={clsx(
                                "flex-1 py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all border-2",
                                isPlayingHint
                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                    : "bg-white/5 border-white/10 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
                            )}
                        >
                            {isPlayingHint ? (
                                <>
                                    <Volume2 className="animate-pulse" />
                                    <span>Playing...</span>
                                </>
                            ) : (
                                <>
                                    <Play fill="currentColor" size={20} />
                                    <span>{hintTime === 0 ? "🎧 Play Hint" : "↺ Restart"}</span>
                                </>
                            )}
                        </motion.button>

                        {/* Add More Time Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => playHint(10, false)}
                            disabled={isPlayingHint || !roundData.youtubeId}
                            className={clsx(
                                "flex-1 py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all border-2",
                                isPlayingHint
                                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                                    : "bg-white/5 border-white/10 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30"
                            )}
                        >
                            {isPlayingHint ? (
                                <Music2 className="animate-bounce" size={20} />
                            ) : (
                                <>
                                    <Plus size={20} />
                                    <span>+10 sec</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Reveal Button */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onReveal}
                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg 
                                   bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
                                   hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400
                                   text-white flex items-center justify-center gap-3 
                                   shadow-xl shadow-purple-500/25 relative overflow-hidden"
                    >
                        <Eye size={22} />
                        <span>Reveal Answer</span>
                        <div className="absolute inset-0 animate-shimmer" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default GameScreen;
