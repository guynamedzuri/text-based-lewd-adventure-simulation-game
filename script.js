// Select elements
const logWindow = document.getElementById('logWindow');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');

// 캐릭터 및 배경 이미지 요소
const characterImage = document.getElementById('characterImage');
const backgroundImage = document.getElementById('backgroundImage');

// 이미지 업데이트 함수
function updateImage(imageElement, newSrc) {
    // 페이드아웃
    imageElement.style.opacity = 0;

    // 이미지 소스 업데이트 및 페이드인
    setTimeout(() => {
        imageElement.src = newSrc; // 새로운 이미지 소스 설정
        imageElement.onload = () => {
            imageElement.style.opacity = 1; // 페이드인
        };
    }, 500); // CSS transition 시간(0.5초)과 동일하게 설정
}

// 테스트: 캐릭터와 배경 이미지 업데이트
function testImageUpdate() {
    updateImage(characterImage, 'chara/wolf_normal.png'); // 캐릭터 이미지 업데이트
    updateImage(backgroundImage, 'map/1.png'); // 배경 이미지 업데이트
}

let currentParagraphIndex = 0; // 현재 단락 인덱스
let currentLineIndex = 0; // 현재 줄 인덱스
let isTyping = false; // 타이핑 애니메이션 진행 여부
let isWaitingForEnter = false; // 엔터 입력 대기 상태
let currentDialogue = tutorial;

const commandMap = {
    1: { text: "말을 건다", destination: { dialogue: "tutorial", label: "talkToVillager" } },
    2: { text: "이동한다", destination: { dialogue: "tutorial", label: "firstLine" } },
    999: { text: "그만둔다", action: () => console.log("게임 종료") }
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

// 로그창을 지우는 함수
function clearLogWindow() {
    logWindow.innerHTML = ""; // 로그창 내용 초기화
}

// 줄 출력: 한 줄씩 출력하며, 타이핑 애니메이션을 적용
function displayLine() {
    console.log("displayLine 호출됨");
    console.log("currentDialogue:", currentDialogue);
    console.log("currentParagraphIndex:", currentParagraphIndex);

    if (!currentDialogue || currentParagraphIndex >= currentDialogue.length) {
        addLog("대화 데이터를 불러오지 못했습니다. 대화 파일을 확인하세요.");
        return;
    }

    const paragraph = currentDialogue[currentParagraphIndex];
    if (!paragraph || currentLineIndex >= paragraph.steps.length) {
        prepareForNextCommand(); // 단락 종료 후 명령 대기
        return;
    }

    const step = paragraph.steps[currentLineIndex];
    console.log("출력할 줄:", step.text);

    // 액션 실행
    if (step.action) {
        step.action();
    }

    // 텍스트 출력
    addLogWithTyping(step.text, () => {
        isWaitingForEnter = true; // 줄 출력 후 엔터 대기
        addBlinkingArrow(); // 역삼각형 애니메이션 추가
    });
}

// 역삼각형 애니메이션 추가
function addBlinkingArrow() {
    const logEntries = logWindow.querySelectorAll('div');
    const lastLogEntry = logEntries[logEntries.length - 1]; // 가장 최근 로그
    if (lastLogEntry) {
        const arrow = document.createElement('span');
        arrow.classList.add('blinking-arrow');
        arrow.textContent = '▼'; // 역삼각형 모양
        lastLogEntry.appendChild(arrow);
    }
}

// 역삼각형 애니메이션 제거
function removeBlinkingArrow() {
    const arrows = logWindow.querySelectorAll('.blinking-arrow');
    arrows.forEach(arrow => arrow.remove());
}

// 다음 줄로 이동
function nextLine() {
    if (isWaitingForEnter) {
        isWaitingForEnter = false;
        removeBlinkingArrow(); // 애니메이션 제거
        currentLineIndex++;
        displayLine();
    }
}

// 명령 대기 상태 준비
function prepareForNextCommand() {
    const paragraph = currentDialogue[currentParagraphIndex];

    if (currentLineIndex >= paragraph.steps.length) {
        currentLineIndex = 0; // 줄 인덱스 초기화

        // `destination`이 있으면 다음 대화로 이동
        if (paragraph.destination) {
            nextDialogue(paragraph.destination);
            return;
        }

        // `allowedCommands`가 비어 있으면 오류 처리
        if (!paragraph.allowedCommands || paragraph.allowedCommands.length === 0) {
            console.error("허용된 명령어 또는 destination이 없습니다.");
            return;
        }

        // 허용된 명령어 출력
        displayAllowedCommands(paragraph.allowedCommands);
        enableInput(); // 입력창 활성화
    }
}

// 허용된 명령어 출력
function displayAllowedCommands(commands) {
    const commandDescriptions = commands.map(cmd => `${cmd}. ${commandMap[cmd].text}`).join(" ");
    addLog(`${commandDescriptions}`);
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

// Function to add a log
function addLog(message) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logWindow.appendChild(logEntry);
    logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom
}

// Function to add a log with typing effect
function addLogWithTyping(message, callback) {
    if (!message) {
        console.error("addLogWithTyping: message가 비어 있습니다.");
        return;
    }

    if (isTyping) {
        console.warn("addLogWithTyping: 현재 타이핑 중입니다. 중복 호출 방지.");
        return;
    }

    console.log("addLogWithTyping 호출됨:", message);

    isTyping = true;
    submitButton.disabled = true; // Disable the submit button during typing

    let logEntry = document.createElement('div');
    logEntry.textContent = ''; // Start with an empty log entry
    logWindow.appendChild(logEntry);

    let index = 0;

    function typeNextChar() {
        // 타이핑 중 `isTyping`이 false로 변경되었는지 확인
        if (!isTyping) {
            console.log("타이핑 중단 감지: 남은 문장을 한 번에 출력합니다.");
            logEntry.textContent += message.slice(index); // 남은 문장 출력
            console.log("타이핑 완료:", logEntry.textContent);

            // 타이핑 완료 처리
            isTyping = false;
            submitButton.disabled = false; // Re-enable the submit button
            logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom

            if (callback) {
                callback();
            }
            return;
        }

        // 타이핑 애니메이션 진행
        if (index < message.length) {
            logEntry.textContent += message[index];
            console.log(`타이핑 중: ${logEntry.textContent}`);
            index++;
            setTimeout(typeNextChar, 50); // Adjust typing speed here (50ms per character)
        } else {
            console.log("타이핑 완료:", logEntry.textContent);
            isTyping = false; // 타이핑 완료
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
        console.log("skipTyping: 타이핑 스킵.");
        isTyping = false;
        submitButton.disabled = false;

        const logEntry = document.createElement('div');
        logWindow.appendChild(logEntry);
        logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom
    }
}

// 다음 대화로 이동
function nextDialogue(destination) {
    const { dialogue, label } = destination;

    // 대화 데이터 로드
    const newDialogue = dialogue; // 전달된 dialogue 값을 직접 사용
    if (!newDialogue) {
        console.error(`대화 데이터 ${dialogue}를 찾을 수 없습니다.`);
        return;
    }

    // 라벨로 인덱스 찾기
    const newParagraphIndex = newDialogue.findIndex(paragraph => paragraph.label === label);
    if (newParagraphIndex === -1) {
        console.error(`라벨 ${label}에 해당하는 단락을 찾을 수 없습니다.`);
        return;
    }

    // 대화 상태 업데이트
    currentDialogue = newDialogue;
    currentParagraphIndex = newParagraphIndex;
    currentLineIndex = 0;

    // 새로운 대화 시작
    displayLine();
}

// 초기화 및 첫 단락 출력
window.addEventListener("DOMContentLoaded", () => {
    console.log("대화 스크립트 로드 시작");

    disableInput(); // 처음에는 입력창 비활성화

    console.log("초기화 시작");
    console.log("currentDialogue:", currentDialogue);

    isTyping = false; // 초기화 시 타이핑 상태 초기화

    if (!currentDialogue || currentDialogue.length === 0) {
        addLog("대화 데이터를 불러오지 못했습니다. 대화 파일을 확인하세요.");
        console.error("currentDialogue가 비어 있습니다. 파일을 확인하세요.");
        return;
    }

    displayLine(); // 첫 줄 출력

    testImageUpdate(); // 캐릭터와 배경 이미지 업데이트
});

// 엔터 키 이벤트 처리
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (document.activeElement === userInput) {
            // 입력창에 포커스가 있을 경우 submit 버튼 클릭 이벤트 트리거
            submitButton.click();
        } else if (isTyping) {
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

    const paragraph = currentDialogue[currentParagraphIndex];
    if (!paragraph) {
        addLog("현재 단락 데이터를 찾을 수 없습니다. 대화 파일을 확인하세요.");
        return;
    }

    const commandData = commandMap[command];
    if (!commandData) {
        addLog("잘못된 명령어입니다. 다시 입력하세요.");
        return;
    }

    // 명령어에 `action`이 있으면 실행
    if (commandData.action) {
        commandData.action();
    }

    // 명령어에 `destination`이 있으면 이동
    if (commandData.destination) {
        disableInput();
        nextDialogue(commandData.destination);
    }

    userInput.value = ""; // 입력 필드 초기화
});