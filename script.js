// Select elements
const logWindow = document.getElementById('logWindow');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');

let currentParagraphIndex = 0; // 현재 단락 인덱스
let currentLineIndex = 0; // 현재 줄 인덱스
let isTyping = false; // 타이핑 애니메이션 진행 여부
let isWaitingForEnter = false; // 엔터 입력 대기 상태
let currentDialogue = dialogueTown; // 현재 대사집

const commandMap = {
    1: "말을 건다.",
    2: "이동한다.",
    999: "그만둔다."
};

// 허용된 명령어를 확인하는 함수
function isCommandAllowed(command, allowedCommands) {
    return allowedCommands.includes(command);
}

// 단락 스킵: 현재 단락의 모든 줄을 즉시 출력
function skipParagraph() {
    if (isTyping || isWaitingForEnter) {
        isTyping = false;
        isWaitingForEnter = false;

        const paragraph = currentDialogue[currentParagraphIndex];
        paragraph.lines.slice(currentLineIndex).forEach(line => addLog(line));
        currentLineIndex = paragraph.lines.length; // 모든 줄 출력 완료
        prepareForNextCommand(); // 명령 대기 상태로 전환
    }
}

// 줄 출력: 한 줄씩 출력하며, 타이핑 애니메이션을 적용
function displayLine() {
    const paragraph = currentDialogue[currentParagraphIndex];
    if (currentLineIndex >= paragraph.lines.length) {
        prepareForNextCommand(); // 단락 종료 후 명령 대기
        return;
    }

    const line = paragraph.lines[currentLineIndex];
    isTyping = true;
    addLogWithTyping(line, () => {
        isTyping = false;
        isWaitingForEnter = true; // 줄 출력 후 엔터 대기
    });
}

// 다음 줄로 이동
function nextLine() {
    if (isWaitingForEnter) {
        isWaitingForEnter = false;
        currentLineIndex++;
        displayLine();
    }
}

// 명령 대기 상태 준비
function prepareForNextCommand() {
    const paragraph = currentDialogue[currentParagraphIndex];
    if (currentLineIndex >= paragraph.lines.length) {
        currentLineIndex = 0; // 줄 인덱스 초기화
        currentParagraphIndex++; // 다음 단락으로 이동

        if (currentParagraphIndex >= currentDialogue.length) {
            addLog("더 이상 진행할 대사가 없습니다.");
            return;
        }

        const allowedCommands = paragraph.allowedCommands;
        displayAllowedCommands(allowedCommands); // 허용된 명령어 출력
        enableInput(); // 입력창 활성화
    }
}

// 허용된 명령어 출력
function displayAllowedCommands(commands) {
    const commandDescriptions = commands.map(cmd => `${cmd}: ${commandMap[cmd]}`).join(", ");
    addLog(`허용된 명령어: ${commandDescriptions}`);
}

// 입력창 활성화
function enableInput() {
    userInput.disabled = false;
    submitButton.disabled = false;
}

// 입력창 비활성화
function disableInput() {
    userInput.disabled = true;
    submitButton.disabled = true;
}

// Function to add a log with typing effect
function addLogWithTyping(message, callback) {
    if (isTyping) {
        return;
    }

    isTyping = true;
    submitButton.disabled = true; // Disable the submit button during typing

    let logEntry = document.createElement('div');
    logEntry.textContent = ''; // Start with an empty log entry
    logWindow.appendChild(logEntry);

    let index = 0;

    function typeNextChar() {
        if (index < message.length) {
            logEntry.textContent += message[index];
            index++;
            setTimeout(typeNextChar, 50); // Adjust typing speed here (50ms per character)
        } else {
            isTyping = false;
            submitButton.disabled = false; // Re-enable the submit button
            logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom

            if (callback) {
                callback();
            }
        }
    }

    typeNextChar();
}

// Function to skip typing and immediately display all queued messages
function skipTyping() {
    if (isTyping) {
        isTyping = false;
        submitButton.disabled = false;

        const logEntry = document.createElement('div');
        logEntry.textContent = "타이핑이 스킵되었습니다.";
        logWindow.appendChild(logEntry);
        logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom
    }
}

// 초기화 및 첫 단락 출력
window.addEventListener("DOMContentLoaded", () => {
    disableInput(); // 처음에는 입력창 비활성화
    displayLine(); // 첫 줄 출력
});

// 엔터 키 이벤트 처리
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (isTyping) {
            skipTyping(); // 현재 줄 타이핑 스킵
        } else if (isWaitingForEnter) {
            nextLine(); // 다음 줄 출력
        }
    }
});

// 명령어 입력 처리
submitButton.addEventListener("click", () => {
    const inputText = userInput.value.trim();
    const command = parseInt(inputText, 10);

    const paragraph = currentDialogue[currentParagraphIndex - 1]; // 이전 단락
    if (isCommandAllowed(command, paragraph.allowedCommands)) {
        disableInput(); // 입력창 비활성화
        displayLine(); // 다음 단락 시작
    } else {
        addLog("허용되지 않은 명령어입니다. 다시 입력하세요.");
    }

    userInput.value = ""; // 입력 필드 초기화
});