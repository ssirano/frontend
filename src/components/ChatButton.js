import React from 'react';

const ChatButton = ({ onClick, unreadCount }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 rounded-full w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
    >
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
          {unreadCount}
        </span>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
};

export default ChatButton;
