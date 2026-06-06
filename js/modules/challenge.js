// 增强版挑战模式
function generateChallengeQuestions(groupId, levelId) {
    const level = groupId;
    const count = 10;
    const questions = [];
    
    // 根据关卡组和关卡号调整题目类型比例
    const difficultyBonus = (levelId - 1) * 0.1;
    const oralRatio = 0.6 - difficultyBonus;
    const fillRatio = 0.2 + difficultyBonus * 0.5;
    const multiRatio = 0.2 + difficultyBonus * 0.5;
    
    const oralCount = Math.ceil(count * Math.max(0.3, oralRatio));
    const fillCount = Math.ceil(count * Math.min(0.4, fillRatio));
    const multiCount = count - oralCount - fillCount;
    
    for (let i = 0; i < oralCount; i++) {
        questions.push(OralModule.generateQuestion(level, 'mix'));
    }
    
    for (let i = 0; i < fillCount; i++) {
        questions.push(FillModule.generateQuestion(level, 'mix'));
    }
    
    // 高级关卡添加连加连减和乘法
    if (groupId >= 3 && multiCount > 0) {
        for (let i = 0; i < multiCount; i++) {
            if (groupId === 4 && levelId >= 3) {
                questions.push(MultiplicationModule.generateQuestion(level, 'add'));
            } else {
                questions.push(MultiModule.generateQuestion(level, 'mix'));
            }
        }
    }
    
    return Utils.shuffleArray(questions);
}

function getChallengeGroups() {
    return [
        {
            id: 1,
            name: '🌱 入门篇 - 10以内加减法',
            levels: 5,
            description: '掌握基础，建立信心',
            levelNames: ['第1关-认识数字', '第2关-5以内加法', '第3关-5以内减法', '第4关-10以内加法', '第5关-10以内减法']
        },
        {
            id: 2,
            name: '🌿 基础篇 - 20以内运算',
            levels: 5,
            description: '巩固基础，提升速度',
            levelNames: ['第1关-10以内混合', '第2关-15以内加法', '第3关-15以内减法', '第4关-20以内加法', '第5关-20以内减法']
        },
        {
            id: 3,
            name: '🌳 进阶篇 - 50以内挑战',
            levels: 5,
            description: '挑战自我，迈向高手',
            levelNames: ['第1关-20以内混合', '第2关-连加练习', '第3关-连减练习', '第4关-30以内运算', '第5关-50以内运算']
        },
        {
            id: 4,
            name: '🌲 高级篇 - 100以内高手',
            levels: 5,
            description: '成为计算小达人',
            levelNames: ['第1关-50以内混合', '第2关-乘法入门', '第3关-乘法练习', '第4关-综合运算', '第5关-终极挑战']
        }
    ];
}

function checkChallengeComplete(groupId, levelId, answers) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    return correctCount === answers.length;
}

// 获取关卡描述
function getLevelDescription(groupId, levelId) {
    const groups = getChallengeGroups();
    const group = groups.find(g => g.id === groupId);
    if (group && group.levelNames && group.levelNames[levelId - 1]) {
        return group.levelNames[levelId - 1];
    }
    return `第${levelId}关`;
}

window.ChallengeModule = {
    generateQuestions: generateChallengeQuestions,
    getGroups: getChallengeGroups,
    checkComplete: checkChallengeComplete,
    getLevelDesc: getLevelDescription
};
