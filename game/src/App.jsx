import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy, Music, Star } from 'lucide-react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import HostScreen from './components/HostScreen';
import { getRandomSongs, getRoundData } from './utils/songUtils';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, result, finished
  const [isHostMode, setIsHostMode] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [gameSongs, setGameSongs] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentRoundData, setCurrentRoundData] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'host') {
      setIsHostMode(true);
    }
  }, []);

  const startGame = (numRounds) => {
    const selectedSongs = getRandomSongs(numRounds);
    setRounds(numRounds);
    setGameSongs(selectedSongs);
    setCurrentRoundIndex(0);
    prepareRound(selectedSongs[0]);
    setGameState('playing');
  };

  const prepareRound = (song) => {
    const data = getRoundData(song);
    setCurrentRoundData(data);
  };

  const handleReveal = () => {
    setGameState('result');
  };

  const nextRound = () => {
    if (currentRoundIndex + 1 < gameSongs.length) {
      setCurrentRoundIndex(prev => prev + 1);
      prepareRound(gameSongs[currentRoundIndex + 1]);
      setGameState('playing');
    } else {
      setGameState('finished');
    }
  };

  const restartGame = () => {
    setGameState('start');
    setGameSongs([]);
    setCurrentRoundIndex(0);
  };

  if (isHostMode) {
    return <HostScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-pink-600/25 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[150px]"
        />
      </div>

      {/* Main container */}
      <div className="w-full max-w-[95vw] glass-dark rounded-3xl shadow-2xl overflow-hidden h-[90vh] flex flex-col relative z-10">
        {gameState === 'start' && <StartScreen onStart={startGame} />}

        {gameState === 'playing' && currentRoundData && (
          <GameScreen
            roundData={currentRoundData}
            roundNumber={currentRoundIndex + 1}
            totalRounds={gameSongs.length}
            onReveal={handleReveal}
          />
        )}

        {gameState === 'result' && currentRoundData && (
          <ResultScreen
            roundData={currentRoundData}
            onNext={nextRound}
            isLast={currentRoundIndex === gameSongs.length - 1}
          />
        )}

        {gameState === 'finished' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            {/* Celebration background */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-[10%] left-[15%] text-5xl"
              >🎉</motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-[15%] right-[20%] text-4xl"
              >🎊</motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-[20%] left-[20%] text-4xl"
              >🏆</motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-[25%] right-[15%] text-5xl"
              >⭐</motion.div>
            </div>

            {/* Trophy icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="mb-8"
            >
              <div className="p-6 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-2xl shadow-orange-500/50">
                <Trophy size={64} className="text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-black mb-4"
            >
              <span className="gradient-text">Game Complete!</span>
            </motion.h1>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-6 mb-8"
            >
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                <div className="text-white/60 text-sm">Rounds Played</div>
                <div className="text-3xl font-black text-white">{gameSongs.length}</div>
              </div>
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-white/70 mb-10 flex items-center gap-2"
            >
              <Star className="text-yellow-400" size={20} />
              Thanks for playing! You're a music superstar!
              <Star className="text-yellow-400" size={20} />
            </motion.p>

            {/* Play Again Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="px-10 py-5 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 
                         text-white font-bold text-xl rounded-2xl 
                         shadow-xl shadow-cyan-500/30
                         flex items-center gap-3 relative overflow-hidden"
            >
              <RefreshCw size={24} />
              <span>Play Again</span>
              <div className="absolute inset-0 animate-shimmer" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
