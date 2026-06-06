function generateFillQuestion(level, operation) {
    const range = Utils.calculateDifficultyRange(level);
    let content, answer, num1, num2, op;
    
    if (operation === 'mix') {
        op = Math.random() > 0.5 ? '+' : '-';
    } else {
        op = operation === 'add' ? '+' : '-';
    }
    
    const blankPosition = Math.floor(Math.random() * 3);
    
    if (op === '+') {
        num1 = Utils.getRandomInt(range.min, range.max);
        num2 = Utils.getRandomInt(range.min, range.max - num1);
        
        switch (blankPosition) {
            case 0:
                content = `___ ${op} ${num2} = ${num1 + num2}`;
                answer = num1;
                break;
            case 1:
                content = `${num1} ${op} ___ = ${num1 + num2}`;
                answer = num2;
                break;
            default:
                content = `${num1} ${op} ${num2} = ___`;
                answer = num1 + num2;
        }
    } else {
        num1 = Utils.getRandomInt(range.min, range.max);
        num2 = Utils.getRandomInt(range.min, num1);
        
        switch (blankPosition) {
            case 0:
                content = `___ ${op} ${num2} = ${num1 - num2}`;
                answer = num1;
                break;
            case 1:
                content = `${num1} ${op} ___ = ${num1 - num2}`;
                answer = num2;
                break;
            default:
                content = `${num1} ${op} ${num2} = ___`;
                answer = num1 - num2;
        }
    }
    
    return {
        type: 'fill',
        content,
        answer,
        num1,
        num2,
        op,
        id: Utils.generateId()
    };
}

function generateFillQuestions(count, level, operation) {
    const questions = [];
    const usedKeys = new Set();
    let attempts = 0;
    const maxAttempts = count * 10;

    while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        const question = generateFillQuestion(level, operation);
        const key = `${question.num1}-${question.op}-${question.num2}`;

        if (!usedKeys.has(key)) {
            usedKeys.add(key);
            questions.push(question);
        }
    }

    return questions;
}

window.FillModule = {
    generateQuestion: generateFillQuestion,
    generateQuestions: generateFillQuestions
};