import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const HostScreen = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
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
            console.error("Failed to decode host data", error);
        }
    }, []);

    if (!data) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <p className="text-white/50">Invalid or missing host data.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 text-white p-6 flex flex-col">
            <header className="mb-8 border-b border-white/10 pb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Host Companion</div>
                <h1 className="text-xl font-black">Guess The Song</h1>
            </header>

            <main className="flex-1 flex flex-col gap-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xs uppercase text-white/40 font-bold mb-4 tracking-wider">Current Question</h2>
                    <p className="text-xl font-medium text-gray-300 italic">"{data.question}..."</p>
                </div>

                <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                    <h2 className="text-xs uppercase text-green-400 font-bold mb-4 tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        The Answer
                    </h2>
                    <p className="text-3xl font-black text-white leading-tight">{data.answer}</p>
                </div>

                <div className="mt-auto text-center text-white/20 text-xs">
                    This screen is synced for the host.
                </div>
            </main>
        </div>
    );
};

export default HostScreen;
