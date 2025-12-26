import { useState, useEffect } from 'react';
import { subscribeToRoom, joinRoom, buzz } from '../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mic2, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

const PlayerScreen = () => {
    // URL Params
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');

    // Local State
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId] = useState(localStorage.getItem('gts_player_id'));
    const [joined, setJoined] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToRoom(roomId, (data) => {
            setRoomData(data);
            if (playerId && data?.players?.[playerId]) {
                setJoined(true);
            }
        });

        return () => unsubscribe();
    }, [roomId, playerId]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!playerName.trim()) return;

        try {
            const newId = await joinRoom(roomId, playerName);
            localStorage.setItem('gts_player_id', newId);
            setPlayerId(newId);
            setJoined(true);
        } catch (err) {
            setError('Failed to join room. Try again.');
        }
    };

    const handleBuzz = () => {
        if (canBuzz) {
            // Optimistic update?
            // Vibrate device
            if (navigator.vibrate) navigator.vibrate(200);
            buzz(roomId, playerId, roomData.players[playerId].name);
        }
    };

    if (!roomId) return <div className="p-8 text-white text-center">Invalid Room Link</div>;

    // Computed States
    const isLocked = roomData?.lockedTeams?.[playerId];
    const whoBuzzed = roomData?.buzzer;
    const isMeBuzzed = whoBuzzed?.playerId === playerId;
    const canBuzz = !whoBuzzed && !isLocked && roomData?.gameState === 'playing';

    // --- JOIN SCREEN ---
    if (!joined) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                            <Mic2 className="text-white" size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-white text-center mb-2">Join the Band</h1>
                    <p className="text-white/50 text-center mb-8">Enter your team name to start buzzing!</p>

                    <form onSubmit={handleJoin} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Team Name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 text-lg text-center font-bold"
                            maxLength={15}
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl font-bold text-white text-lg shadow-lg shadow-purple-600/30 active:scale-95 transition-transform"
                        >
                            Join Game
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
                </div>
            </div>
        );
    }

    // --- GAME SCREEN ---
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden safe-area-inset-bottom">
            {/* Status Bar */}
            <header className="px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/5 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                        {roomData?.players?.[playerId]?.name?.[0] || '?'}
                    </div>
                    <span className="text-white font-bold">{roomData?.players?.[playerId]?.name}</span>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm font-mono">
                    Score: {roomData?.players?.[playerId]?.score || 0}
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

                {/* Visual Feedback for State */}
                <AnimatePresence mode="wait">
                    {/* CASE 1: I BUZZED */}
                    {isMeBuzzed && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-center"
                        >
                            <div className="w-48 h-48 bg-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                                <Mic2 size={64} className="text-black" />
                            </div>
                            <h2 className="text-3xl font-black text-yellow-400">YOU BUZZED!</h2>
                            <p className="text-white/60 mt-2">Get ready to answer!</p>
                        </motion.div>
                    )}

                    {/* CASE 2: SOMEONE ELSE BUZZED */}
                    {!isMeBuzzed && whoBuzzed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center w-full max-w-sm"
                        >
                            <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-3xl">
                                <div className="text-red-400 font-bold tracking-widest uppercase mb-2 text-xs">Locked Out</div>
                                <div className="text-2xl font-bold text-white mb-1">{whoBuzzed.teamName}</div>
                                <div className="text-white/50">is answering...</div>
                            </div>
                        </motion.div>
                    )}

                    {/* CASE 3: LOCKED (WRONG ANSWER) */}
                    {isLocked && !whoBuzzed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center w-full max-w-sm"
                        >
                            <div className="bg-gray-800 border border-white/10 p-8 rounded-3xl opacity-50 grayscale">
                                <AlertCircle size={48} className="mx-auto mb-4 text-white" />
                                <h3 className="text-xl font-bold text-white">Locked Out</h3>
                                <p className="text-white/50 mt-2 text-sm">Wait for next round</p>
                            </div>
                        </motion.div>
                    )}

                    {/* CASE 4: ACTIVE BUZZER */}
                    {canBuzz && (
                        <motion.button
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBuzz}
                            className="w-64 h-64 rounded-full bg-gradient-to-b from-red-500 to-rose-700 shadow-[0_10px_0_rgb(159,18,57),0_20px_40px_rgba(225,29,72,0.4)] border-4 border-red-400 flex flex-col items-center justify-center group active:shadow-none active:translate-y-[10px] transition-all"
                        >
                            <Zap size={80} className="text-white drop-shadow-md mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-black text-white uppercase tracking-wider">BUZZ!</span>
                        </motion.button>
                    )}
                </AnimatePresence>

            </main>

            {/* Footer */}
            <div className="p-6 text-center text-white/20 text-xs">
                {roomData?.gameState === 'lobby' ? 'Waiting for host to start...' :
                    roomData?.gameState === 'playing' ? 'Listen closely...' :
                        roomData?.gameState === 'result' ? 'Check the big screen!' : 'Game Over'}
            </div>

        </div>
    );
};

export default PlayerScreen;
