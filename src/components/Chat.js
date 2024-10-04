import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ token, username }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5003';
    console.log('WebSocket 연결 시도:', wsUrl);

    const socket = new WebSocket(`${wsUrl}?token=${token}&username=${username}`);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    }; // 세미콜론 추가

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [token, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: inputMessage, username }));
      setInputMessage('');
    }
  };
  console.log(username);
  console.log(token);


  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-grow overflow-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-grow mr-2 p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          전송
        </button>
      </form>
    </div>
  );
};

export default Chat;
