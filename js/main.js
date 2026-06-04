let currentQuestions = [];
let currentIndex = 0;
let currentQuestion = null;
let userAnswer = '';
let correctCount = 0;
let wrongCount = 0;
let totalTime = 0;
let startTime = 0;
let practiceType = '';
let selectedType = 'oral';
let selectedLevel = 1;
let selectedOp = 'add';
let isChallengeMode = false;
let challengeGroupId = 0;
let challengeLevelId = 0;

const CORRECT_MESSAGES = ['太棒了！', '正确！', '真聪明！', '答对了！', '做得好！'];
const WRONG_MESSAGES = ['再想想！', '不对哦！', '加油！', '继续努力！'];

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'home-page') {
        loadHomePage();
    } else if (pageId === 'wrong-list') {
        loadWrongList();
    } else if (pageId === 'parent-mode') {
        loadParentMode();
    } else if (pageId === 'shop') {
        loadShop();
    } else if (pageId === 'challenge') {
        loadChallenge();
    }
}

function loadHomePage() {
    const user = Storage.getUserData();
    document.querySelector('.user-info .coins').textContent = `💰 ${user.coins}`;
    document.querySelector('.user-info .level').textContent = `等级 ${user.level}`;
    
    const tasks = Storage.getDailyTasks();
    const tasksContainer = document.querySelector('.tasks-list');
    tasksContainer.innerHTML = tasks.map(task => `
        <div class="task">
            <span class="task-icon">${task.icon}</span>
            <span class="task-text">${task.name}</span>
            <span class="task-progress">${task.progress}/${task.target}</span>
            <span class="task-reward">${task.completed ? '✓' : `+${task.reward}💰`}</span>
        </div>
    `).join('');
}

function selectType(type) {
    selectedType = type;
    updateOptionButtons('oral', 'fill', type);
}

function selectLevel(level) {
    selectedLevel = level;
    updateOptionButtons(1, 4, level);
}

function selectOp(op) {
    selectedOp = op;
    updateOptionButtons('add', 'sub', 'mix', op);
}

function updateOptionButtons(...values) {
    const activeValue = values.pop();
    values.forEach(val => {
        const btn = document.querySelector(`button.option-btn:contains("${val === 1 ? '0-10' : val === 2 ? '0-20' : val === 3 ? '0-50' : val === 4 ? '0-100' : val === 'add' ? '加法' : val === 'sub' ? '减法' : val === 'mix' ? '混合' : val === 'oral' ? '口算题' : '填空题'}")`);
        if (btn) {
            btn.classList.toggle('active', btn.textContent.includes(activeValue === 1 ? '0-10' : activeValue === 2 ? '0-20' : activeValue === 3 ? '0-50' : activeValue === 4 ? '0-100' : activeValue === 'add' ? '加法' : activeValue === 'sub' ? '减法' : activeValue === 'mix' ? '混合' : activeValue === 'oral' ? '口算题' : '填空题'));
        }
    });
}

function startPractice() {
    isChallengeMode = false;
    practiceType = selectedType === 'oral' ? '口算练习' : '填空练习';
    
    const count = 10;
    currentQuestions = selectedType === 'oral' 
        ? OralModule.generateQuestions(count, selectedLevel, selectedOp)
        : FillModule.generateQuestions(count, selectedLevel, selectedOp);
    
    startPracticeSession();
}

function startRandomPractice() {
    isChallengeMode = false;
    practiceType = '随机混合练习';
    
    const count = 10;
    const questions = [];
    
    questions.push(OralModule.generateQuestion(selectedLevel, 'add'));
    questions.push(OralModule.generateQuestion(selectedLevel, 'sub'));
    questions.push(FillModule.generateQuestion(selectedLevel, 'add'));
    questions.push(FillModule.generateQuestion(selectedLevel, 'sub'));
    
    for (let i = 4; i < count; i++) {
        if (Math.random() > 0.5) {
            questions.push(OralModule.generateQuestion(selectedLevel, 'mix'));
        } else {
            questions.push(FillModule.generateQuestion(selectedLevel, 'mix'));
        }
    }
    
    currentQuestions = Utils.shuffleArray(questions);
    startPracticeSession();
}

function startChallenge(groupId, levelId) {
    isChallengeMode = true;
    challengeGroupId = groupId;
    challengeLevelId = levelId;
    practiceType = `挑战关卡 ${groupId}-${levelId}`;
    
    currentQuestions = ChallengeModule.generateQuestions(groupId, levelId);
    startPracticeSession();
}

function startPracticeSession() {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    totalTime = 0;
    startTime = Date.now();
    
    showPage('practice-page');
    loadCurrentQuestion();
}

function loadCurrentQuestion() {
    if (currentIndex >= currentQuestions.length) {
        finishPractice();
        return;
    }
    
    currentQuestion = currentQuestions[currentIndex];
    userAnswer = '';
    
    const questionArea = document.querySelector('.question-area');
    const progress = document.querySelector('.progress span');
    
    progress.textContent = `${currentIndex + 1}/${currentQuestions.length}`;
    
    if (currentQuestion.type === 'oral') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="oral-question">
                    <span class="number">${currentQuestion.num1}</span>
                    <span class="operator">${currentQuestion.op}</span>
                    <span class="number">${currentQuestion.num2}</span>
                    <span class="equals">=</span>
                    <input type="number" class="answer-input" id="answer-input" placeholder="?" />
                </div>
            </div>
        `;
    } else {
        questionArea.innerHTML = `
            <div class="question">
                <div class="fill-question">
                    <div class="fill-content">${currentQuestion.content}</div>
                    <input type="number" class="answer-input" id="answer-input" placeholder="?" />
                </div>
            </div>
        `;
    }
    
    document.getElementById('answer-input').focus();
    document.getElementById('answer-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
}

function submitAnswer() {
    const input = document.getElementById('answer-input');
    userAnswer = parseInt(input.value) || 0;
    
    const isCorrect = userAnswer === currentQuestion.answer;
    
    if (isCorrect) {
        correctCount++;
        showFeedback('correct', CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]);
        Utils.playSound('correct');
    } else {
        wrongCount++;
        showFeedback('wrong', `${WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]} 正确答案是 ${currentQuestion.answer}`);
        Utils.playSound('wrong');
        
        Storage.addWrongQuestion({
            num1: currentQuestion.num1,
            num2: currentQuestion.num2,
            op: currentQuestion.op,
            userAnswer: userAnswer,
            correctAnswer: currentQuestion.answer,
            timestamp: Date.now()
        });
    }
    
    setTimeout(() => {
        currentIndex++;
        loadCurrentQuestion();
    }, 1500);
}

function showFeedback(type, message) {
    const feedback = document.querySelector('.feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type} show`;
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 1500);
}

function finishPractice() {
    totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    const user = Storage.getUserData();
    user.totalCorrect += correctCount;
    user.totalWrong += wrongCount;
    user.practiceCount++;
    
    const earnedCoins = Math.max(1, correctCount * 2 - wrongCount);
    user.coins += earnedCoins;
    
    const levelUp = Math.floor(user.totalCorrect / 100) + 1;
    if (levelUp > user.level) {
        user.level = levelUp;
    }
    
    Storage.saveUserData(user);
    
    Storage.addPracticeRecord({
        date: new Date().toISOString(),
        type: practiceType,
        correct: correctCount,
        total: currentQuestions.length,
        time: totalTime
    });
    
    Storage.updateDailyTask(1, user.practiceCount);
    Storage.updateDailyTask(2, user.totalCorrect);
    
    if (isChallengeMode && correctCount === currentQuestions.length) {
        completeChallenge();
        Storage.updateDailyTask(3, 1);
    }
    
    updateMedals();
    
    showResult(correctCount, wrongCount, totalTime, earnedCoins);
}

function completeChallenge() {
    const progress = Storage.getChallengeProgress();
    const group = progress.groups.find(g => g.id === challengeGroupId);
    
    if (group) {
        const level = group.levels.find(l => l.id === challengeLevelId);
        if (level) {
            level.completed = true;
        }
        
        const nextLevel = group.levels.find(l => l.id === challengeLevelId + 1);
        if (nextLevel) {
            nextLevel.completed = false;
        }
    }
    
    Storage.saveChallengeProgress(progress);
}

function updateMedals() {
    const medals = Storage.getMedalsData();
    const user = Storage.getUserData();
    
    if (user.practiceCount === 1) {
        medals[0].unlocked = true;
    }
    if (user.totalCorrect >= 100) {
        medals[1].unlocked = true;
    }
    if (user.totalCorrect >= 500) {
        medals[2].unlocked = true;
    }
    if (correctCount === currentQuestions.length) {
        medals[4].unlocked = true;
    }
    
    const allCompleted = Storage.getChallengeProgress().groups.every(group => 
        group.levels.every(level => level.completed)
    );
    if (allCompleted) {
        medals[5].unlocked = true;
    }
    
    Storage.saveMedalsData(medals);
}

function showResult(correct, wrong, time, coins) {
    const resultPage = document.getElementById('result-page');
    
    const isPerfect = correct === currentQuestions.length;
    
    resultPage.innerHTML = `
        <div class="header">
            <button class="back-btn" onclick="showPage('home-page')">← 返回首页</button>
        </div>
        <div class="result-content">
            <div class="result-icon">${isPerfect ? '🎉' : '👍'}</div>
            <h2>${isPerfect ? '太棒了！全对！' : '练习完成！'}</h2>
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-value">${correct}</span>
                    <span class="stat-label">答对题数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${time}秒</span>
                    <span class="stat-label">用时</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">+${coins}</span>
                    <span class="stat-label">获得积分</span>
                </div>
            </div>
            <div class="result-actions">
                ${wrong > 0 ? `<button class="result-btn" onclick="showPage('wrong-list')">📝 查看错题 (${wrong}题)</button>` : ''}
                <button class="result-btn" onclick="restartPractice()">🔄 再练一次</button>
                <button class="result-btn" onclick="showPage('home-page')">🏠 返回首页</button>
            </div>
        </div>
    `;
    
    showPage('result-page');
}

function restartPractice() {
    if (isChallengeMode) {
        startChallenge(challengeGroupId, challengeLevelId);
    } else {
        startPractice();
    }
}

function loadWrongList() {
    const wrongList = Storage.getWrongQuestions();
    const container = document.querySelector('.wrong-content');
    
    if (wrongList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🎉</span>
                <p>太棒了！没有错题！</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="wrong-list">
                ${wrongList.map((item, index) => `
                    <div class="wrong-item">
                        <div class="wrong-question">
                            <span>${item.num1} ${item.op} ${item.num2} = ?</span>
                        </div>
                        <div class="wrong-info">
                            <span class="wrong-answer">你的答案: ${item.userAnswer}</span>
                            <span class="correct-answer">正确答案: ${item.correctAnswer}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="clear-btn" onclick="clearWrongList()">🗑️ 清空错题本</button>
        `;
    }
    
    Storage.updateDailyTask(4, 1);
}

function clearWrongList() {
    if (confirm('确定要清空错题本吗？')) {
        Storage.clearWrongQuestions();
        loadWrongList();
    }
}

function loadParentMode() {
    const user = Storage.getUserData();
    const history = Storage.getPracticeHistory();
    
    const accuracy = user.totalCorrect + user.totalWrong > 0 
        ? Math.round((user.totalCorrect / (user.totalCorrect + user.totalWrong)) * 100) 
        : 0;
    
    const container = document.querySelector('.parent-content');
    container.innerHTML = `
        <div class="stats-section">
            <h3>📊 学习统计</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-num">${user.practiceCount}</span>
                    <span class="stat-desc">总练习次数</span>
                </div>
                <div class="stat-card">
                    <span class="stat-num">${user.totalCorrect}</span>
                    <span class="stat-desc">总答对题数</span>
                </div>
                <div class="stat-card">
                    <span class="stat-num">${user.totalWrong}</span>
                    <span class="stat-desc">总错题数</span>
                </div>
                <div class="stat-card">
                    <span class="stat-num">${accuracy}%</span>
                    <span class="stat-desc">正确率</span>
                </div>
            </div>
        </div>
        <div class="history-section">
            <h3>📜 练习记录</h3>
            ${history.length === 0 ? `
                <div class="empty-state">
                    <p>暂无练习记录</p>
                </div>
            ` : `
                <div class="history-list">
                    ${history.slice(0, 20).map(record => `
                        <div class="history-item">
                            <span class="history-date">${Utils.formatDate(record.date)}</span>
                            <span class="history-detail">${record.type} - ${record.correct}/${record.total}题</span>
                            <span class="history-time">用时 ${record.time}秒</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
        <button class="export-btn" onclick="exportData()">📤 导出数据</button>
    `;
}

function exportData() {
    const user = Storage.getUserData();
    const history = Storage.getPracticeHistory();
    const wrongList = Storage.getWrongQuestions();
    
    const data = {
        user,
        history,
        wrongList,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math_land_data_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('数据导出成功！');
}

function loadShop() {
    const themes = Storage.getThemeData();
    const user = Storage.getUserData();
    
    const container = document.querySelector('.shop-content');
    container.innerHTML = `
        <h3>🎨 主题皮肤</h3>
        <div class="theme-list">
            ${themes.map(theme => `
                <div class="theme-item">
                    <div class="theme-preview" style="background: ${theme.color}">
                        <span>${theme.icon}</span>
                    </div>
                    <span class="theme-name">${theme.name}</span>
                    <button 
                        class="buy-btn ${theme.purchased ? 'purchased' : ''} ${theme.selected ? 'selected' : ''}"
                        ${!theme.purchased && user.coins < theme.price ? 'disabled' : ''}
                        onclick="buyTheme(${theme.id})"
                    >
                        ${theme.selected ? '已使用' : (theme.purchased ? '使用' : `💰${theme.price}`)}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    
    document.querySelector('.header .coins').textContent = `💰 ${user.coins}`;
}

function buyTheme(themeId) {
    const themes = Storage.getThemeData();
    const user = Storage.getUserData();
    const theme = themes.find(t => t.id === themeId);
    
    if (!theme) return;
    
    if (theme.selected) return;
    
    if (!theme.purchased) {
        if (user.coins < theme.price) {
            alert('积分不足！');
            return;
        }
        user.coins -= theme.price;
        Storage.saveUserData(user);
        theme.purchased = true;
    }
    
    themes.forEach(t => t.selected = false);
    theme.selected = true;
    
    document.body.style.background = theme.color;
    
    Storage.saveThemeData(themes);
    loadShop();
}

function loadChallenge() {
    const progress = Storage.getChallengeProgress();
    const groups = ChallengeModule.getGroups();
    
    const container = document.querySelector('.challenge-groups');
    container.innerHTML = groups.map(group => {
        const groupProgress = progress.groups.find(g => g.id === group.id);
        return `
            <div class="challenge-group">
                <h3>${group.name}</h3>
                <div class="levels">
                    ${Array.from({ length: group.levels }, (_, i) => {
                        const levelId = i + 1;
                        const levelProgress = groupProgress?.levels.find(l => l.id === levelId);
                        const unlocked = levelId === 1 || (groupProgress?.levels.find(l => l.id === levelId - 1)?.completed);
                        const completed = levelProgress?.completed;
                        return `
                            <button 
                                class="level-btn ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}"
                                ${!unlocked ? 'disabled' : ''}
                                onclick="startChallenge(${group.id}, ${levelId})"
                            >
                                ${levelId}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    showPage('home-page');
});

window.showPage = showPage;
window.selectType = selectType;
window.selectLevel = selectLevel;
window.selectOp = selectOp;
window.startPractice = startPractice;
window.startRandomPractice = startRandomPractice;
window.startChallenge = startChallenge;
window.submitAnswer = submitAnswer;
window.restartPractice = restartPractice;
window.clearWrongList = clearWrongList;
window.exportData = exportData;
window.buyTheme = buyTheme;