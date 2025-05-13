// ============================ 1. 초기화 및 전역 변수 ==========================

// Select elements
const logWindow = document.getElementById('logWindow');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');

// 캐릭터 및 배경 이미지 요소
const characterImage = document.getElementById('characterImage');
const backgroundImage = document.getElementById('backgroundImage');

// 전역 상태 변수
let currentParagraphIndex = 0; // 현재 단락 인덱스
let currentLineIndex = 0; // 현재 줄 인덱스
let isTyping = false; // 타이핑 애니메이션 진행 여부
let isWaitingForEnter = false; // 엔터 입력 대기 상태
let currentDialogue = tutorial;
let currentMap = 1; // 현재 맵 ID

// 명령어 매핑
const commandMap = {
    1: { text: "말을 건다", destination: { dialogue: "tutorial", label: "talkToVillager" } },
    2: { text: "이동한다", destination: { dialogue: "tutorial", label: "firstLine" } },
    999: { text: "그만둔다", action: () => console.log("게임 종료") }
};

// ============================ 2. 초기화 및 이벤트 핸들러 ======================

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

// submit 버튼 클릭 처리
submitButton.addEventListener("click", () => {
    // 줄넘김을 기다리는 상태일 경우
    if (isWaitingForEnter) {
        nextLine(); // 다음 줄 출력
        return; // 이후 로직 실행 방지
    }

    const inputText = userInput.value.trim();

    // 입력 필드가 비어 있으면 아무 작업도 하지 않고 종료
    if (!inputText) {
        return;
    }

    const command = parseInt(inputText, 10);

    const paragraph = currentDialogue[currentParagraphIndex];
    if (!paragraph) {
        addLog("현재 단락 데이터를 찾을 수 없습니다. 대화 파일을 확인하세요.");
        return;
    }

    const commandData = commandMap[command];
    if (!commandData) {
        addLog("잘못된 명령어입니다. 다시 입력하세요.");
        userInput.value = ""; // 입력 필드 초기화
        return;
    }

    // 명령어에 `action`이 있으면 실행
    if (commandData.action) {
        commandData.action();
    }

    // 명령어에 `destination`이 있으면 이동
    if (commandData.destination) {
        disableInput();
        nextDialogue(destination); // `destination`이 함수인지 확인 및 실행은 nextDialogue에서 처리
    }

    userInput.value = ""; // 입력 필드 초기화
});

// ============================= 3. 대화 흐름 관련 함수 ==================================

// 현재 줄 출력
function displayLine() {
    const paragraph = currentDialogue[currentParagraphIndex];

    if (!paragraph || currentLineIndex >= paragraph.steps.length) {
        prepareForNextCommand(); // 단락 종료 후 명령 대기
        return;
    }

    const step = paragraph.steps[currentLineIndex];

    // 텍스트 출력
    addLogWithTyping(step.text, () => {
        isWaitingForEnter = true; // 줄 출력 후 엔터 대기
        addBlinkingArrow(); // 역삼각형 애니메이션 추가
    });

    // 액션 실행
    if (step.action) {
        step.action();
    }
}

// 다음 대화로 이동
function nextDialogue(destination) {
    // destination이 함수라면 실행하여 반환값 사용
    if (typeof destination === "function") {
        destination = destination();
    }

    const { dialogue, label } = destination;

    // 대화 데이터 로드
    const newDialogue = typeof dialogue === "string" ? window[dialogue] : dialogue; // 문자열인 경우 전역 객체에서 가져오기
    if (!Array.isArray(newDialogue)) {
        console.error(`대화 데이터 ${dialogue}를 찾을 수 없거나 올바르지 않습니다.`);
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

// === 4. 로그 출력 관련 함수 ===

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
        if (!isTyping) {
            logEntry.textContent += message.slice(index); // 남은 문장 출력
            isTyping = false;
            submitButton.disabled = false; // Re-enable the submit button
            logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom

            if (callback) {
                callback();
            }
            return;
        }

        if (index < message.length) {
            logEntry.textContent += message[index];
            index++;
            setTimeout(typeNextChar, 50); // Adjust typing speed here (50ms per character)
        } else {
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
        isTyping = false;
        submitButton.disabled = false;

        const logEntry = document.createElement('div');
        logWindow.appendChild(logEntry);
        logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom
    }
}

// === 5. 유틸리티 함수 ===

// 허용된 명령어 출력
function displayAllowedCommands(commands) {
    const commandDescriptions = commands.map(cmd => `${cmd}. ${commandMap[cmd].text}`).join(" ");
    addLog(`${commandDescriptions}`);
}

// 입력창 활성화
function enableInput() {
    userInput.disabled = false;
    submitButton.disabled = false;
    userInput.focus(); // 입력창에 포커스 설정
}

// 입력창 비활성화
function disableInput() {
    userInput.disabled = true;
    submitButton.disabled = true;
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

// 로그창을 지우는 함수
function clearLogWindow() {
    logWindow.innerHTML = ""; // 로그창 내용 초기화
}

// 이미지 업데이트 함수
function updateImage(imageElement, newSrc) {
    imageElement.style.opacity = 0;

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