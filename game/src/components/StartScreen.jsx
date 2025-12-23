import { useState } from 'react';
import { Music, Play, Sparkles, Mic2, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StartScreen = ({ onStart }) => {
    const [rounds, setRounds] = useState(5);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] left-[10%] text-5xl opacity-20"
                >🎵</motion.div>
                <motion.div
                    animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[20%] right-[15%] text-4xl opacity-20"
                >🎤</motion.div>
                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[25%] left-[20%] text-3xl opacity-15"
                >🎶</motion.div>
                <motion.div
                    animate={{ y: [5, -15, 5], x: [-5, 5, -5] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[30%] right-[10%] text-4xl opacity-20"
                >🎧</motion.div>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] right-[25%] text-6xl opacity-10"
                >✨</motion.div>
            </div>

            {/* Glowing orbs background */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/30 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

            {/* Logo/Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-8 relative"
            >
                <div className="p-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full shadow-2xl animate-pulse-glow">
                    <Music size={72} className="text-white drop-shadow-lg" />
                </div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-white/20 rounded-full"
                />
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 relative"
            >
                <span className="gradient-text drop-shadow-2xl">GUESS</span>
                <br />
                <span className="text-white drop-shadow-lg">THE SONG</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-white/70 mb-10 max-w-md flex items-center gap-2 justify-center"
            >
                <Sparkles size={20} className="text-yellow-400" />
                Complete the lyrics & prove you're the ultimate music fan!
                <Sparkles size={20} className="text-yellow-400" />
            </motion.p>

            {/* Game Setup Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-md card-fun p-8 relative z-10"
            >
                {/* Rounds selector */}
                <div className="mb-8">
                    <label className="flex items-center justify-between text-white text-lg font-semibold mb-4">
                        <span className="flex items-center gap-2">
                            <Mic2 size={20} className="text-pink-400" />
                            Number of Rounds
                        </span>
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            {rounds}
                        </span>
                    </label>

                    <div className="relative">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={rounds}
                            onChange={(e) => setRounds(parseInt(e.target.value))}
                            className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer 
                                       [&::-webkit-slider-thumb]:appearance-none 
                                       [&::-webkit-slider-thumb]:w-6 
                                       [&::-webkit-slider-thumb]:h-6 
                                       [&::-webkit-slider-thumb]:rounded-full 
                                       [&::-webkit-slider-thumb]:bg-gradient-to-r 
                                       [&::-webkit-slider-thumb]:from-pink-500 
                                       [&::-webkit-slider-thumb]:to-purple-500
                                       [&::-webkit-slider-thumb]:shadow-lg
                                       [&::-webkit-slider-thumb]:shadow-purple-500/50
                                       [&::-webkit-slider-thumb]:cursor-pointer
                                       [&::-webkit-slider-thumb]:transition-transform
                                       [&::-webkit-slider-thumb]:hover:scale-110"
                        />
                        <div className="flex justify-between text-xs text-white/40 mt-2 px-1">
                            <span>Quick</span>
                            <span>Marathon</span>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStart(rounds)}
                    className="group w-full py-5 text-2xl font-bold rounded-2xl relative overflow-hidden
                               bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 
                               hover:from-emerald-300 hover:via-cyan-400 hover:to-blue-400
                               transition-all shadow-xl shadow-cyan-500/30 
                               flex items-center justify-center gap-3"
                >
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Play fill="currentColor" size={28} />
                    </motion.div>
                    <span>LET'S PLAY!</span>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 animate-shimmer opacity-30" />
                </motion.button>

                {/* Fun hint */}
                <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
                    <Volume2 size={16} />
                    <span>Best played with friends & speakers!</span>
                </div>
            </motion.div>
        </div>
    );
};

export default StartScreen;
