// frontend/src/App.jsx
import React, { useState } from 'react';
import ChatDisplay from './components/ChatDisplay.jsx';
import ChatInput from './components/ChatInput.jsx';
import './styles/App.css';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am a simple chatbot. How can I assist you?', sender: 'bot' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- IMPORTANT CHANGE HERE ---
  // This will read from Vercel's environment variables (VITE_CHAT_API_URL) when deployed,
  // and fall back to localhost for local development.
  const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3001/chat';

  const handleSendMessage = async (text) => {
    if (text.trim() === '') return;

    setError(null);

    const newUserMessage = { id: Date.now(), text, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const typingIndicatorId = Date.now() + 1;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: typingIndicatorId, sender: 'bot', isTyping: true },
    ]);
    setIsLoading(true);

    try {
      const conversationHistory = [
        ...messages.filter(msg => !msg.isTyping).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: text }
      ];

      const response = await axios.post(CHAT_API_URL, {
        messages: conversationHistory
      });

      const botResponseText = response.data.reply || 'No response from bot.';

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
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== typingIndicatorId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <ChatDisplay messages={messages} />
      {error && <div className="error-message">{error}</div>}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;