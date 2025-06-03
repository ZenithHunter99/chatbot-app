import React, { useState } from 'react';

function ChatInput({ onSendMessage, isLoading }) {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    if (inputValue.trim() && !isLoading) { // Only send if not loading
      onSendMessage(inputValue.trim());
      setInputValue(''); // Clear input after sending
    }
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}> {/* Matches the CSS class */}
      <input
        type="text"
        placeholder={isLoading ? "Bot is typing..." : "Type your message..."}
        value={inputValue}
        onChange={handleChange}
        disabled={isLoading} // Disable input while loading
      />
      <button type="submit" disabled={isLoading}> 
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

export default ChatInput;