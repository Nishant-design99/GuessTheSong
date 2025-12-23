import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import { getRandomSongs, getRoundData } from './utils/songUtils';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, result, finished
  const [rounds, setRounds] = useState(5);
  const [gameSongs, setGameSongs] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentRoundData, setCurrentRoundData] = useState(null);
  const [score, setScore] = useState(0); // Kept for future, though manual scoring mentioned

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
    // If for some reason data is null (bad lyrics), skip or handle? 
    // Ideally create robust data. For now, we assume valid data.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-[85vh] flex flex-col">
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8 animate-fade-in">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Game Over!
            </h1>
            <p className="text-2xl text-white/80">Thank you for playing.</p>
            <button
              onClick={restartGame}
              className="px-8 py-4 bg-white text-purple-900 font-bold text-xl rounded-full hover:bg-gray-100 transition-transform active:scale-95 shadow-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
