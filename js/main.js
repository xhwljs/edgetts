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
let soundEnabled = true;
let consecutiveCorrect = 0; // 连续答对计数
let maxConsecutive = 0; // 最大连续答对

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
    } else if (pageId === 'medals') {
        loadMedals();
    } else if (pageId === 'study-history') {
        loadStudyHistory();
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
    
    // 计算今日目标完成度
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);
    
    if (tasksContainer) {
        tasksContainer.innerHTML = `
            <div class="daily-goal-header">
                <span class="goal-title">🎯 今日目标</span>
                <span class="goal-progress">${completedCount}/${totalCount}</span>
            </div>
            <div class="goal-bar">
                <div class="goal-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            ${tasks.map(task => `
                <div class="task ${task.completed ? 'completed' : ''}">
                    <span class="task-icon">${task.icon}</span>
                    <span class="task-text">${task.name}</span>
                    <span class="task-progress">${task.progress}/${task.target}</span>
                    <span class="task-reward">${task.completed ? '✓ 已完成' : `+${task.reward}💰`}</span>
                </div>
            `).join('')}
        `;
    }
    
    // 显示连续打卡天数
    const streakContainer = document.querySelector('.streak-container');
    if (streakContainer) {
        const streak = getStreakDays();
        streakContainer.innerHTML = `
            <div class="streak-box">
                <span class="streak-icon">🔥</span>
                <div class="streak-info">
                    <span class="streak-days">${streak}</span>
                    <span class="streak-text">连续打卡</span>
                </div>
                <button class="checkin-btn ${isTodayCheckedIn() ? 'checked' : ''}" onclick="doCheckIn()">
                    ${isTodayCheckedIn() ? '✓ 已打卡' : '打卡'}
                </button>
            </div>
        `;
    }
}

// 获取连续打卡天数
function getStreakDays() {
    const checkIns = getCheckInHistory();
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    for (let i = checkIns.length - 1; i >= 0; i--) {
        const checkInDate = new Date(checkIns[i]).toDateString();
        const expectedDate = new Date(Date.now() - (streak * 86400000)).toDateString();
        
        if (checkInDate === expectedDate) {
            streak++;
        } else if (checkInDate !== yesterday && checkInDate !== today) {
            break;
        }
    }
    return streak;
}

// 获取打卡历史
function getCheckInHistory() {
    const data = localStorage.getItem('math_land_checkins');
    return data ? JSON.parse(data) : [];
}

// 保存打卡历史
function saveCheckInHistory(history) {
    localStorage.setItem('math_land_checkins', JSON.stringify(history));
}

// 今天是否已打卡
function isTodayCheckedIn() {
    const checkIns = getCheckInHistory();
    const today = new Date().toDateString();
    return checkIns.some(date => new Date(date).toDateString() === today);
}

// 执行打卡
function doCheckIn() {
    if (isTodayCheckedIn()) {
        alert('今天已经打卡啦！明天再来吧！');
        return;
    }
    
    const checkIns = getCheckInHistory();
    checkIns.push(new Date().toISOString());
    saveCheckInHistory(checkIns);
    
    // 打卡奖励积分
    const user = Storage.getUserData();
    const streakBonus = Math.min(getStreakDays() * 2, 20);
    user.coins += (10 + streakBonus);
    Storage.saveUserData(user);
    
    // 打卡音效
    if (soundEnabled) {
        try {
            Utils.playSound('checkin');
        } catch (e) {}
    }
    
    alert(`打卡成功！获得 ${10 + streakBonus} 积分！\n连续打卡 ${getStreakDays()} 天！`);
    loadHomePage();
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
    
    // 显示/隐藏自定义范围设置
    const customSection = document.getElementById('custom-range-section');
    if (customSection) {
        customSection.style.display = level === 'custom' ? 'block' : 'none';
    }
}

// 获取当前难度范围
function getCurrentDifficultyRange() {
    if (selectedLevel === 'custom') {
        const minInput = document.getElementById('custom-min');
        const maxInput = document.getElementById('custom-max');
        const min = minInput ? parseInt(minInput.value) || 0 : 0;
        const max = maxInput ? parseInt(maxInput.value) || 20 : 20;
        return { min: Math.min(min, max), max: Math.max(min, max) };
    }
    return Utils.calculateDifficultyRange(selectedLevel);
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
                (value === 'custom' && text.includes('自定义')) ||
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
        'multi': '连加连减',
        'compare': '比大小',
        'multiply': '乘法练习'
    };
    practiceType = typeNames[selectedType] || '口算练习';
    
    const levelOrRange = getCurrentDifficultyRange();
    let questions = [];
    switch (selectedType) {
        case 'oral':
            questions = OralModule.generateQuestions(selectedCount, levelOrRange, selectedOp);
            break;
        case 'fill':
            questions = FillModule.generateQuestions(selectedCount, levelOrRange, selectedOp);
            break;
        case 'multi':
            questions = MultiModule.generateQuestions(selectedCount, levelOrRange, selectedOp);
            break;
        case 'compare':
            questions = CompareModule.generateCompareQuestions(selectedCount, levelOrRange);
            break;
        case 'multiply':
            questions = MultiplicationModule.generateQuestions(selectedCount, levelOrRange, selectedOp);
            break;
    }
    
    currentQuestions = questions;
    startPracticeSession();
}

// 开始随机练习
function startRandomPractice() {
    isChallengeMode = false;
    practiceType = '随机混合练习';
    
    const levelOrRange = getCurrentDifficultyRange();
    const questions = [];
    const perType = Math.ceil(selectedCount / 4);
    
    // 确保每种题型至少出一道
    questions.push(OralModule.generateQuestion(levelOrRange, 'add'));
    questions.push(OralModule.generateQuestion(levelOrRange, 'sub'));
    questions.push(FillModule.generateQuestion(levelOrRange, 'add'));
    questions.push(FillModule.generateQuestion(levelOrRange, 'sub'));
    
    // 填充剩余题目
    for (let i = 4; i < selectedCount; i++) {
        const rand = Math.random();
        if (rand < 0.33) {
            questions.push(OralModule.generateQuestion(levelOrRange, 'mix'));
        } else if (rand < 0.66) {
            questions.push(FillModule.generateQuestion(levelOrRange, 'mix'));
        } else {
            questions.push(MultiModule.generateQuestion(levelOrRange, 'mix'));
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
    consecutiveCorrect = 0;
    maxConsecutive = 0;
    
    // 重置键盘显示状态
    document.querySelector('.answer-keypad').style.display = 'block';
    document.querySelector('.compare-buttons').style.display = 'none';
    
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
    const timerEl = document.getElementById('quiz-timer');
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
    const quizProgress = document.getElementById('quiz-progress');
    
    if (quizProgress) {
        quizProgress.textContent = `${currentIndex + 1}/${currentQuestions.length}`;
    }
    
    // 根据题型渲染不同的题目格式，答案直接在问号位置显示
    if (currentQuestion.type === 'oral') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="oral-question">
                    <span class="number">${currentQuestion.num1}</span>
                    <span class="operator">${currentQuestion.op}</span>
                    <span class="number">${currentQuestion.num2}</span>
                    <span class="equals">=</span>
                    <span class="answer-placeholder" id="answer-display">?</span>
                </div>
            </div>
        `;
    } else if (currentQuestion.type === 'fill') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="fill-question">
                    <div class="fill-content" id="fill-display">${currentQuestion.content.replace('___', '<span class="answer-placeholder" id="answer-display">?</span>')}</div>
                </div>
            </div>
        `;
    } else if (currentQuestion.type === 'multi') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="multi-question">
                    <div class="multi-content" id="multi-display">${currentQuestion.content.replace('?', '<span class="answer-placeholder" id="answer-display">?</span>')}</div>
                </div>
            </div>
        `;
    } else if (currentQuestion.type === 'compare') {
        questionArea.innerHTML = `
            <div class="question">
                <div class="compare-question">
                    <span class="number">${currentQuestion.num1}</span>
                    <span class="answer-placeholder" id="answer-display">?</span>
                    <span class="number">${currentQuestion.num2}</span>
                </div>
            </div>
        `;
        document.querySelector('.quiz-keypad').style.display = 'none';
        document.querySelector('.compare-buttons').style.display = 'flex';
    } else {
        // 默认显示数字键盘
        document.querySelector('.quiz-keypad').style.display = 'block';
    }
    
    // 添加学习助手角色
    createMascot();
    
    // 更新角色状态
    updateMascot();
}

// 创建学习助手角色
function createMascot() {
    const existingMascot = document.querySelector('.mascot');
    if (existingMascot) return;
    
    const mascot = document.createElement('div');
    mascot.className = 'mascot';
    mascot.innerHTML = `
        <div class="mascot-face">😊</div>
        <div class="mascot-message">加油！你行的！</div>
    `;
    
    const questionArea = document.querySelector('.question-area');
    if (questionArea && questionArea.parentNode) {
        questionArea.parentNode.insertBefore(mascot, questionArea.nextSibling);
    }
}

// 更新学习助手角色状态
function updateMascot(type, message) {
    const mascot = document.querySelector('.mascot');
    if (!mascot) return;
    
    const face = mascot.querySelector('.mascot-face');
    const msg = mascot.querySelector('.mascot-message');
    
    if (type === 'correct') {
        // 答对时的表情和消息
        if (consecutiveCorrect >= 10) {
            face.textContent = '🥳';
            msg.textContent = '太厉害了！连续答对10题！';
        } else if (consecutiveCorrect >= 5) {
            face.textContent = '😄';
            msg.textContent = '真棒！连续答对5题了！';
        } else if (consecutiveCorrect >= 3) {
            face.textContent = '😊';
            msg.textContent = '做得很好！继续加油！';
        } else {
            face.textContent = '😃';
            msg.textContent = '回答正确！';
        }
        mascot.classList.remove('sad');
        mascot.classList.add('happy');
    } else if (type === 'wrong') {
        // 答错时的表情和消息
        face.textContent = '😟';
        msg.textContent = message || '没关系，再试一次！';
        mascot.classList.remove('happy');
        mascot.classList.add('sad');
    } else {
        // 默认状态
        if (consecutiveCorrect >= 10) {
            face.textContent = '🥳';
            msg.textContent = '挑战10连成功！';
        } else if (consecutiveCorrect >= 5) {
            face.textContent = '😄';
            msg.textContent = '5连斩！继续冲！';
        } else if (consecutiveCorrect >= 3) {
            face.textContent = '😊';
            msg.textContent = '3连斩！保持好状态！';
        } else {
            face.textContent = '🤔';
            msg.textContent = '仔细想想哦！';
        }
        mascot.classList.remove('happy', 'sad');
    }
}

// 数字键盘输入 - 答案直接在问号位置显示
function inputNumber(num) {
    if (userAnswer.length < 4) {
        userAnswer += num;
        updateAnswerDisplay();
    }
}

// 清除输入
function clearInput() {
    userAnswer = '';
    updateAnswerDisplay();
}

// 更新答案显示在问号位置
function updateAnswerDisplay() {
    const displayEl = document.getElementById('answer-display');
    if (displayEl) {
        displayEl.textContent = userAnswer || '?';
        if (userAnswer) {
            displayEl.classList.add('has-answer');
        } else {
            displayEl.classList.remove('has-answer');
        }
    }
    
    // 更新底部答案显示区域
    const answerText = document.getElementById('answer-text');
    if (answerText) {
        answerText.textContent = userAnswer || '?';
    }
}

// 比较题型输入
function inputCompare(op) {
    userAnswer = op;
    updateAnswerDisplay();
}

// 语音朗读题目
function speakQuestion() {
    if (!currentQuestion) return;
    
    let text = '';
    
    if (currentQuestion.type === 'oral') {
        const opText = currentQuestion.op === '+' ? '加' : '减';
        text = `${currentQuestion.num1} ${opText} ${currentQuestion.num2} 等于几？`;
    } else if (currentQuestion.type === 'compare') {
        text = `${currentQuestion.num1} 和 ${currentQuestion.num2}，谁大？`;
    } else if (currentQuestion.type === 'fill') {
        text = currentQuestion.content.replace('___', '多少').replace('?', '');
    } else if (currentQuestion.type === 'multi') {
        text = currentQuestion.content.replace(/\+/g, ' 加 ').replace(/-/g, ' 减 ').replace('?', ' 等于多少？');
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
        // 先停止之前的朗读
        speechSynthesis.cancel();
        
        // 开始新的朗读
        speechSynthesis.speak(utterance);
    }
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
        consecutiveCorrect++;
        if (consecutiveCorrect > maxConsecutive) {
            maxConsecutive = consecutiveCorrect;
        }
        
        // 连续答对奖励提示
        let message = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
        let soundType = 'correct';
        if (consecutiveCorrect >= 5) {
            message = '🔥 连续' + consecutiveCorrect + '题正确！';
            soundType = 'streak';
        } else if (consecutiveCorrect >= 3) {
            message = '⭐ 连续' + consecutiveCorrect + '题正确！';
            soundType = 'streak';
        }
        showFeedback('correct', message);
        updateMascot('correct'); // 更新角色状态
        if (soundEnabled) Utils.playSound(soundType);
        
        // 如果是错题重练模式，答对的题目从错题本中移除
        if (practiceType === '错题重练') {
            removeFromWrongList(currentQuestion);
        }
    } else {
        wrongCount++;
        consecutiveCorrect = 0; // 重置连续答对计数
        const wrongMsg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
        showFeedback('wrong', `${wrongMsg} 正确答案是 ${currentQuestion.answer}`);
        updateMascot('wrong', wrongMsg); // 更新角色状态
        if (soundEnabled) Utils.playSound('wrong');
        
        // 保存错题（错题重练模式不重复保存）
        if (practiceType !== '错题重练') {
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
    }
    
    setTimeout(() => {
        currentIndex++;
        loadCurrentQuestion();
    }, 1200);
}

// 切换声音
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    }
}

// 显示反馈
function showFeedback(type, message) {
    const feedback = document.querySelector('.quiz-feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.className = `quiz-feedback ${type} show`;
        
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
    const newlyUnlocked = [];
    
    if (user.practiceCount >= 1 && !medals[0].unlocked) {
        medals[0].unlocked = true;
        newlyUnlocked.push(medals[0]);
    }
    if (user.totalCorrect >= 100 && !medals[1].unlocked) {
        medals[1].unlocked = true;
        newlyUnlocked.push(medals[1]);
    }
    if (user.totalCorrect >= 500 && !medals[2].unlocked) {
        medals[2].unlocked = true;
        newlyUnlocked.push(medals[2]);
    }
    if (correctCount === currentQuestions.length && currentQuestions.length >= 10 && !medals[4].unlocked) {
        medals[4].unlocked = true;
        newlyUnlocked.push(medals[4]);
    }
    
    const allCompleted = Storage.getChallengeProgress().groups.every(group => 
        group.levels.every(level => level.completed)
    );
    if (allCompleted && !medals[5].unlocked) {
        medals[5].unlocked = true;
        newlyUnlocked.push(medals[5]);
    }
    
    Storage.saveMedalsData(medals);
    
    // 显示新解锁的勋章
    if (newlyUnlocked.length > 0) {
        showAchievement(newlyUnlocked[0]);
    }
}

// 显示成就解锁弹窗
function showAchievement(medal) {
    const modal = document.getElementById('achievement-modal');
    const iconEl = document.querySelector('.achievement-icon');
    const nameEl = document.getElementById('achievement-name');
    const descEl = document.getElementById('achievement-desc');
    
    if (iconEl) iconEl.textContent = medal.icon;
    if (nameEl) nameEl.textContent = medal.name;
    if (descEl) descEl.textContent = medal.description;
    if (modal) modal.classList.add('show');
}

// 关闭成就弹窗
function closeAchievementModal() {
    const modal = document.getElementById('achievement-modal');
    if (modal) modal.classList.remove('show');
}

// 显示结果页面
function showResult(correct, wrong, time, coins) {
    const resultPage = document.getElementById('result-page');
    const isPerfect = correct === currentQuestions.length;
    const accuracy = Math.round((correct / currentQuestions.length) * 100);
    
    // 连续答对奖励额外积分
    let bonusCoins = 0;
    if (maxConsecutive >= 10) {
        bonusCoins = 20;
    } else if (maxConsecutive >= 5) {
        bonusCoins = 10;
    } else if (maxConsecutive >= 3) {
        bonusCoins = 5;
    }
    
    if (bonusCoins > 0) {
        const user = Storage.getUserData();
        user.coins += bonusCoins;
        Storage.saveUserData(user);
    }
    
    // 播放完成音效
    if (soundEnabled) {
        try {
            Utils.playSound('complete');
        } catch (e) {}
    }
    
    resultPage.innerHTML = 
        '<div class="header">' +
            '<button class="back-btn" onclick="showPage(\'home-page\')">← 返回首页</button>' +
        '</div>' +
        '<div class="result-content">' +
            '<div class="result-icon">' + (isPerfect ? '🎉' : (accuracy >= 80 ? '👍' : '💪')) + '</div>' +
            '<h2>' + (isPerfect ? '太棒了！全对！' : (accuracy >= 80 ? '做得很好！' : '继续加油！')) + '</h2>' +
            '<div class="stats">' +
                '<div class="stat-item">' +
                    '<span class="stat-value">' + correct + '/' + currentQuestions.length + '</span>' +
                    '<span class="stat-label">正确率 ' + accuracy + '%</span>' +
                '</div>' +
                '<div class="stat-item">' +
                    '<span class="stat-value">' + formatTime(time) + '</span>' +
                    '<span class="stat-label">用时</span>' +
                '</div>' +
                '<div class="stat-item">' +
                    '<span class="stat-value">+' + coins + '</span>' +
                    '<span class="stat-label">获得积分</span>' +
                '</div>' +
            '</div>' +
            (maxConsecutive >= 3 ? '<div style="text-align: center; margin: 15px 0; padding: 10px; background: #fff8e1; border-radius: 10px;"><span style="font-size: 20px;">🔥</span> 最大连续答对: <strong style="color: #ff9800;">' + maxConsecutive + '题</strong>' + (bonusCoins > 0 ? ' <span style="color: #4caf50;">(+' + bonusCoins + '奖励积分)</span>' : '') + '</div>' : '') +
            '<div class="result-actions">' +
                (wrong > 0 ? '<button class="result-btn" onclick="showPage(\'wrong-list\')">📝 查看错题 (' + wrong + '题)</button>' : '') +
                '<button class="result-btn" onclick="restartPractice()">🔄 再练一次</button>' +
                '<button class="result-btn" onclick="showPage(\'home-page\')">🏠 返回首页</button>' +
            '</div>' +
        '</div>';
    
    showPage('result-page');
    
    // 播放奖励动画
    if (coins > 0 || bonusCoins > 0) {
        const totalCoins = coins + bonusCoins;
        playCoinAnimation(totalCoins);
    }
}

// 金币雨动画
function playCoinAnimation(coinCount) {
    const container = document.createElement('div');
    container.className = 'coin-container';
    container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999;';
    document.body.appendChild(container);
    
    const numCoins = Math.min(coinCount, 30);
    
    for (let i = 0; i < numCoins; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.innerHTML = '💰';
            coin.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: -50px;
                font-size: ${24 + Math.random() * 16}px;
                animation: coinFall ${1.5 + Math.random() * 1.5}s ease-in forwards;
            `;
            container.appendChild(coin);
            
            // 动画结束后移除金币
            setTimeout(() => {
                coin.remove();
            }, 3000);
        }, i * 100);
    }
    
    // 清理容器
    setTimeout(() => {
        container.remove();
    }, 3500);
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
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="start-btn" onclick="practiceWrongList()" style="flex: 1; padding: 12px; font-size: 14px;">
                    📝 错题重练
                </button>
                <button class="clear-btn" onclick="clearWrongList()" style="flex: 1; padding: 12px; font-size: 14px;">
                    🗑️ 清空错题本
                </button>
            </div>
        `;
    }
    
    Storage.updateDailyTask(4, 1);
}

// 从错题本中移除题目
function removeFromWrongList(question) {
    let wrongList = Storage.getWrongQuestions();
    wrongList = wrongList.filter(q => 
        !(q.num1 === question.num1 && 
          q.num2 === question.num2 && 
          q.op === question.op)
    );
    Storage.saveWrongQuestions(wrongList);
}

// 错题重练
function practiceWrongList() {
    const wrongList = Storage.getWrongQuestions();
    if (wrongList.length === 0) {
        alert('没有错题需要练习！');
        return;
    }
    
    isChallengeMode = false;
    practiceType = '错题重练';
    
    // 从错题中生成题目
    currentQuestions = wrongList.map(item => {
        return {
            id: Utils.generateId(),
            type: item.type || 'oral',
            num1: item.num1,
            num2: item.num2,
            op: item.op,
            content: item.content,
            answer: item.correctAnswer
        };
    });
    
    currentQuestions = Utils.shuffleArray(currentQuestions);
    startPracticeSession();
}

// 加载勋章页面
function loadMedals() {
    const medals = Storage.getMedalsData();
    const container = document.querySelector('.medals-content');
    
    if (!container) return;
    
    const unlockedCount = medals.filter(m => m.unlocked).length;
    
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; font-size: 16px;">
            已解锁: <span style="font-weight: bold; color: #667eea;">${unlockedCount}</span> / ${medals.length}
        </div>
        <div class="medals-grid">
            ${medals.map(m => `
                <div class="medal-item ${m.unlocked ? 'unlocked' : ''}">
                    <span class="medal-icon">${m.unlocked ? m.icon : '🔒'}</span>
                    <span class="medal-name">${m.name}</span>
                    <span class="medal-desc">${m.description}</span>
                </div>
            `).join('')}
        </div>
    `;
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
    const wrongList = Storage.getWrongQuestions();
    
    const total = user.totalCorrect + user.totalWrong;
    const accuracy = total > 0 ? Math.round((user.totalCorrect / total) * 100) : 0;
    
    // 计算最近7天的练习情况
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecords = history.filter(r => new Date(r.date) >= sevenDaysAgo);
    
    // 按题型统计
    const typeStats = {};
    history.forEach(r => {
        const type = r.type.split(' ')[0];
        if (!typeStats[type]) typeStats[type] = { correct: 0, total: 0 };
        typeStats[type].correct += r.correct;
        typeStats[type].total += r.total;
    });
    
    const container = document.querySelector('.parent-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-section">
            <h3>📊 学习概览</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-icon">📝</span>
                    <span class="stat-num">${user.practiceCount}</span>
                    <span class="stat-desc">总练习次数</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">✅</span>
                    <span class="stat-num">${user.totalCorrect}</span>
                    <span class="stat-desc">总答对题数</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">❌</span>
                    <span class="stat-num">${user.totalWrong}</span>
                    <span class="stat-desc">总错题数</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-num">${accuracy}%</span>
                    <span class="stat-desc">正确率</span>
                </div>
            </div>
            
            <!-- 正确率进度条 -->
            <div class="progress-card">
                <div class="progress-card-header">
                    <span>正确率趋势</span>
                    <span class="progress-card-value">${accuracy}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${accuracy}%;"></div>
                </div>
                <div class="progress-card-footer">
                    <span style="color: ${accuracy >= 80 ? '#4caf50' : (accuracy >= 60 ? '#ff9800' : '#f44336')};">
                        ${accuracy >= 80 ? '优秀！继续保持！' : (accuracy >= 60 ? '良好，还需加油！' : '需要多加练习！')}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="recent-activity">
            <h3>📅 最近7天练习</h3>
            <div class="activity-stats">
                <div class="activity-stat">
                    <span class="activity-num">${recentRecords.length}</span>
                    <span class="activity-desc">练习天数</span>
                </div>
                <div class="activity-stat">
                    <span class="activity-num">${recentRecords.reduce((sum, r) => sum + r.total, 0)}</span>
                    <span class="activity-desc">完成题目</span>
                </div>
                <div class="activity-stat">
                    <span class="activity-num">${wrongList.length}</span>
                    <span class="activity-desc">待解决错题</span>
                </div>
            </div>
            
            <div class="quick-stats">
                <h4>题型分布</h4>
                <div class="quick-stat-list">
                    ${Object.keys(typeStats).slice(0, 4).map(type => {
                        const stat = typeStats[type];
                        const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                        return `
                            <div class="quick-stat-item">
                                <div class="quick-stat-header">
                                    <span>${type}</span>
                                    <span style="color: #667eea; font-weight: bold;">${acc}%</span>
                                </div>
                                <div class="quick-stat-bar">
                                    <div class="quick-stat-progress" style="width: ${acc}%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
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
                    ${history.slice(0, 15).map(record => {
                        const recAcc = Math.round((record.correct / record.total) * 100);
                        return `
                            <div class="history-item">
                                <div class="history-main">
                                    <span class="history-date">${Utils.formatDate(record.date)}</span>
                                    <span class="history-detail">${record.type}</span>
                                </div>
                                <div class="history-right">
                                    <span class="history-accuracy" style="color: ${recAcc >= 80 ? '#4caf50' : '#ff9800'};">
                                        ${record.correct}/${record.total}题 (${recAcc}%)
                                    </span>
                                    <span class="history-time">${formatTime(record.time)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
        <div class="action-buttons">
            <button class="export-btn" onclick="exportData()">📤 导出数据</button>
            <button class="export-btn" onclick="importData()" style="background: #4caf50;">📥 导入数据</button>
        </div>
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

// 限时挑战模式相关变量
let timedMode = false;
let timeLimit = 60; // 默认60秒
let timedInterval = null;
let timeRemaining = 60;

// 显示限时挑战设置
function showTimedChallenge() {
    const modal = document.createElement('div');
    modal.id = 'timed-modal';
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; padding: 20px;">
            <h3 style="margin-bottom: 20px;">⏱️ 限时挑战</h3>
            <p style="margin-bottom: 15px; color: #666;">选择时间限制，在规定时间内完成尽可能多的题目！</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
                <button class="option-btn" onclick="selectTimedMode(30)">30秒</button>
                <button class="option-btn active" onclick="selectTimedMode(60)">60秒</button>
                <button class="option-btn" onclick="selectTimedMode(120)">120秒</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="modal-btn" onclick="closeTimedModal()">取消</button>
                <button class="modal-btn" style="background: #ff9800;" onclick="startTimedChallenge()">开始挑战</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 选择时间模式
function selectTimedMode(seconds) {
    timeLimit = seconds;
    timeRemaining = seconds;
    const modal = document.getElementById('timed-modal');
    if (modal) {
        const buttons = modal.querySelectorAll('.option-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// 关闭限时挑战模态框
function closeTimedModal() {
    const modal = document.getElementById('timed-modal');
    if (modal) modal.remove();
}

// 开始限时挑战
function startTimedChallenge() {
    closeTimedModal();
    timedMode = true;
    isChallengeMode = false;
    practiceType = '限时挑战';
    
    // 生成10道题
    currentQuestions = [];
    for (let i = 0; i < 10; i++) {
        const rand = Math.random();
        if (rand < 0.4) {
            currentQuestions.push(OralModule.generateQuestion(selectedLevel, 'mix'));
        } else if (rand < 0.7) {
            currentQuestions.push(FillModule.generateQuestion(selectedLevel, 'mix'));
        } else {
            currentQuestions.push(MultiplicationModule.generateQuestion(selectedLevel, 'add'));
        }
    }
    
    timeRemaining = timeLimit;
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    totalTime = 0;
    startTime = Date.now();
    userAnswer = '';
    consecutiveCorrect = 0;
    maxConsecutive = 0;
    
    document.querySelector('.answer-keypad').style.display = 'block';
    document.querySelector('.compare-buttons').style.display = 'none';
    
    if (timedInterval) clearInterval(timedInterval);
    timedInterval = setInterval(updateTimedMode, 1000);
    
    showPage('practice-page');
    loadCurrentQuestion();
}

// 更新限时模式
function updateTimedMode() {
    timeRemaining--;
    
    const timerEl = document.getElementById('timer-display');
    if (timerEl) {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerEl.textContent = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `0:${secs}`;
        
        // 时间警示
        if (timeRemaining <= 10) {
            timerEl.style.color = '#f44336';
        } else if (timeRemaining <= 30) {
            timerEl.style.color = '#ff9800';
        } else {
            timerEl.style.color = '#667eea';
        }
    }
    
    if (timeRemaining <= 0) {
        endTimedChallenge();
    }
}

// 结束限时挑战
function endTimedChallenge() {
    if (timedInterval) {
        clearInterval(timedInterval);
        timedInterval = null;
    }
    
    timedMode = false;
    totalTime = timeLimit - timeRemaining;
    
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
    
    updateMedals();
    
    showTimedResult(correctCount, wrongCount, totalTime, earnedCoins);
}

// 显示限时挑战结果
function showTimedResult(correct, wrong, time, coins) {
    const resultPage = document.getElementById('result-page');
    const accuracy = Math.round((correct / currentQuestions.length) * 100);
    
    // 根据答对题数给出评价
    let rating = '';
    let ratingEmoji = '';
    if (correct >= 9) {
        rating = '神级！打破纪录！';
        ratingEmoji = '🏆';
    } else if (correct >= 7) {
        rating = '太棒了！速度飞快！';
        ratingEmoji = '🎉';
    } else if (correct >= 5) {
        rating = '做得不错！继续加油！';
        ratingEmoji = '👍';
    } else {
        rating = '再接再厉！';
        ratingEmoji = '💪';
    }
    
    resultPage.innerHTML = 
        '<div class="header">' +
            '<button class="back-btn" onclick="showPage(\'home-page\')">← 返回首页</button>' +
        '</div>' +
        '<div class="result-content">' +
            '<div class="result-icon">' + ratingEmoji + '</div>' +
            '<h2>' + rating + '</h2>' +
            '<div style="font-size: 36px; font-weight: bold; color: #667eea; margin: 15px 0;">' +
                correct + '/' + currentQuestions.length + ' 题' +
            '</div>' +
            '<div style="font-size: 18px; color: #666; margin-bottom: 15px;">用时 ' + formatTime(time) + '</div>' +
            '<div class="stats">' +
                '<div class="stat-item">' +
                    '<span class="stat-value">' + accuracy + '%</span>' +
                    '<span class="stat-label">正确率</span>' +
                '</div>' +
                '<div class="stat-item">' +
                    '<span class="stat-value">+' + coins + '</span>' +
                    '<span class="stat-label">获得积分</span>' +
                '</div>' +
            '</div>' +
            '<div class="result-actions">' +
                (wrong > 0 ? '<button class="result-btn" onclick="showPage(\'wrong-list\')">📝 查看错题 (' + wrong + '题)</button>' : '') +
                '<button class="result-btn" onclick="showTimedChallenge()">⏱️ 再来一次</button>' +
                '<button class="result-btn" onclick="showPage(\'home-page\')">🏠 返回首页</button>' +
            '</div>' +
        '</div>';
    
    showPage('result-page');
    
    // 播放奖励动画
    if (coins > 0) {
        playCoinAnimation(coins);
    }
}

// 学习记录页面
function loadStudyHistory() {
    const history = Storage.getPracticeHistory();
    const user = Storage.getUserData();
    const historyContent = document.querySelector('.history-content');
    
    // 计算统计数据
    const totalQuestions = history.reduce((sum, r) => sum + r.total, 0);
    const totalCorrect = history.reduce((sum, r) => sum + r.correct, 0);
    const totalTime = history.reduce((sum, r) => sum + r.time, 0);
    const accuracy = history.length > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    const typeNames = {
        'oral': '口算题',
        'fill': '填空题',
        'multi': '连加连减',
        'multiply': '乘法练习',
        'compare': '比大小',
        'random': '随机混合',
        'challenge': '挑战模式',
        'timed': '限时挑战'
    };
    
    historyContent.innerHTML = `
        <div class="stats-summary">
            <h3>📈 学习统计</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-value">${history.length}</div>
                    <div class="stat-label">练习次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${totalCorrect}</div>
                    <div class="stat-label">答对题数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${formatTime(totalTime)}</div>
                    <div class="stat-label">累计用时</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${accuracy}%</div>
                    <div class="stat-label">平均正确率</div>
                </div>
            </div>
        </div>
        
        <div class="history-list">
            <h3>📋 练习记录</h3>
            ${history.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <p>还没有练习记录</p>
                    <button class="start-btn" onclick="showPage('custom-practice')">开始第一次练习</button>
                </div>
            ` : history.map((record, index) => {
                const date = new Date(record.date);
                const dateStr = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const acc = Math.round((record.correct / record.total) * 100);
                const accColor = acc >= 80 ? '#4caf50' : acc >= 60 ? '#ff9800' : '#f44336';
                return `
                    <div class="history-item">
                        <div class="history-date">${dateStr}</div>
                        <div class="history-info">
                            <div class="history-type">${typeNames[record.type] || record.type}</div>
                            <div class="history-result" style="color: ${accColor}">
                                ${record.correct}/${record.total} 题 (${acc}%)
                            </div>
                            <div class="history-time">用时 ${formatTime(record.time)}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
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
window.inputCompare = inputCompare;
window.updateAnswerDisplay = updateAnswerDisplay;
window.speakQuestion = speakQuestion;
window.doCheckIn = doCheckIn;
window.confirmExit = confirmExit;
window.restartPractice = restartPractice;
window.clearWrongList = clearWrongList;
window.exportData = exportData;
window.importData = importData;
window.buyTheme = buyTheme;
window.closeAchievementModal = closeAchievementModal;
window.showTimedChallenge = showTimedChallenge;
window.selectTimedMode = selectTimedMode;
window.startTimedChallenge = startTimedChallenge;

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // 只在练习页面生效
    if (!document.getElementById('practice-page').classList.contains('active')) {
        return;
    }
    
    // 数字键输入
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(parseInt(e.key));
    }
    // 清除输入
    else if (e.key === 'Escape' || e.key === 'Backspace') {
        clearInput();
    }
    // 提交答案
    else if (e.key === 'Enter') {
        submitAnswer();
    }
    // 比较符号
    else if (e.key === '>') {
        inputCompare('>');
        submitAnswer();
    }
    else if (e.key === '<') {
        inputCompare('<');
        submitAnswer();
    }
});