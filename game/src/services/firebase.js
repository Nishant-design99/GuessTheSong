import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, update, remove, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Room Management
export const createRoom = async (hostId) => {
    const roomRef = push(ref(db, 'rooms'));
    await set(roomRef, {
        hostId,
        createdAt: Date.now(),
        gameState: 'lobby', // lobby, playing, result, finished
        players: {},
        currentRound: 0,
        buzzer: null,
        lockedTeams: {},
        scores: {}
    });
    return roomRef.key;
};

export const joinRoom = async (roomId, playerName) => {
    const playerRef = push(ref(db, `rooms/${roomId}/players`));
    await set(playerRef, {
        name: playerName,
        score: 0,
        joinedAt: Date.now()
    });
    return playerRef.key;
};

export const subscribeToRoom = (roomId, callback) => {
    const roomRef = ref(db, `rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
        callback(snapshot.val());
    });
};

// Game Actions
export const buzz = async (roomId, playerId, teamName) => {
    // Transaction-like check could be better, but simple set for now
    // We check if buzzer is empty first to avoid race conditions in UI only (backend rules better)
    const buzzerRef = ref(db, `rooms/${roomId}/buzzer`);
    const snapshot = await get(buzzerRef);

    if (!snapshot.exists()) {
        await set(buzzerRef, {
            playerId,
            teamName,
            timestamp: Date.now()
        });
        return true;
    }
    return false;
};

export const clearBuzzer = async (roomId) => {
    await set(ref(db, `rooms/${roomId}/buzzer`), null);
};

export const lockTeam = async (roomId, playerId) => {
    await set(ref(db, `rooms/${roomId}/lockedTeams/${playerId}`), true);
};

export const clearLockedTeams = async (roomId) => {
    await set(ref(db, `rooms/${roomId}/lockedTeams`), null);
};

export const updateGameState = async (roomId, statedata) => {
    await update(ref(db, `rooms/${roomId}`), statedata);
};

export const updateScore = async (roomId, playerId, points) => {
    const scoreRef = ref(db, `rooms/${roomId}/players/${playerId}/score`);
    const snapshot = await get(scoreRef);
    const currentScore = snapshot.val() || 0;
    await set(scoreRef, currentScore + points);
};
