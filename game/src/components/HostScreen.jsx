import { useState, useEffect } from 'react';
import { ArrowLeft, Wifi, WifiOff, Music2 } from 'lucide-react';

const HostScreen = () => {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Waiting for game...');

    useEffect(() => {
        // First, try to get initial data from URL params (for QR code scan)
        try {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            const a = params.get('a');

            // Safe decoding function
            const safeDecode = (str) => decodeURIComponent(escape(atob(str)));

            if (q && a) {
                setData({
                    question: safeDecode(q),
                    answer: safeDecode(a)
                });
            }
        } catch (error) {
            console.error("Failed to decode host data from URL", error);
        }

        // Set up BroadcastChannel listener for live updates
        const channel = new BroadcastChannel('guess-the-song-host');

        channel.onmessage = (event) => {
            if (event.data.type === 'ROUND_UPDATE') {
                const { questionLine, answerLine, songName, movie, roundNumber, totalRounds } = event.data.data;
                setData({
                    question: questionLine,
                    answer: answerLine,
                    songName,
                    movie,
                    roundNumber,
                    totalRounds
                });
                setIsConnected(true);
                setConnectionStatus('Connected & Synced');
            }
        };

        // Clean up on unmount
        return () => {
            channel.close();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 text-white p-6 flex flex-col">
            <header className="mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Host Companion</div>
                        <h1 className="text-xl font-black flex items-center gap-2">
                            <Music2 size={20} />
                            Guess The Song
                        </h1>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                        {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {connectionStatus}
                    </div>
                </div>
            </header>

            {!data ? (
                <main className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                    <div className="animate-pulse">
                        <WifiOff size={48} className="text-white/30 mx-auto mb-4" />
                        <p className="text-white/50 text-lg">Waiting for game to start...</p>
                        <p className="text-white/30 text-sm mt-2">
                            Keep this screen open. It will sync automatically when a round starts.
                        </p>
                    </div>
                </main>
            ) : (
                <main className="flex-1 flex flex-col gap-6">
                    {/* Round Info */}
                    {data.roundNumber && (
                        <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 flex justify-between items-center">
                            <span className="text-white/40 text-sm font-medium">Round</span>
                            <span className="text-white font-bold text-lg">
                                {data.roundNumber} / {data.totalRounds}
                            </span>
                        </div>
                    )}

                    {/* Question */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xs uppercase text-white/40 font-bold mb-4 tracking-wider">Current Question</h2>
                        <p className="text-xl font-medium text-gray-300 italic">"{data.question}..."</p>
                    </div>

                    {/* Answer */}
                    <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <h2 className="text-xs uppercase text-green-400 font-bold mb-4 tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            The Answer
                        </h2>
                        <p className="text-3xl font-black text-white leading-tight">{data.answer}</p>
                    </div>

                    {/* Song Info */}
                    {data.songName && (
                        <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                            <h2 className="text-xs uppercase text-purple-400 font-bold mb-2 tracking-wider">Song Details</h2>
                            <p className="text-lg font-bold text-white">{data.songName}</p>
                            {data.movie && <p className="text-purple-300 text-sm">{data.movie}</p>}
                        </div>
                    )}

                    <div className="mt-auto text-center text-white/20 text-xs">
                        {isConnected
                            ? "✓ Synced with game. Answer updates automatically."
                            : "Scan QR or open from same browser to sync."}
                    </div>
                </main>
            )}
        </div>
    );
};

export default HostScreen;
