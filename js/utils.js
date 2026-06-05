function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function calculateDifficultyRange(level) {
    const ranges = {
        1: { min: 0, max: 10 },
        2: { min: 0, max: 20 },
        3: { min: 0, max: 50 },
        4: { min: 0, max: 100 }
    };
    return ranges[level] || ranges[1];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
        return mins + "分" + secs + "秒";
    }
    return seconds + "秒";
}

function formatDate(date) {
    const d = new Date(date);
    return (d.getMonth() + 1) + "月" + d.getDate() + "日 " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'correct') {
            const notes = [523.25, 659.25, 783.99];
            notes.forEach(function(freq, i) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
            });
        } else if (type === 'wrong') {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(250, audioContext.currentTime);
            osc.frequency.setValueAtTime(180, audioContext.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.4);
        } else if (type === 'streak') {
            const notes = [659.25, 783.99, 987.77, 1318.51];
            notes.forEach(function(freq, i) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.18, audioContext.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.35);
                osc.start(audioContext.currentTime + i * 0.12);
                osc.stop(audioContext.currentTime + i * 0.12 + 0.35);
            });
        } else if (type === 'complete') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach(function(freq, i) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.5);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.5);
            });
        } else if (type === 'checkin') {
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach(function(freq, i) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
            });
        }
    } catch (e) {
    }
}

window.Utils = {
    getRandomInt: getRandomInt,
    shuffleArray: shuffleArray,
    calculateDifficultyRange: calculateDifficultyRange,
    formatTime: formatTime,
    formatDate: formatDate,
    generateId: generateId,
    playSound: playSound
};
