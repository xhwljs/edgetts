function generateCompareQuestion(levelOrRange) {
    let range;
    if (typeof levelOrRange === 'object' && levelOrRange.min !== undefined) {
        range = levelOrRange;
    } else {
        range = Utils.calculateDifficultyRange(levelOrRange);
    }
    let num1, num2, answer;
    
    num1 = Utils.getRandomInt(range.min, range.max);
    num2 = Utils.getRandomInt(range.min, range.max);
    
    while (num1 === num2) {
        num2 = Utils.getRandomInt(range.min, range.max);
    }
    
    if (num1 > num2) {
        answer = '>';
    } else {
        answer = '<';
    }
    
    return {
        type: 'compare',
        content: `${num1} ? ${num2}`,
        num1: num1,
        num2: num2,
        answer: answer,
        id: Utils.generateId()
    };
}

function generateCompareQuestions(count, levelOrRange) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        questions.push(generateCompareQuestion(levelOrRange));
    }
    return questions;
}

window.CompareModule = {
    generateQuestion: generateCompareQuestion,
    generateQuestions: generateCompareQuestions
};