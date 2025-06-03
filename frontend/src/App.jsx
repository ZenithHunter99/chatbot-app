import React, { useState } from 'react';
import ChatDisplay from './components/ChatDisplay.jsx';
import ChatInput from './components/ChatInput.jsx';
import './styles/App.css'; // Import App-specific styles
import axios from 'axios'; // Import axios

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am a simple chatbot. How can I assist you?', sender: 'bot' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State for error messages

  // IMPORTANT: Replace with your actual backend API URL
  // If running locally, and your backend is on port 3001:
  const CHAT_API_URL = 'http://localhost:3001/chat'; 
  // If deployed, use your domain, e.g., 'https://your-backend-api.com/chat'

  const handleSendMessage = async (text) => {
    if (text.trim() === '') return;

    setError(null); // Clear any previous errors

    // 1. Add user message immediately
    const newUserMessage = { id: Date.now(), text, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    // 2. Add a "typing" indicator for the bot
    const typingIndicatorId = Date.now() + 1;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: typingIndicatorId, sender: 'bot', isTyping: true }, // No text needed, dots will render
    ]);
    setIsLoading(true);

    try {
      // Prepare messages for the backend, including the new user message
      // Groq expects roles 'user' or 'assistant' and 'content'
      const conversationHistory = [
        ...messages.filter(msg => !msg.isTyping).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: text } // Add the current user message
      ];

      const response = await axios.post(CHAT_API_URL, { 
        messages: conversationHistory // Send the entire conversation history
      });

      const botResponseText = response.data.reply || 'No response from bot.'; // Assuming 'reply' key from backend

      // 3. Remove typing indicator and add actual bot response
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter((msg) => msg.id !== typingIndicatorId);
        return [...updatedMessages, { id: Date.now() + 2, text: botResponseText, sender: 'bot' }];
      });

    } catch (err) {
      console.error("Failed to fetch bot response:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data.message || `Server error: ${err.response.status}`);
        } else if (err.request) {
          setError("No response from server. Please check your backend connection.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError(`An unexpected error occurred: ${err.message}`);
      }
      // If error, remove typing indicator
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== typingIndicatorId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container"> {/* Matches the CSS class */}
      <ChatDisplay messages={messages} />
      {error && <div className="error-message">{error}</div>} {/* Add styling for error */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;