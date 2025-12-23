import { useState } from 'react';
import { Music, Play } from 'lucide-react';

const StartScreen = ({ onStart }) => {
    const [rounds, setRounds] = useState(5);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="mb-10 p-6 bg-white/10 rounded-full shadow-lg backdrop-blur-sm animate-bounce-slow">
                <Music size={64} className="text-white" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 drop-shadow-2xl tracking-tight">
                GUESS THE SONG
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-12 font-light max-w-2xl">
                Test your lyrical knowledge! Can you guess the next line?
            </p>

            <div className="w-full max-w-md bg-black/40 p-8 rounded-2xl backdrop-blur-md border border-white/10">
                <label className="block text-white text-lg font-semibold mb-4">
                    Number of Rounds: <span className="text-cyan-400 text-2xl ml-2">{rounds}</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-8"
                />

                <button
                    onClick={() => onStart(rounds)}
                    className="group w-full py-4 text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-3"
                >
                    <Play fill="currentColor" />
                    START GAME
                </button>
            </div>
        </div>
    );
};

export default StartScreen;
