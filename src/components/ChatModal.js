// ChatModal.js

import React, { useState, useEffect, useRef } from 'react';

const ChatModal = ({ isOpen, onClose, token, participants, ws, messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal">
      <div className="chat-header">
        <h3>Chat</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="chat-participants">
        <h4>Participants:</h4>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant.username}</li>
          ))}
        </ul>
      </div>
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.userId === 'self' ? 'self' : 'other'}`}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatModal;
