import React from 'react';

const MessageBubble = ({ message }) => {
    return (
        <div className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${message.isMe
                    ? 'bg-[#8b5cf6] text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className={`text-[10px] mt-1 text-right ${message.isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                    {message.time}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
