import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Music, Star, RefreshCw } from 'lucide-react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import HostScreen from './components/HostScreen';
import LobbyScreen from './components/LobbyScreen';
import PlayerScreen from './components/PlayerScreen';
import { getRandomSongs, getRoundData } from './utils/songUtils';
import { createRoom, subscribeToRoom, updateGameState, clearBuzzer, clearLockedTeams } from './services/firebase';

function App() {
  const [gameState, setGameState] = useState('start'); // start, lobby, playing, result, finished

  // App Modes
  const [isHostMode, setIsHostMode] = useState(false);
  const [isPlayerMode, setIsPlayerMode] = useState(false);
  const [isJoinMode, setIsJoinMode] = useState(false);

  // Game Data
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [rounds, setRounds] = useState(5);
  const [gameMode, setGameMode] = useState('lyrics'); // lyrics/song
  const [gameSongs, setGameSongs] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentRoundData, setCurrentRoundData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const room = params.get('room');

    if (mode === 'host') {
      setIsHostMode(true);
    } else if (mode === 'player' || mode === 'join') {
      setIsPlayerMode(true);
      setRoomId(room);
    }
  }, []);

  // Sync Room Data if Room Exists
  useEffect(() => {
    if (roomId) {
      const unsubscribe = subscribeToRoom(roomId, (data) => {
        setRoomData(data);
        if (data && data.gameState) {
          // Sync local game state with firebase
          setGameState(data.gameState);
        }
      });
      return () => unsubscribe();
    }
  }, [roomId]);

  // --- HOST ACTIONS ---

  const handleCreateLobby = async (numRounds, mode) => {
    try {
      // 1. Create Room
      const newRoomId = await createRoom('host_user');
      setRoomId(newRoomId);

      // 2. Setup Local Data
      setRounds(numRounds);
      setGameMode(mode);
      const selectedSongs = getRandomSongs(numRounds);
      setGameSongs(selectedSongs);
      setCurrentRoundIndex(0);

      // 3. Move to Lobby
      setGameState('lobby');
    } catch (e) {
      console.error("Failed to create room", e);
      alert(`Failed to create room: ${e.message}\nPlease check your .env file credentials.`);
    }
  };

  const handleStartGame = () => {
    // Determine first round
    if (gameSongs.length > 0) {
      const firstRound = getRoundData(gameSongs[0], gameMode);
      setCurrentRoundData(firstRound);
      // Update Firebase
      updateGameState(roomId, {
        gameState: 'playing',
        currentRound: 1,
        totalRounds: rounds,
        currentQuestion: firstRound
      });
      setGameState('playing');
    }
  };

  const handleReveal = () => {
    setGameState('result');
    updateGameState(roomId, { gameState: 'result' });
  };

  const nextRound = async () => {
    if (currentRoundIndex + 1 < gameSongs.length) {
      const nextIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIndex);
      const nextData = getRoundData(gameSongs[nextIndex], gameMode);
      setCurrentRoundData(nextData);

      // Reset Firebase stuff
      await clearBuzzer(roomId);
      await clearLockedTeams(roomId);
      await updateGameState(roomId, {
        gameState: 'playing',
        currentRound: nextIndex + 1,
        currentQuestion: nextData
      });

      setGameState('playing');
    } else {
      setGameState('finished');
      updateGameState(roomId, { gameState: 'finished' });
    }
  };

  const restartGame = () => {
    setGameState('start');
    setGameSongs([]);
    setCurrentRoundIndex(0);
    setRoomId(null);
    setRoomData(null);
  };

  // --- RENDER ---

  if (isHostMode) return <HostScreen />;
  if (isPlayerMode) return <PlayerScreen />;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />

      {/* Main container */}
      <div className="w-full max-w-[95vw] glass-dark rounded-3xl shadow-2xl overflow-hidden h-[90vh] flex flex-col relative z-10">

        {gameState === 'start' && <StartScreen onStart={handleCreateLobby} />}

        {gameState === 'lobby' && roomId && (
          <LobbyScreen
            roomId={roomId}
            roomData={roomData}
            onStartGame={handleStartGame}
          />
        )}

        {gameState === 'playing' && currentRoundData && (
          <GameScreen
            roundData={currentRoundData}
            roundNumber={currentRoundIndex + 1}
            totalRounds={gameSongs.length}
            onReveal={handleReveal}
            roomId={roomId}
            roomData={roomData}
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
            {/* End Screen Content (Maintained) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black text-white mb-8"
            >
              Game Over!
            </motion.h1>

            {/* Scoreboard */}
            {roomData?.players && (
              <div className="w-full max-w-2xl bg-white/10 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto">
                {Object.values(roomData.players)
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-2xl text-white/50">#{i + 1}</span>
                        <span className="font-bold text-xl text-white">{p.name}</span>
                      </div>
                      <span className="font-bold text-2xl text-yellow-400">{p.score} pts</span>
                    </div>
                  ))
                }
              </div>
            )}

            <button
              onClick={restartGame}
              className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
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
