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

export const getRoundData = (song) => {
    const lyrics = song.lyrics;
    // split by newline, filter out:
    // 1. Metadata tags like [ti:Name], [ar:Artist], [al:Album], [00:12.34]
    // 2. Instrumental markers like (Instrumental), (Music), [Music]
    // 3. Very short lines or empty lines
    const lines = lyrics.split('\n')
        .map(line => line.trim())
        .filter(line => {
            if (line.length <= 2) return false;
            // Filter out LRC tags [00:00.00] or metadata [ar:...]
            if (/^\[.*\]/.test(line)) return false;
            // Filter out common metadata identifiers
            if (line.toLowerCase().includes('ti:') || line.toLowerCase().includes('ar:') || line.toLowerCase().includes('al:')) return false;

            // Filter out song structure and instrumental markers
            const lowerLine = line.toLowerCase();
            const markers = [
                'instrumental', 'music', 'interlude', 'bridge',
                'chorus', 'verse', 'intro', 'outro', 'repeat', 'solo'
            ];

            // If the line is JUST a marker like "(Chorus)" or "Chorus:"
            if (markers.some(m => {
                const regex = new RegExp(`^[\\[\\(]?${m}[\\]\\)]?:?$`, 'i');
                return regex.test(lowerLine);
            })) return false;

            // Filter out lines that are just numbers in brackets like [2]
            if (/^\[\d+\]$/.test(line)) return false;

            return true;
        })
        .map(line => {
            // Clean up trailing (x2) or (Repeat) etc.
            return line.replace(/\s*\([\d]?x\d+\)\s*$/i, '')
                .replace(/\s*\(repeat\)\s*$/i, '')
                .trim();
        })
        .filter(line => line.length > 5); // Final check for length after cleaning

    // Need at least 3 lines to have 2 question lines and 1 answer line
    if (lines.length < 3) return null;

    // Pick a random index for the first question line
    // We need i, i+1 (Question) and i+2 (Answer) to be valid indices.
    // So max starting index is length - 3.
    let validIndices = [];
    for (let i = 0; i <= lines.length - 3; i++) {
        // Ensure lines have some reasonable length to be playable
        if (lines[i].length > 5 && lines[i + 1].length > 5 && lines[i + 2].length > 2) {
            validIndices.push(i);
        }
    }

    if (validIndices.length === 0) {
        // Fallback if strict filtering fails
        if (lines.length >= 3) validIndices = [0];
        else return null;
    }

    const questionIndex = validIndices[Math.floor(Math.random() * validIndices.length)];

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

    return {
        songName: song.name,
        movie: song.movie,
        questionLines: [lines[questionIndex], lines[questionIndex + 1]], // Array of 2 lines
        answerLine: lines[questionIndex + 2],
        allLines: lines,
        questionStartIndex: questionIndex, // Track start index
        youtubeId: youtubeId
    };
};
