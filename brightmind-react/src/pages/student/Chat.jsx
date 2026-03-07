import React, { useState } from 'react';
import ChatList from '../../components/student/chat/ChatList';
import ChatWindow from '../../components/student/chat/ChatWindow';
import { chats, messages } from '../../data/chatsMock';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(chats[0]);
    const [activeMessages, setActiveMessages] = useState(messages);

    const handleSendMessage = (text) => {
        const newMessage = {
            id: Date.now(),
            senderId: "Me",
            text: text,
            time: "Just now",
            isMe: true
        };
        setActiveMessages([...activeMessages, newMessage]);
    };

    return (
        <div className="flex bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-140px)]">
            {/* Sidebar List - Hidden on mobile if chat selected */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
                <ChatList
                    chats={chats}
                    selectedChat={selectedChat}
                    onSelectChat={setSelectedChat}
                />
            </div>

            {/* Chat Window - Full screen on mobile if selected */}
            <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
                {selectedChat ? (
                    <div className="flex-1 flex flex-col h-full relative">
                        {/* Mobile Back Button */}
                        <div className="md:hidden absolute top-4 left-4 z-10">
                            <button
                                onClick={() => setSelectedChat(null)}
                                className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm border border-gray-100 text-gray-600"
                            >
                                ← Back
                            </button>
                        </div>
                        <ChatWindow
                            chat={selectedChat}
                            messages={activeMessages}
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-[#f8f9fc] text-gray-400">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
