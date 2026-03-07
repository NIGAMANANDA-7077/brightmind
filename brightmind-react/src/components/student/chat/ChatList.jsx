import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ChatList = ({ chats, selectedChat, onSelectChat }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-80 lg:w-96 shrink-0">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto hidden-scrollbar">
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-purple-50 hover:bg-purple-50' : ''}`}
                    >
                        <div className="relative shrink-0">
                            <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`font-bold truncate ${selectedChat?.id === chat.id ? 'text-[#8b5cf6]' : 'text-gray-900'}`}>{chat.name}</h3>
                                <span className="text-xs text-gray-400 shrink-0">{chat.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                                {chat.unread > 0 && (
                                    <span className="w-5 h-5 flex items-center justify-center bg-[#8b5cf6] text-white text-[10px] font-bold rounded-full ml-2 shrink-0">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;
