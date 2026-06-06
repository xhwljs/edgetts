function generateOralQuestion(level, operation) {
    const range = Utils.calculateDifficultyRange(level);
    let num1, num2, op, answer;
    
    if (operation === 'mix') {
        op = Math.random() > 0.5 ? '+' : '-';
    } else {
        op = operation === 'add' ? '+' : '-';
    }
    
    if (op === '+') {
        num1 = Utils.getRandomInt(range.min, range.max);
        num2 = Utils.getRandomInt(range.min, range.max - num1);
        answer = num1 + num2;
    } else {
        num1 = Utils.getRandomInt(range.min, range.max);
        num2 = Utils.getRandomInt(range.min, num1);
        answer = num1 - num2;
    }
    
    return {
        type: 'oral',
        num1,
        num2,
        op,
        answer,
        id: Utils.generateId()
    };
}

function generateOralQuestions(count, level, operation) {
    const questions = [];
    const usedKeys = new Set();
    let attempts = 0;
    const maxAttempts = count * 10;

    while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        const question = generateOralQuestion(level, operation);
        const key = `${question.num1}-${question.op}-${question.num2}`;

        if (!usedKeys.has(key)) {
            usedKeys.add(key);
            questions.push(question);
        }
    }

    return questions;
}

window.OralModule = {
    generateQuestion: generateOralQuestion,
    generateQuestions: generateOralQuestions
};