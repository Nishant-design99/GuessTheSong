import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Eye, Music2, Plus, ShieldCheck, Smartphone, Pause, Volume2, Mic2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { clearBuzzer, lockTeam, updateScore } from '../services/firebase';

const GameScreen = ({ roundData, roundNumber, totalRounds, onReveal, roomId, roomData }) => {
    const [isPlayingHint, setIsPlayingHint] = useState(false);
    const [hintTime, setHintTime] = useState(0);
    const [isVerifyVisible, setIsVerifyVisible] = useState(false);
    const [showHostQr, setShowHostQr] = useState(false);
    const playerRef = useRef(null);
    const timeoutRef = useRef(null);
    const [revealed, setRevealed] = useState(false);

    // Buzzer Logic
    const buzzer = roomData?.buzzer;
    const isBuzzing = !!buzzer;

    // Auto-pause when buzzed
    useEffect(() => {
        if (isBuzzing && isPlayingHint && playerRef.current) {
            playerRef.current.pauseVideo();
            const t = playerRef.current.getCurrentTime(); // Save progress
            setHintTime(t);
            setIsPlayingHint(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [isBuzzing]);

    const handlePlayerReady = (event) => {
        playerRef.current = event.target;
        // If song mode, we might want to start playing automatically? Maybe not.
    };

    const playHint = (duration, fromStart = false) => {
        if (playerRef.current && !isBuzzing) {
            const startAt = fromStart ? 0 : hintTime;
            setIsPlayingHint(true);
            playerRef.current.seekTo(startAt);
            playerRef.current.playVideo();

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                if (playerRef.current) {
                    playerRef.current.pauseVideo();
                    const t = playerRef.current.getCurrentTime();
                    setHintTime(t);
                }
                setIsPlayingHint(false);
            }, duration * 1000);
        }
    };

    const handleCorrect = async () => {
        // Unlock buzzer, giving point to team
        if (buzzer) {
            await updateScore(roomId, buzzer.playerId, 10);
            await clearBuzzer(roomId);
            onReveal(); // Reveal logic
            setRevealed(true);
        }
    };

    const handleWrong = async () => {
        if (buzzer) {
            await lockTeam(roomId, buzzer.playerId);
            await clearBuzzer(roomId);
        }
    };

    const opts = {
        height: '0',
        width: '0',
        playerVars: { autoplay: 0 },
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
            </div>

            {/* Hidden Player */}
            {roundData?.youtubeId && (
                <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0">
                    <YouTube videoId={roundData.youtubeId} opts={opts} onReady={handlePlayerReady} />
                </div>
            )}

            {/* Header */}
            <header className="flex justify-between items-center mb-8 relative z-10">
                <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                    <span className="text-white/60 uppercase text-xs font-bold tracking-wider">Round</span>
                    <div className="text-white font-black text-2xl">
                        {roundNumber} <span className="text-white/40 font-normal text-lg">/ {totalRounds}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHostQr(true)}
                        className="bg-white/10 px-4 py-3 rounded-xl border border-white/10 font-bold text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                        <ShieldCheck size={18} className="text-purple-400" />
                        <span className="hidden md:inline">Host View</span>
                    </button>
                    <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/10 font-mono text-cyan-400 font-bold">
                        Room: {roomId}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">

                {/* BUZZER OVERLAY */}
                <AnimatePresence>
                    {isBuzzing && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
                        >
                            <div className="bg-white text-black p-8 rounded-3xl shadow-2xl text-center min-w-[300px]">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Team Buzzed!</h2>
                                <div className="text-4xl font-black mb-6">{buzzer.teamName}</div>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleWrong}
                                        className="p-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex flex-col items-center gap-1 min-w-[100px]"
                                    >
                                        <XCircle size={32} />
                                        <span className="font-bold">Wrong</span>
                                    </button>
                                    <button
                                        onClick={handleCorrect}
                                        className="p-4 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors flex flex-col items-center gap-1 min-w-[100px]"
                                    >
                                        <CheckCircle size={32} />
                                        <span className="font-bold">Correct</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HOST COMPANION QR OVERLAY */}
                <AnimatePresence>
                    {showHostQr && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8"
                            onClick={() => setShowHostQr(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">Host Companion</h2>
                                    <p className="text-gray-500 text-sm">Scan to see answers & control game</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <QRCodeSVG
                                        value={`${window.location.protocol}//${window.location.host}${window.location.pathname}?mode=host&room=${roomId}`}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowHostQr(false)}
                                    className="w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* GAME CONTENT */}
                <div className="w-full max-w-4xl text-center">

                    {roundData.type === 'lyrics' ? (
                        /* LYRICS MODE UI */
                        <div className="mb-12">
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <span className="text-white/40 text-sm uppercase tracking-[0.3em] font-medium">Complete the Lyrics</span>
                            </div>
                            <div className="space-y-6">
                                {roundData.questionLines.map((line, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.2 }}
                                    >
                                        <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">"{line}"</h3>
                                    </motion.div>
                                ))}
                                <div className="mt-8 text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">? ? ?</div>
                            </div>
                        </div>
                    ) : (
                        /* SONG MODE UI */
                        <div className="mb-12 flex flex-col items-center">
                            <div className="w-64 h-64 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-8 animate-pulse-slow">
                                <Music2 size={84} className="text-white" />
                            </div>
                            <h3 className="text-white/60 text-xl font-medium">Listen & Guess the Song</h3>
                        </div>
                    )}

                    {/* CONTROLS */}
                    <div className="flex gap-4 justify-center mt-8">
                        <button
                            onClick={() => {
                                if (isPlayingHint) {
                                    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
                                        playerRef.current.pauseVideo();
                                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                        const t = playerRef.current.getCurrentTime();
                                        setHintTime(t);
                                        setIsPlayingHint(false);
                                    } else {
                                        setIsPlayingHint(false);
                                    }
                                } else {
                                    playHint(20, false);
                                }
                            }}
                            disabled={isBuzzing}
                            className={clsx(
                                "py-4 px-8 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all border-2",
                                isPlayingHint
                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                    : "bg-white/5 border-white/10 text-amber-400 hover:bg-amber-500/10"
                            )}
                        >
                            {isPlayingHint ? <Pause className="animate-pulse" /> : <Play />}
                            {isPlayingHint ? 'Pause' : 'Play Audio'}
                        </button>

                        <button
                            onClick={onReveal}
                            className="py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-400 hover:to-pink-400"
                        >
                            Reveal Answer
                        </button>
                    </div>

                </div>

            </div>

            {/* LIVE SCOREBOARD FOOTER */}
            {roomData?.players && (
                <div className="shrink-0 mt-6 pt-4 border-t border-white/10 w-full relative z-10">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-widest shrink-0">Live Scores:</div>
                        {Object.values(roomData.players)
                            .sort((a, b) => b.score - a.score)
                            .map((player, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 shrink-0"
                                >
                                    <span className="font-bold text-white text-sm">{player.name}</span>
                                    <div className="h-4 w-px bg-white/20"></div>
                                    <span className="font-mono font-bold text-yellow-400 text-sm">{player.score}</span>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;
