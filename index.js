document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendMessageButton = document.getElementById('send-message');

    // Append a message to the chat window
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${sender}: ${message}`;
        messageDiv.classList.add(sender === 'User' ? 'user-message' : 'ai-message');
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
    }

    // Listen for SillyTavern's internal events
    document.addEventListener('st-new-message', (event) => {
        const { sender, message } = event.detail;
        appendMessage(sender, message);
    });

    // Send message through SillyTavern
    sendMessageButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (!message) return;

        // Append the user's message to the UI
        appendMessage('User', message);

        // Trigger SillyTavern's internal event to send the message
        const sendEvent = new CustomEvent('st-send-message', {
            detail: { message }
        });
        document.dispatchEvent(sendEvent);

        userInput.value = '';
    });
});
