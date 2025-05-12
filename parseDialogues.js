const fs = require('fs');
const path = require('path');

// Action 프리셋 정의
const actionPresets = {
    chara: (dir) => `() => updateImage(characterImage, 'chara/${dir}')`
};

// 텍스트 파일 파싱 함수
function parseDialogueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const dialogueName = path.basename(filePath, '.txt'); // 파일명에서 확장자 제거
    const dialogueArray = [];
    let currentObject = null;

    lines.forEach((line, index) => {
        if (line.startsWith('*')) {
            // 새로운 label 시작
            if (currentObject) {
                dialogueArray.push(currentObject); // 이전 객체 저장
            }
            currentObject = {
                label: line.slice(1).trim(),
                steps: [],
            };
        } else if (line.startsWith('-')) {
            // steps 종료 및 allowedCommands 또는 destination 설정
            const type = line[1]; // 'a' 또는 'd'
            const value = lines[index + 1]; // 다음 줄 값
            if (type === 'a') {
                currentObject.allowedCommands = value.split(' ').map(Number);
            } else if (type === 'd') {
                const [dialogue, label] = value.split(' ');
                currentObject.destination = { dialogue, label };
            }
        } else {
            // steps 처리
            const [text, actionPart] = line.split('/');
            const step = { text: text.trim(), action: null };

            if (actionPart) {
                const actionKey = actionPart.split(' ')[0].trim(); // '/' 뒤 첫 단어
                const comment = actionPart.slice(actionKey.length).trim(); // 나머지 부분

                if (actionPresets[actionKey]) {
                    step.action = eval(actionPresets[actionKey](comment)); // 문자열 대신 함수로 변환
                } else if (comment.startsWith('//')) {
                    step.action = null;
                    step.comment = comment; // 주석 처리
                }
            }

            // "1 2" 또는 "tutorial firstLine" 같은 항목은 steps에 추가하지 않음
            if (!/^\d+(\s+\d+)*$/.test(step.text) && !/^[a-zA-Z]+\s+[a-zA-Z]+$/.test(step.text)) {
                currentObject.steps.push(step);
            }
        }
    });

    if (currentObject) {
        dialogueArray.push(currentObject); // 마지막 객체 저장
    }

    return `window.${dialogueName} = ${formatAsJavaScriptObject(dialogueArray)};`;
}

// JavaScript 객체 형식으로 문자열 생성 함수
function formatAsJavaScriptObject(obj, indent = 4, level = 0) {
    const indentation = ' '.repeat(level * indent);

    if (Array.isArray(obj)) {
        const items = obj.map(item => formatAsJavaScriptObject(item, indent, level + 1));
        return `[\n${indentation + ' '.repeat(indent)}${items.join(`,\n${indentation + ' '.repeat(indent)}`)}\n${indentation}]`;
    } else if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj)
            .map(([key, value]) => `${key}: ${formatAsJavaScriptObject(value, indent, level + 1)}`);
        return `{\n${indentation + ' '.repeat(indent)}${entries.join(`,\n${indentation + ' '.repeat(indent)}`)}\n${indentation}}`;
    } else if (typeof obj === 'string') {
        return `"${obj}"`;
    } else {
        return obj;
    }
}

// 모든 txt 파일 파싱 및 합치기
function parseAllDialogues(inputFolder, outputFile) {
    const files = fs.readdirSync(inputFolder).filter(file => file.endsWith('.txt'));
    const parsedDialogues = files.map(file => {
        const filePath = path.join(inputFolder, file);
        return parseDialogueFile(filePath);
    });

    const outputContent = parsedDialogues.join('\n\n');
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`All dialogues parsed and saved to ${outputFile}`);
}

// 실행
const inputFolder = path.join(__dirname, 'dialogues');
const outputFile = path.join(__dirname, 'dialogues', 'dialogue_init.js');
parseAllDialogues(inputFolder, outputFile);