// 全局变量
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
let selectedCount = 10;
let isChallengeMode = false;
let challengeGroupId = 0;
let challengeLevelId = 0;
let timerInterval = null;

const CORRECT_MESSAGES = ['太棒了！', '正确！', '真聪明！', '答对了！', '做得好！', '真厉害！'];
const WRONG_MESSAGES = ['再想想！', '不对哦！', '加油！', '继续努力！', '别灰心！'];

// 页面切换
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

// 加载首页
function loadHomePage() {
    const user = Storage.getUserData();
    const coinsEl = document.querySelector('.user-info .coins');
    const levelEl = document.querySelector('.user-info .level');
    if (coinsEl) coinsEl.textContent = `💰 ${user.coins}`;
    if (levelEl) levelEl.textContent = `等级 ${user.level}`;
    
    const tasks = Storage.getDailyTasks();
    const tasksContainer = document.querySelector('.tasks-list');
    if (tasksContainer) {
        tasksContainer.innerHTML = tasks.map(task => `
            <div class="task">
                <span class="task-icon">${task.icon}</span>
                <span class="task-text">${task.name}</span>
                <span class="task-progress">${task.progress}/${task.target}</span>
                <span class="task-reward">${task.completed ? '✓' : `+${task.reward}💰`}</span>
            </div>
        `).join('');
    }
}

// 选择题型
function selectType(type) {
    selectedType = type;
    updateOptionButtons('type-options', type);
}

// 选择难度
function selectLevel(level) {
    selectedLevel = level;
    updateOptionButtons('level-options', level);
    updateOptionButtons('random-level-options', level);
}

// 选择运算类型
function selectOp(op) {
    selectedOp = op;
    updateOptionButtons('op-options', op);
}

// 选择题目数量
function selectCount(count) {
    selectedCount = count;
    updateOptionButtons('count-options', count);
    updateOptionButtons('random-count-options', count);
}

// 更新选项按钮状态
function updateOptionButtons(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const buttons = container.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const text = btn.textContent.trim();
        
        // 根据不同的值类型进行匹配
        let match = false;
        if (typeof value === 'number') {
            if (text.includes(`${value}`) || text.includes(`0-${value}`)) {
                match = true;
            }
        } else {
            if (text.includes(value) || 
                (value === 'oral' && text.includes('口算')) ||
                (value === 'fill' && text.includes('填空')) ||
                (value === 'multi' && text.includes('连加')) ||
                (value === 'add' && text.includes('加法') && !text.includes('连')) ||
                (value === 'sub' && text.includes('减法') && !text.includes('连')) ||
                (value === 'mix' && text.includes('混合'))) {
                match = true;
            }
        }
        
        if (match) {
            btn.classList.add('active');
        }
    });
}

// 开始自定义练习
function startPractice() {
    isChallengeMode = false;
    
    const typeNames = {
        'oral': '口算练习',
        'fill': '填空练习',
        'multi': '连加连减'
    };
    practiceType = typeNames[selectedType] || '口算练习';
    
    let questions = [];
    switch (selectedType) {
        case 'oral':
            questions = OralModule.generateQuestions(selectedCount, selectedLevel, selectedOp);
            break;
        case 'fill':
            questions = FillModule.generateQuestions(selectedCount, selectedLevel, selectedOp);
            break;
        case 'multi':
            questions = MultiModule.generateQuestions(selectedCount, selectedLevel, selectedOp);
            break;
    }
    
    currentQuestions = questions;
    startPracticeSession();
}

// 开始随机练习
function startRandomPractice() {
    isChallengeMode = false;
    practiceType = '随机混合练习';
    
    const questions = [];
    const perType = Math.ceil(selectedCount / 4);
    
    // 确保每种题型至少出一道
    questions.push(OralModule.generateQuestion(selectedLevel, 'add'));
    questions.push(OralModule.generateQuestion(selectedLevel, 'sub'));
    questions.push(FillModule.generateQuestion(selectedLevel, 'add'));
    questions.push(FillModule.generateQuestion(selectedLevel, 'sub'));
    
    // 填充剩余题目
    for (let i = 4; i < selectedCount; i++) {
        const rand = Math.random();
        if (rand < 0.33) {
            questions.push(OralModule.generateQuestion(selectedLevel, 'mix'));
        } else if (rand < 0.66) {
            questions.push(FillModule.generateQuestion(selectedLevel, 'mix'));
        } else {
            questions.push(MultiModule.generateQuestion(selectedLevel, 'mix'));
        }
    }
    
    currentQuestions = Utils.shuffleArray(questions);
    startPracticeSession();
}

// 开始挑战模式
function startChallenge(groupId, levelId) {
    isChallengeMode = true;
    challengeGroupId = groupId;
    challengeLevelId = levelId;
    practiceType = `挑战关卡 ${groupId}-${levelId}`;
    
    currentQuestions = ChallengeModule.generateQuestions(groupId, levelId);
    startPracticeSession();
}

// 开始练习会话
function startPracticeSession() {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    totalTime = 0;
    startTime = Date.now();
    userAnswer = '';
    
    // 启动计时器
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    showPage('practice-page');
    loadCurrentQuestion();
}

// 更新计时器显示
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timerEl = document.getElementById('timer-display');
    if (timerEl) {
        timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
    }
}

// 加载当前题目
function loadCurrentQuestion() {
    if (currentIndex >= currentQuestions.length) {
        finishPractice();
        return;
    }
    
    currentQuestion = currentQuestions[currentIndex];
    userAnswer = '';
    
    const questionArea = document.querySelector('.question-area');
    const progress = document.querySelector('.progress span');
    
    if (progress) {
        progress.textContent = `${currentIndex + 1}/${currentQuestions.length}`;
    }
    
    // 根据题型渲染不同的题目格式
    if (currentQuestion.type === 'oral') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="oral-question">
                    <span class="number">${currentQuestion.num1}</span>
                    <span class="operator">${currentQuestion.op}</span>
                    <span class="number">${currentQuestion.num2}</span>
                    <span class="equals">=</span>
                    <span class="number placeholder">?</span>
                </div>
                <div class="current-answer" id="current-answer">${userAnswer || ''}</div>
            </div>
        `;
    } else if (currentQuestion.type === 'fill') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="fill-question">
                    <div class="fill-content">${currentQuestion.content.replace('___', '<span class="placeholder">?</span>')}</div>
                </div>
                <div class="current-answer" id="current-answer">${userAnswer || ''}</div>
            </div>
        `;
    } else if (currentQuestion.type === 'multi') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="multi-question">
                    <div class="multi-content">${currentQuestion.content.replace('?', '<span class="placeholder">?</span>')}</div>
                </div>
                <div class="current-answer" id="current-answer">${userAnswer || ''}</div>
            </div>
        `;
    }
}

// 数字键盘输入
function inputNumber(num) {
    if (userAnswer.length < 4) {
        userAnswer += num;
        const answerEl = document.getElementById('current-answer');
        if (answerEl) answerEl.textContent = userAnswer;
    }
}

// 清除输入
function clearInput() {
    userAnswer = '';
    const answerEl = document.getElementById('current-answer');
    if (answerEl) answerEl.textContent = '';
}

// 提交答案
function submitAnswer() {
    if (!userAnswer) {
        showFeedback('wrong', '请输入答案！');
        return;
    }
    
    const answerNum = parseInt(userAnswer);
    const isCorrect = answerNum === currentQuestion.answer;
    
    if (isCorrect) {
        correctCount++;
        showFeedback('correct', CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]);
        Utils.playSound('correct');
    } else {
        wrongCount++;
        showFeedback('wrong', `${WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]} 正确答案是 ${currentQuestion.answer}`);
        Utils.playSound('wrong');
        
        // 保存错题
        Storage.addWrongQuestion({
            num1: currentQuestion.num1,
            num2: currentQuestion.num2,
            op: currentQuestion.op,
            userAnswer: answerNum,
            correctAnswer: currentQuestion.answer,
            type: currentQuestion.type,
            content: currentQuestion.content || `${currentQuestion.num1} ${currentQuestion.op} ${currentQuestion.num2}`,
            timestamp: Date.now()
        });
    }
    
    setTimeout(() => {
        currentIndex++;
        loadCurrentQuestion();
    }, 1200);
}

// 显示反馈
function showFeedback(type, message) {
    const feedback = document.querySelector('.feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.className = `feedback ${type} show`;
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 1200);
    }
}

// 确认退出
function confirmExit() {
    if (confirm('确定要退出练习吗？当前进度将不会保存。')) {
        if (timerInterval) clearInterval(timerInterval);
        showPage('home-page');
    }
}

// 完成练习
function finishPractice() {
    if (timerInterval) clearInterval(timerInterval);
    
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

// 完成挑战关卡
function completeChallenge() {
    const progress = Storage.getChallengeProgress();
    const group = progress.groups.find(g => g.id === challengeGroupId);
    
    if (group) {
        const level = group.levels.find(l => l.id === challengeLevelId);
        if (level) {
            level.completed = true;
        }
        
        // 解锁下一关
        const nextLevel = group.levels.find(l => l.id === challengeLevelId + 1);
        if (nextLevel) {
            nextLevel.unlocked = true;
        }
        
        // 如果当前组全部完成，解锁下一组的第一关
        const allCompleted = group.levels.every(l => l.completed);
        if (allCompleted && challengeGroupId < 4) {
            const nextGroup = progress.groups.find(g => g.id === challengeGroupId + 1);
            if (nextGroup && nextGroup.levels[0]) {
                nextGroup.levels[0].unlocked = true;
            }
        }
    }
    
    Storage.saveChallengeProgress(progress);
}

// 更新勋章
function updateMedals() {
    const medals = Storage.getMedalsData();
    const user = Storage.getUserData();
    
    if (user.practiceCount >= 1) medals[0].unlocked = true;
    if (user.totalCorrect >= 100) medals[1].unlocked = true;
    if (user.totalCorrect >= 500) medals[2].unlocked = true;
    if (correctCount === currentQuestions.length && currentQuestions.length >= 10) {
        medals[4].unlocked = true;
    }
    
    const allCompleted = Storage.getChallengeProgress().groups.every(group => 
        group.levels.every(level => level.completed)
    );
    if (allCompleted) medals[5].unlocked = true;
    
    Storage.saveMedalsData(medals);
}

// 显示结果页面
function showResult(correct, wrong, time, coins) {
    const resultPage = document.getElementById('result-page');
    const isPerfect = correct === currentQuestions.length;
    const accuracy = Math.round((correct / currentQuestions.length) * 100);
    
    resultPage.innerHTML = `
        <div class="header">
            <button class="back-btn" onclick="showPage('home-page')">← 返回首页</button>
        </div>
        <div class="result-content">
            <div class="result-icon">${isPerfect ? '🎉' : (accuracy >= 80 ? '👍' : '💪')}</div>
            <h2>${isPerfect ? '太棒了！全对！' : (accuracy >= 80 ? '做得很好！' : '继续加油！')}</h2>
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-value">${correct}/${currentQuestions.length}</span>
                    <span class="stat-label">正确率 ${accuracy}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${formatTime(time)}</span>
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

// 格式化时间
function formatTime(seconds) {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
}

// 重新练习
function restartPractice() {
    if (isChallengeMode) {
        startChallenge(challengeGroupId, challengeLevelId);
    } else {
        startPractice();
    }
}

// 加载错题本
function loadWrongList() {
    const wrongList = Storage.getWrongQuestions();
    const container = document.querySelector('.wrong-content');
    
    if (!container) return;
    
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
                            <span>${item.content || `${item.num1} ${item.op} ${item.num2} = ?`}</span>
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

// 清空错题本
function clearWrongList() {
    if (confirm('确定要清空错题本吗？')) {
        Storage.clearWrongQuestions();
        loadWrongList();
    }
}

// 加载家长模式
function loadParentMode() {
    const user = Storage.getUserData();
    const history = Storage.getPracticeHistory();
    
    const accuracy = user.totalCorrect + user.totalWrong > 0 
        ? Math.round((user.totalCorrect / (user.totalCorrect + user.totalWrong)) * 100) 
        : 0;
    
    const container = document.querySelector('.parent-content');
    if (!container) return;
    
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
                            <span class="history-time">用时 ${formatTime(record.time)}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
        <button class="export-btn" onclick="exportData()">📤 导出数据</button>
        <button class="export-btn" onclick="importData()" style="background: #4caf50; margin-top: 10px;">📥 导入数据</button>
    `;
}

// 导出数据
function exportData() {
    const user = Storage.getUserData();
    const history = Storage.getPracticeHistory();
    const wrongList = Storage.getWrongQuestions();
    const medals = Storage.getMedalsData();
    const challenge = Storage.getChallengeProgress();
    
    const data = {
        user,
        history,
        wrongList,
        medals,
        challenge,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `数学乐园_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('数据导出成功！');
}

// 导入数据
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.user) Storage.saveUserData(data.user);
                if (data.history) localStorage.setItem('math_land_practice_history', JSON.stringify(data.history));
                if (data.wrongList) Storage.saveWrongQuestions(data.wrongList);
                if (data.medals) Storage.saveMedalsData(data.medals);
                if (data.challenge) Storage.saveChallengeProgress(data.challenge);
                
                alert('数据导入成功！');
                loadParentMode();
            } catch (err) {
                alert('数据导入失败，请检查文件格式！');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// 加载主题商店
function loadShop() {
    const themes = Storage.getThemeData();
    const user = Storage.getUserData();
    
    const container = document.querySelector('.shop-content');
    if (!container) return;
    
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
    
    const headerCoins = document.querySelector('#shop .header .coins');
    if (headerCoins) headerCoins.textContent = `💰 ${user.coins}`;
}

// 购买主题
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

// 加载挑战模式
function loadChallenge() {
    const progress = Storage.getChallengeProgress();
    const groups = ChallengeModule.getGroups();
    
    const container = document.querySelector('.challenge-groups');
    if (!container) return;
    
    container.innerHTML = groups.map(group => {
        const groupProgress = progress.groups.find(g => g.id === group.id);
        return `
            <div class="challenge-group">
                <h3>${group.name}</h3>
                <div class="levels">
                    ${Array.from({ length: group.levels }, (_, i) => {
                        const levelId = i + 1;
                        const levelProgress = groupProgress?.levels.find(l => l.id === levelId);
                        const prevLevel = groupProgress?.levels.find(l => l.id === levelId - 1);
                        const unlocked = levelId === 1 || (groupProgress?.levels[0]?.unlocked && (levelId === 1 || prevLevel?.completed));
                        const completed = levelProgress?.completed;
                        return `
                            <button 
                                class="level-btn ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}"
                                ${!unlocked ? 'disabled' : ''}
                                onclick="startChallenge(${group.id}, ${levelId})"
                            >
                                ${completed ? '✓' : levelId}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 应用已选主题
    const themes = Storage.getThemeData();
    const selectedTheme = themes.find(t => t.selected);
    if (selectedTheme) {
        document.body.style.background = selectedTheme.color;
    }
    
    showPage('home-page');
});

// 导出到全局
window.showPage = showPage;
window.selectType = selectType;
window.selectLevel = selectLevel;
window.selectOp = selectOp;
window.selectCount = selectCount;
window.startPractice = startPractice;
window.startRandomPractice = startRandomPractice;
window.startChallenge = startChallenge;
window.submitAnswer = submitAnswer;
window.inputNumber = inputNumber;
window.clearInput = clearInput;
window.confirmExit = confirmExit;
window.restartPractice = restartPractice;
window.clearWrongList = clearWrongList;
window.exportData = exportData;
window.importData = importData;
window.buyTheme = buyTheme;