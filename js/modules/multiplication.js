// 乘法练习模块
const MultiplicationModule = {
    // 生成题目
    generateQuestions(count, levelOrRange, op) {
        const questions = [];
        const usedKeys = new Set();
        let attempts = 0;
        const maxAttempts = count * 10;

        while (questions.length < count && attempts < maxAttempts) {
            attempts++;
            const question = this.generateQuestion(levelOrRange, op);
            const key = `${question.num1}-${question.op}-${question.num2}`;

            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                questions.push(question);
            }
        }

        return questions;
    },

    // 生成单道题目
    generateQuestion(levelOrRange, op) {
        let num1, num2, answer;
        let max;
        if (typeof levelOrRange === 'object' && levelOrRange.min !== undefined) {
            max = Math.min(levelOrRange.max, 20);
        } else {
            max = [5, 9, 12, 20][levelOrRange - 1] || 9;
        }
        
        num1 = Utils.getRandomInt(1, max);
        num2 = Utils.getRandomInt(1, 9);
        
        if (op === 'sub') {
            // 乘法退位（结果在范围内）
            answer = num1 * num2;
            num1 = Utils.getRandomInt(1, Math.floor(max / num2));
            answer = num1 * num2;
        } else {
            answer = num1 * num2;
        }
        
        return {
            id: Utils.generateId(),
            type: 'multiplication',
            num1: num1,
            num2: num2,
            op: '×',
            answer: answer
        };
    },

    // 生成填空题
    generateFillQuestion(levelOrRange) {
        let max;
        if (typeof levelOrRange === 'object' && levelOrRange.min !== undefined) {
            max = Math.min(levelOrRange.max, 20);
        } else {
            max = [5, 9, 12, 20][levelOrRange - 1] || 9;
        }
        const num1 = Utils.getRandomInt(1, max);
        const num2 = Utils.getRandomInt(1, 9);
        const answer = num1 * num2;
        const positions = ['first', 'second', 'result'];
        const pos = positions[Utils.getRandomInt(0, 2)];
        
        let content = '';
        if (pos === 'first') {
            content = `? × ${num2} = ${answer}`;
        } else if (pos === 'second') {
            content = `${num1} × ? = ${answer}`;
        } else {
            content = `${num1} × ${num2} = ?`;
        }
        
        return {
            id: Utils.generateId(),
            type: 'multiplication',
            num1: num1,
            num2: num2,
            op: '×',
            answer: pos === 'first' ? num1 : (pos === 'second' ? num2 : answer),
            content: content
        };
    },

    // 生成比较题
    generateCompareQuestions(count, levelOrRange) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateCompareQuestion(levelOrRange));
        }
        return questions;
    },

    generateCompareQuestion(levelOrRange) {
        let max;
        if (typeof levelOrRange === 'object' && levelOrRange.min !== undefined) {
            max = Math.min(levelOrRange.max, 20);
        } else {
            max = [5, 9, 12, 20][levelOrRange - 1] || 9;
        }
        const num1 = Utils.getRandomInt(1, max) * Utils.getRandomInt(1, 5);
        const num2 = Utils.getRandomInt(1, max) * Utils.getRandomInt(1, 5);
        const correct = num1 > num2 ? '>' : (num1 < num2 ? '<' : '=');
        
        return {
            id: Utils.generateId(),
            type: 'multiplication_compare',
            num1: num1,
            num2: num2,
            content: `${num1} ? ${num2}`,
            answer: correct
        };
    }
};

window.MultiplicationModule = MultiplicationModule;
