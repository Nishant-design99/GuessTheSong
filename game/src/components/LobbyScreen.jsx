import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Copy, Check, Play, Music, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateGameState } from '../services/firebase';

const LobbyScreen = ({ roomId, roomData, onStartGame }) => {
    const [copied, setCopied] = useState(false);
    const [hostCopied, setHostCopied] = useState(false);
    const [showHostQr, setShowHostQr] = useState(false);

    // Derived values
    const players = roomData?.players ? Object.entries(roomData.players) : [];
    const joinUrl = `${window.location.origin}${window.location.pathname}?mode=join&room=${roomId}`;
    const hostUrl = `${window.location.origin}${window.location.pathname}?mode=host&room=${roomId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyHost = () => {
        navigator.clipboard.writeText(hostUrl);
        setHostCopied(true);
        setTimeout(() => setHostCopied(false), 2000);
    };

    const handleStart = () => {
        updateGameState(roomId, { gameState: 'playing' });
        onStartGame();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden h-full">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />

            {/* HOST CONNECT QR OVERLAY */}
            <AnimatePresence>
                {showHostQr && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-8"
                        onClick={() => setShowHostQr(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Host Access</h2>
                                <p className="text-gray-500 text-sm">Scan this to join as Host on your phone</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl w-full flex justify-center">
                                <QRCodeSVG
                                    value={`${window.location.origin}${window.location.pathname}?mode=host&room=${roomId}`}
                                    size={220}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <button
                                onClick={handleCopyHost}
                                className="w-full py-3 bg-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                {hostCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                {hostCopied ? "Link Copied!" : "Copy Host Link"}
                            </button>
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

            <div className="z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

                {/* Left Side: QR & Room Info */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl"
                >
                    <div className="text-center">
                        <h2 className="text-white/60 text-sm uppercase font-bold tracking-widest mb-2">Join the Game</h2>
                        <h1 className="text-4xl font-black text-white mb-6">Scan to Play</h1>

                        <div className="bg-white p-4 rounded-xl shadow-lg mx-auto inline-block">
                            <QRCodeSVG value={joinUrl} size={200} />
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="text-white/40 text-xs uppercase font-bold tracking-wider mb-2 text-left">Room Link</div>
                        <div
                            onClick={handleCopy}
                            className="bg-black/30 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-black/40 transition-colors group mb-4"
                        >
                            <code className="text-cyan-400 font-mono text-sm truncate mr-4">{joinUrl}</code>
                            <div className="text-white/50 group-hover:text-white transition-colors">
                                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            </div>
                        </div>

                        {/* Host QR Button */}
                        <button
                            onClick={() => setShowHostQr(true)}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                        >
                            <ShieldCheck size={16} />
                            Show Host Join Code
                        </button>
                    </div>
                </motion.div>

                {/* Right Side: Players List */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col h-[500px]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                <Users size={24} />
                            </div>
                            <div className="text-left">
                                <div className="text-white text-xl font-bold">Teams Joined</div>
                                <div className="text-white/40 text-sm">Waiting for players...</div>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white font-mono font-bold">
                            {players.length}
                        </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 mb-6">
                        <AnimatePresence mode="popLayout">
                            {players.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/10 rounded-2xl"
                                >
                                    <Music size={48} className="mb-4 opacity-50" />
                                    <p>No teams joined yet</p>
                                </motion.div>
                            ) : (
                                players.map(([id, player], index) => (
                                    <motion.div
                                        key={id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-gradient-to-r from-white/10 to-transparent p-4 rounded-xl border border-white/5 flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-white font-bold text-lg">{player.name}</span>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={players.length === 0}
                        className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${players.length > 0
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl shadow-cyan-500/30 hover:scale-[1.02]'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        <Play fill="currentColor" />
                        Start Game
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default LobbyScreen;
