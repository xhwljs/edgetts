function generateChallengeQuestions(groupId, levelId) {
    const level = groupId;
    const count = 10;
    
    const questions = [];
    const oralCount = Math.ceil(count * 0.6);
    const fillCount = count - oralCount;
    
    for (let i = 0; i < oralCount; i++) {
        questions.push(OralModule.generateQuestion(level, 'mix'));
    }
    
    for (let i = 0; i < fillCount; i++) {
        questions.push(FillModule.generateQuestion(level, 'mix'));
    }
    
    return Utils.shuffleArray(questions);
}

function getChallengeGroups() {
    return [
        { id: 1, name: '🌱 入门篇 (0-10)', levels: 5 },
        { id: 2, name: '🌿 基础篇 (0-20)', levels: 5 },
        { id: 3, name: '🌳 进阶篇 (0-50)', levels: 5 },
        { id: 4, name: '🌲 高级篇 (0-100)', levels: 5 }
    ];
}

function checkChallengeComplete(groupId, levelId, answers) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    return correctCount === answers.length;
}

window.ChallengeModule = {
    generateQuestions: generateChallengeQuestions,
    getGroups: getChallengeGroups,
    checkComplete: checkChallengeComplete
};