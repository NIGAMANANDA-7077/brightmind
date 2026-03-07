import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ chat, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage('');
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8f9fc]">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h2 className="font-bold text-gray-900">{chat.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-[#8b5cf6]"><Phone size={20} /></button>
                    <button className="hover:text-[#8b5cf6]"><Video size={20} /></button>
                    <button className="hover:text-gray-600"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={endOfMessagesRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 focus-within:border-[#8b5cf6] transition-colors">
                    <button type="button" className="text-gray-400 hover:text-gray-600">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                    />
                    <button type="button" className="text-gray-400 hover:text-gray-600">
                        <Smile size={20} />
                    </button>
                    <button
                        type="submit"
                        className={`p-2 rounded-full transition-all ${newMessage.trim() ? 'bg-[#8b5cf6] text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
                        disabled={!newMessage.trim()}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
