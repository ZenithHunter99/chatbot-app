document.addEventListener('DOMContentLoaded', () => {
    const chatDisplay = document.getElementById('chatDisplay');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    const BACKEND_URL = 'http://localhost:5000';

    function appendMessage(sender, message, isTypingIndicator = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        if (isTypingIndicator) {
            messageDiv.classList.add('loading-message');
            messageDiv.innerHTML = '<span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span>';
        } else {
            messageDiv.textContent = message;
        }

        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll to bottom
        return messageDiv; // Return the created div for potential removal later
    }

    async function sendMessageHandler() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        userInput.value = ''; // Clear input immediately
        sendButton.disabled = true; // Disable button while sending

        const typingIndicator = appendMessage('bot', '', true); // Add typing indicator

        try {
            const response = await fetch(`${BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            // Remove typing indicator as soon as response is received
            chatDisplay.removeChild(typingIndicator);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch AI response');
            }

            const data = await response.json();
            appendMessage('bot', data.reply);

        } catch (error) {
            console.error('Error sending message:', error);
            // Ensure typing indicator is removed on error too
            if (typingIndicator && chatDisplay.contains(typingIndicator)) {
                chatDisplay.removeChild(typingIndicator);
            }
            appendMessage('bot', `Error: ${error.message || 'Could not connect to AI. Please try again.'}`);
        } finally {
            sendButton.disabled = false; // Re-enable button
        }
    }

    // Simple typing indicator animation
    function animateTypingDots() {
        const style = document.createElement('style');
        style.textContent = `
            .typing-dot {
                animation: blink 1s infinite;
                opacity: 0;
            }
            .typing-dot:nth-child(1) { animation-delay: 0s; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes blink {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    animateTypingDots(); // Call to add the animation styles

    sendButton.addEventListener('click', sendMessageHandler);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessageHandler();
        }
    });
});