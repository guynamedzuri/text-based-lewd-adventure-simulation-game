// Select elements
const logWindow = document.getElementById('logWindow');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');

let isTyping = false; // Flag to track if typing animation is in progress
let typingQueue = []; // Queue to store messages during typing

const commandMap = {
    1: "말을 건다.",
    2: "이동한다.",
    999: "그만둔다."
};

// 허용된 명령어를 확인하는 함수
function isCommandAllowed(command, allowedCommands) {
    return allowedCommands.includes(command);
}

// Function to add a log with typing effect
function addLogWithTyping(message) {
    if (isTyping) {
        // If typing is in progress, queue the message
        typingQueue.push(message);
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

            // Process the next message in the queue, if any
            if (typingQueue.length > 0) {
                addLogWithTyping(typingQueue.shift());
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

        // Immediately display the current message and all queued messages
        const allMessages = typingQueue.join('\n');
        typingQueue = []; // Clear the queue

        const logEntry = document.createElement('div');
        logEntry.textContent = allMessages;
        logWindow.appendChild(logEntry);
        logWindow.scrollTop = logWindow.scrollHeight; // Scroll to the bottom
    }
}

// Add initial log message on page load
window.addEventListener('DOMContentLoaded', () => {
    addLogWithTyping("Welcome to the Text Adventure Game!");
    addLogWithTyping("Type your commands below to begin your journey.");
});

// Event listener for the submit button
submitButton.addEventListener('click', () => {
    const inputText = userInput.value.trim();
    if (inputText) {
        addLogWithTyping(inputText); // Add the input text to the log with typing effect
        userInput.value = ''; // Clear the input field
    }
});

// Event listener for the Enter key to skip typing
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        skipTyping();
    }
});