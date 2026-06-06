// 连加连减题型模块
function generateMultiQuestion(levelOrRange, operation) {
    let range;
    if (typeof levelOrRange === 'object' && levelOrRange.min !== undefined) {
        range = levelOrRange;
    } else {
        range = Utils.calculateDifficultyRange(levelOrRange);
    }
    let nums = [];
    let ops = [];
    let answer;
    let content = '';
    
    const numCount = 3; // 三个数运算
    
    if (operation === 'add') {
        // 连加：a + b + c
        nums[0] = Utils.getRandomInt(range.min, Math.floor(range.max / 2));
        nums[1] = Utils.getRandomInt(range.min, Math.floor(range.max / 2) - nums[0]);
        nums[2] = Utils.getRandomInt(range.min, range.max - nums[0] - nums[1]);
        ops = ['+', '+'];
        answer = nums[0] + nums[1] + nums[2];
    } else if (operation === 'sub') {
        // 连减：a - b - c
        nums[0] = Utils.getRandomInt(Math.floor(range.max / 2), range.max);
        nums[1] = Utils.getRandomInt(range.min, Math.floor(nums[0] / 2));
        nums[2] = Utils.getRandomInt(range.min, nums[0] - nums[1]);
        ops = ['-', '-'];
        answer = nums[0] - nums[1] - nums[2];
    } else {
        // 混合：a + b - c 或 a - b + c
        if (Math.random() > 0.5) {
            // a + b - c
            nums[0] = Utils.getRandomInt(range.min, Math.floor(range.max / 2));
            nums[1] = Utils.getRandomInt(range.min, Math.floor(range.max / 2) - nums[0]);
            const sum = nums[0] + nums[1];
            nums[2] = Utils.getRandomInt(range.min, sum);
            ops = ['+', '-'];
            answer = nums[0] + nums[1] - nums[2];
        } else {
            // a - b + c
            nums[0] = Utils.getRandomInt(Math.floor(range.max / 2), range.max);
            nums[1] = Utils.getRandomInt(range.min, nums[0]);
            nums[2] = Utils.getRandomInt(range.min, range.max - (nums[0] - nums[1]));
            ops = ['-', '+'];
            answer = nums[0] - nums[1] + nums[2];
        }
    }
    
    // 构建显示内容
    content = `${nums[0]} ${ops[0]} ${nums[1]} ${ops[1]} ${nums[2]} = ?`;
    
    return {
        type: 'multi',
        content,
        nums,
        ops,
        answer,
        num1: nums[0],
        num2: nums[1],
        num3: nums[2],
        op: ops.join(''),
        id: Utils.generateId()
    };
}

function generateMultiQuestions(count, levelOrRange, operation) {
    const questions = [];
    const usedKeys = new Set();
    let attempts = 0;
    const maxAttempts = count * 10;

    while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        const question = generateMultiQuestion(levelOrRange, operation);
        const key = `${question.num1}-${question.op}-${question.num2}-${question.num3}`;

        if (!usedKeys.has(key)) {
            usedKeys.add(key);
            questions.push(question);
        }
    }

    return questions;
}

window.MultiModule = {
    generateQuestion: generateMultiQuestion,
    generateQuestions: generateMultiQuestions
};