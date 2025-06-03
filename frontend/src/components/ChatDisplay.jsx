import React, { useRef, useEffect } from 'react';

function ChatDisplay({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-display"> {/* Matches the CSS class */}
      {messages.map((message) => (
        <div
          key={message.id}
          // Apply 'message' to all, then specific sender class, then 'loading-message' for typing
          className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isTyping ? 'loading-message' : ''}`}
        >
          {message.isTyping ? (
            <>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </>
          ) : (
            message.text
          )}
        </div>
      ))}
      <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
    </div>
  );
}

export default ChatDisplay;