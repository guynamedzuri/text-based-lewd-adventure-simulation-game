const fs = require('fs');
const path = require('path');

// Action 프리셋 정의
const actionPresets = {
    chara: (dir) => `() => updateImage(characterImage, 'chara/${dir}')`,
    showTitle: () => `() => {
        const logWindow = document.getElementById('logWindow');
        if (logWindow) {
            const img = document.createElement('img');
            img.src = 'title.png'; // 메인 디렉토리의 title.png
            img.alt = '타이틀 이미지';
            img.style.width = '100%'; // 이미지 크기 조정
            img.style.height = 'auto';
            logWindow.appendChild(img);
            logWindow.scrollTop = logWindow.scrollHeight; // 스크롤을 맨 아래로 이동
        }
        nextLine(); // 다음 줄로 이동
        return;
    }`,
    clear: () => `() => {clearLogWindow(); nextLine(); return;}`,
};

// 텍스트 파일 파싱 함수
function parseDialogueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const dialogueName = path.basename(filePath, '.txt'); // 파일명에서 확장자 제거
    const dialogueArray = [];
    let currentObject = null;

    let skipToIndex = -1; // 특정 블록 처리 후 건너뛸 인덱스

    lines.forEach((line, index) => {
        if (index <= skipToIndex) {
            return; // 이미 처리된 블록은 건너뜀
        }

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
            // steps 종료 및 allowedCommands, destination, 또는 customCommands 설정
            const type = line[1]; // 'a', 'd', 'f', 또는 'c'
            if (type === 'a') {
                const value = lines[index + 1]; // 다음 줄 값
                currentObject.allowedCommands = value.split(' ').map(Number);
                skipToIndex = index + 1; // 다음 줄까지 처리했으므로 건너뜀
            } else if (type === 'd') {
                const value = lines[index + 1]; // 다음 줄 값
                const [dialogue, label] = value.split(' ');
                currentObject.destination = { dialogue, label };
                skipToIndex = index + 1; // 다음 줄까지 처리했으므로 건너뜀
            } else if (type === 'f') {
                // 함수형 destination 처리
                const functionLines = [];
                let i = index + 1;
                while (i < lines.length && !lines[i].startsWith('-') && !lines[i].startsWith('*')) {
                    functionLines.push(lines[i]);
                    i++;
                }
                currentObject.destination = parseFunctionDestination(functionLines);
                skipToIndex = i - 1; // -f 블록을 처리한 이후로 인덱스 이동
            } else if (type === 'c') {
                // customCommands 처리
                const customCommands = [];
                let i = index + 1;
                let commandBuffer = [];
                let openBraces = 0;

                while (i < lines.length && !lines[i].startsWith('-') && !lines[i].startsWith('*')) {
                    const line = lines[i];
                    commandBuffer.push(line);

                    // 중괄호 개수 추적
                    openBraces += (line.match(/{/g) || []).length;
                    openBraces -= (line.match(/}/g) || []).length;

                    // 중괄호가 닫히면 하나의 customCommand 완성
                    if (openBraces === 0 && commandBuffer.length > 0) {
                        const commandText = commandBuffer.join(' ').trim();

                        // 정규식을 사용하여 text와 destination 분리
                        const match = commandText.match(/^"(.+?)",\s*destination:\s*(.+)$/);
                        if (!match) {
                            console.error(`customCommand 파싱 중 오류 발생: ${commandText}`);
                            commandBuffer = []; // 버퍼 초기화
                            continue;
                        }

                        const text = match[1]; // 첫 번째 그룹: text
                        const destinationString = match[2]; // 두 번째 그룹: destination
                        const destination = parseDestination(destinationString); // destination을 파싱

                        customCommands.push({ text, destination });
                        commandBuffer = []; // 버퍼 초기화
                    }

                    i++;
                }

                currentObject.customCommands = customCommands;
                skipToIndex = i - 1; // -c 블록을 처리한 이후로 인덱스 이동
            }
        } else {
            // steps 처리
            if (line.startsWith('-') || line.startsWith('*')) {
                return; // -a, -d, -f, -c 또는 새로운 label은 steps에 추가하지 않음
            }

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

            currentObject.steps.push(step);
        }
    });

    if (currentObject) {
        dialogueArray.push(currentObject); // 마지막 객체 저장
    }

    return `window.${dialogueName} = ${formatAsJavaScriptObject(dialogueArray)};`;
}

// destination을 파싱하는 함수
function parseDestination(destinationString) {
    try {
        // 문자열 유효성 검사: 중괄호와 괄호가 올바르게 닫혔는지 확인
        const openBraces = (destinationString.match(/{/g) || []).length;
        const closeBraces = (destinationString.match(/}/g) || []).length;
        const openParens = (destinationString.match(/\(/g) || []).length;
        const closeParens = (destinationString.match(/\)/g) || []).length;

        if (openBraces !== closeBraces || openParens !== closeParens) {
            throw new SyntaxError(`destination 문자열이 올바르게 닫히지 않았습니다: ${destinationString}`);
        }

        // 함수인지 객체인지 확인
        if (destinationString.trim().startsWith('() =>')) {
            // 함수 표현식 처리
            return new Function(`return (${destinationString.trim()})`)();
        } else {
            // 객체 표현식 처리
            return new Function(`return (${destinationString.trim()})`)();
        }
    } catch (error) {
        console.error(`destination 파싱 중 오류 발생: ${destinationString}`, error);
        return null;
    }
}

// 함수형 destination을 처리하는 함수
function parseFunctionDestination(lines) {
    const functionBody = lines.join('\n'); // 함수 본문 생성
    return new Function(functionBody); // 동적으로 함수 생성
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
    // dialogues 폴더 내의 모든 .txt 파일을 가져옴
    const files = fs.readdirSync(inputFolder)
        .filter(file => file.endsWith('.txt') && file !== 'guide.txt'); // guide.txt 제외

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