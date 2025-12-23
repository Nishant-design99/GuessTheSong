import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Eye, HelpCircle, Music2, Plus, ShieldCheck, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const GameScreen = ({ roundData, roundNumber, totalRounds, onReveal }) => {
    const [isPlayingHint, setIsPlayingHint] = useState(false);
    const [hintTime, setHintTime] = useState(0); // Tracks current playback position for hints
    const [isVerifyVisible, setIsVerifyVisible] = useState(false); // Host verification toggle
    const [isQRVisible, setIsQRVisible] = useState(false); // Remote host QR code toggle
    const playerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Generate Host URL
    // Generate Host URL
    const hostUrl = (() => {
        try {
            // Safe encoding for Unicode (Hindi) characters
            const safeEncode = (str) => btoa(unescape(encodeURIComponent(str)));

            const q = encodeURIComponent(safeEncode(roundData.questionLines[1]));
            const a = encodeURIComponent(safeEncode(roundData.answerLine));
            const baseUrl = window.location.href.split('?')[0];
            return `${baseUrl}?mode=host&q=${q}&a=${a}`;
        } catch (e) {
            console.error("QR Gen Error", e);
            return '';
        }
    })();

    // Reset state when round changes
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

            <div className="flex-1 flex flex-col items-center justify-center text-center z-10 relative">
                {/* Host Tools: Verify Answer & Remote */}
                <div className="absolute top-0 right-0 z-50 flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsQRVisible(!isQRVisible)}
                            className={clsx(
                                "p-2 transition-colors rounded-full hover:bg-white/10",
                                isQRVisible ? "text-cyan-400 bg-white/10" : "text-white/20 hover:text-white/80"
                            )}
                            title="Host: Remote Companion"
                        >
                            <Smartphone size={20} />
                        </button>
                        <button
                            onClick={() => setIsVerifyVisible(!isVerifyVisible)}
                            className={clsx(
                                "p-2 transition-colors rounded-full hover:bg-white/10",
                                isVerifyVisible ? "text-cyan-400 bg-white/10" : "text-white/20 hover:text-white/80"
                            )}
                            title="Host: Verify Answer"
                        >
                            <ShieldCheck size={20} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {isQRVisible && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                className="bg-white p-4 rounded-xl shadow-2xl origin-top-right mb-2"
                            >
                                <div className="mb-2 text-center text-black/60 text-xs font-bold uppercase tracking-widest">
                                    Scan for Answer
                                </div>
                                <div className="bg-white rounded-lg overflow-hidden">
                                    <QRCodeSVG value={hostUrl} size={150} />
                                </div>
                                <div className="mt-2 text-[10px] text-center text-gray-400 max-w-[150px] leading-tight">
                                    Open on your phone to see the answer securely.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isVerifyVisible && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-4 max-w-xs text-left shadow-2xl"
                            >
                                <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Host Check</div>
                                <div className="group cursor-help relative">
                                    <div className="text-white/0 select-none group-hover:text-white transition-all duration-200 font-bold blur-sm group-hover:blur-0">
                                        {roundData.answerLine}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs font-mono group-hover:opacity-0 pointer-events-none">
                                        [HOVER TO REVEAL]
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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
