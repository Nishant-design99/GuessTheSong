import songsData from '../assets/songs.json';

export const loadSongs = () => {
    return songsData.filter(song =>
        song.lyrics &&
        song.lyrics.trim() !== '' &&
        !song.lyrics.toLowerCase().includes('lyrics not found')
    );
};

export const getRandomSongs = (count) => {
    const allSongs = loadSongs();
    const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allSongs.length));
};

export const getRoundData = (song, mode = 'lyrics') => {
    // Extract YouTube ID from link
    let youtubeId = '';
    try {
        const url = new URL(song.link);
        if (url.hostname === 'youtu.be') {
            youtubeId = url.pathname.slice(1);
        } else {
            youtubeId = url.searchParams.get('v');
        }
    } catch (e) {
        console.error("Invalid YouTube URL", song.link);
    }

    // MODE: SONG GUESSING
    // Just return metadata and let the GameScreen play the audio.
    if (mode === 'song') {
        return {
            songName: song.name,
            movie: song.movie,
            youtubeId: youtubeId,
            type: 'song',
            answerLine: song.name, // The "Answer" is the title itself
            questionLines: [], // No lyrics needed
            allLines: []
        };
    }

    // MODE: LYRICS GUESSING (Default)
    const lyrics = song.lyrics;

    // Cleaning logic for lyrics...
    const lines = lyrics.split('\n')
        .map(line => line.trim())
        .filter(line => {
            if (line.length <= 2) return false;
            if (/^\[.*\]/.test(line)) return false;
            if (line.toLowerCase().includes('ti:') ||
                line.toLowerCase().includes('ar:') ||
                line.toLowerCase().includes('al:')) return false;

            const lowerLine = line.toLowerCase();
            const markers = [
                'instrumental', 'music', 'interlude', 'bridge',
                'chorus', 'verse', 'intro', 'outro', 'repeat', 'solo'
            ];

            if (markers.some(m => {
                const regex = new RegExp(`^[\\[\\(]?${m}[\\]\\)]?:?$`, 'i');
                return regex.test(lowerLine);
            })) return false;

            if (/^\[\d+\]$/.test(line)) return false;

            return true;
        })
        .map(line => {
            return line.replace(/\s*\([\d]?x\d+\)\s*$/i, '')
                .replace(/\s*\(repeat\)\s*$/i, '')
                .trim();
        })
        .filter(line => line.length > 5);

    if (lines.length < 3) return null;

    let validIndices = [];
    for (let i = 0; i <= lines.length - 3; i++) {
        if (lines[i].length > 5 && lines[i + 1].length > 5 && lines[i + 2].length > 2) {
            validIndices.push(i);
        }
    }

    if (validIndices.length === 0) {
        if (lines.length >= 3) validIndices = [0];
        else return null;
    }

    const questionIndex = validIndices[Math.floor(Math.random() * validIndices.length)];

    return {
        songName: song.name,
        movie: song.movie,
        questionLines: [lines[questionIndex], lines[questionIndex + 1]],
        answerLine: lines[questionIndex + 2],
        allLines: lines,
        questionStartIndex: questionIndex,
        youtubeId: youtubeId,
        type: 'lyrics'
    };
};
