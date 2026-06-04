const STORAGE_KEYS = {
    USER_DATA: 'math_land_user_data',
    WRONG_QUESTIONS: 'math_land_wrong_questions',
    PRACTICE_HISTORY: 'math_land_practice_history',
    CHALLENGE_PROGRESS: 'math_land_challenge_progress',
    THEME_DATA: 'math_land_theme_data',
    MEDALS_DATA: 'math_land_medals_data',
    DAILY_TASKS: 'math_land_daily_tasks'
};

function getStoredData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

function getUserData() {
    const defaultData = {
        coins: 0,
        level: 1,
        totalCorrect: 0,
        totalWrong: 0,
        practiceCount: 0
    };
    return getStoredData(STORAGE_KEYS.USER_DATA, defaultData);
}

function saveUserData(data) {
    return setStoredData(STORAGE_KEYS.USER_DATA, data);
}

function getWrongQuestions() {
    return getStoredData(STORAGE_KEYS.WRONG_QUESTIONS, []);
}

function saveWrongQuestions(questions) {
    return setStoredData(STORAGE_KEYS.WRONG_QUESTIONS, questions);
}

function addWrongQuestion(question) {
    const wrongList = getWrongQuestions();
    const exists = wrongList.some(q => 
        q.num1 === question.num1 && 
        q.num2 === question.num2 && 
        q.op === question.op
    );
    if (!exists) {
        wrongList.push(question);
        saveWrongQuestions(wrongList);
    }
}

function clearWrongQuestions() {
    return setStoredData(STORAGE_KEYS.WRONG_QUESTIONS, []);
}

function getPracticeHistory() {
    return getStoredData(STORAGE_KEYS.PRACTICE_HISTORY, []);
}

function addPracticeRecord(record) {
    const history = getPracticeHistory();
    history.unshift(record);
    if (history.length > 100) {
        history.pop();
    }
    return setStoredData(STORAGE_KEYS.PRACTICE_HISTORY, history);
}

function getChallengeProgress() {
    const defaultProgress = {
        groups: [
            { id: 1, levels: [1, 2, 3, 4, 5].map(id => ({ id, completed: id === 1 })) },
            { id: 2, levels: [1, 2, 3, 4, 5].map(id => ({ id, completed: false })) },
            { id: 3, levels: [1, 2, 3, 4, 5].map(id => ({ id, completed: false })) },
            { id: 4, levels: [1, 2, 3, 4, 5].map(id => ({ id, completed: false })) }
        ]
    };
    return getStoredData(STORAGE_KEYS.CHALLENGE_PROGRESS, defaultProgress);
}

function saveChallengeProgress(progress) {
    return setStoredData(STORAGE_KEYS.CHALLENGE_PROGRESS, progress);
}

function getThemeData() {
    const defaultThemes = [
        { id: 1, name: '梦幻紫', icon: '💜', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', price: 0, purchased: true, selected: true },
        { id: 2, name: '清新绿', icon: '💚', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', price: 50, purchased: false, selected: false },
        { id: 3, name: '阳光橙', icon: '🧡', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', price: 50, purchased: false, selected: false },
        { id: 4, name: '海洋蓝', icon: '💙', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', price: 50, purchased: false, selected: false },
        { id: 5, name: '樱花粉', icon: '💗', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', price: 80, purchased: false, selected: false },
        { id: 6, name: '星空黑', icon: '🖤', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', price: 100, purchased: false, selected: false }
    ];
    return getStoredData(STORAGE_KEYS.THEME_DATA, defaultThemes);
}

function saveThemeData(themes) {
    return setStoredData(STORAGE_KEYS.THEME_DATA, themes);
}

function getMedalsData() {
    const defaultMedals = [
        { id: 1, name: '初试牛刀', icon: '🥉', description: '完成第一次练习', unlocked: false },
        { id: 2, name: '小试锋芒', icon: '🥈', description: '累计答对100题', unlocked: false },
        { id: 3, name: '崭露头角', icon: '🥇', description: '累计答对500题', unlocked: false },
        { id: 4, name: '计算小能手', icon: '⭐', description: '连续答对20题', unlocked: false },
        { id: 5, name: '全对达人', icon: '🏆', description: '完成一次全对练习', unlocked: false },
        { id: 6, name: '挑战王者', icon: '👑', description: '通关所有挑战关卡', unlocked: false },
        { id: 7, name: '坚持不懈', icon: '🔥', description: '连续练习7天', unlocked: false },
        { id: 8, name: '完美学霸', icon: '💯', description: '正确率达到100%', unlocked: false }
    ];
    return getStoredData(STORAGE_KEYS.MEDALS_DATA, defaultMedals);
}

function saveMedalsData(medals) {
    return setStoredData(STORAGE_KEYS.MEDALS_DATA, medals);
}

function getDailyTasks() {
    const today = new Date().toDateString();
    const stored = getStoredData(STORAGE_KEYS.DAILY_TASKS, { date: '', tasks: [] });
    
    if (stored.date !== today) {
        const defaultTasks = [
            { id: 1, name: '完成1次练习', icon: '📝', progress: 0, target: 1, reward: 10, completed: false },
            { id: 2, name: '答对10道题', icon: '✅', progress: 0, target: 10, reward: 20, completed: false },
            { id: 3, name: '挑战1个关卡', icon: '🏆', progress: 0, target: 1, reward: 15, completed: false },
            { id: 4, name: '整理错题', icon: '📚', progress: 0, target: 1, reward: 25, completed: false }
        ];
        setStoredData(STORAGE_KEYS.DAILY_TASKS, { date: today, tasks: defaultTasks });
        return defaultTasks;
    }
    
    return stored.tasks;
}

function saveDailyTasks(tasks) {
    const today = new Date().toDateString();
    return setStoredData(STORAGE_KEYS.DAILY_TASKS, { date: today, tasks });
}

function updateDailyTask(taskId, progress) {
    const tasks = getDailyTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        task.progress = Math.min(progress, task.target);
        if (task.progress >= task.target) {
            task.completed = true;
            const user = getUserData();
            user.coins += task.reward;
            saveUserData(user);
        }
        saveDailyTasks(tasks);
    }
    return tasks;
}

window.Storage = {
    getUserData,
    saveUserData,
    getWrongQuestions,
    saveWrongQuestions,
    addWrongQuestion,
    clearWrongQuestions,
    getPracticeHistory,
    addPracticeRecord,
    getChallengeProgress,
    saveChallengeProgress,
    getThemeData,
    saveThemeData,
    getMedalsData,
    saveMedalsData,
    getDailyTasks,
    saveDailyTasks,
    updateDailyTask
};