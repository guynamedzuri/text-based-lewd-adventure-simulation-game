// Select elements
const logWindow = document.getElementById('logWindow');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');

// Function to add a log
function addLog(message) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logWindow.appendChild(logEntry);

    // Scroll to the bottom to show the latest log
    logWindow.scrollTop = logWindow.scrollHeight;
}

// Event listener for the submit button
submitButton.addEventListener('click', () => {
    const inputText = userInput.value.trim();
    if (inputText) {
        addLog(inputText); // Add the input text to the log
        userInput.value = ''; // Clear the input field
    }
});