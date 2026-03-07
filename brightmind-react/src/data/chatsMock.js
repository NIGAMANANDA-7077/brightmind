
export const chats = [
    {
        id: 1,
        name: "Dr. Emily Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        lastMessage: "Don't forget to submit your assignment by Friday!",
        time: "10:30 AM",
        unread: 2,
        online: true,
        type: "mentor"
    },
    {
        id: 2,
        name: "React Study Group",
        avatar: "https://ui-avatars.com/api/?name=RS&background=8b5cf6&color=fff",
        lastMessage: "Does anyone understand the useEffect dependency array?",
        time: "9:15 AM",
        unread: 5,
        online: false,
        type: "group"
    },
    {
        id: 3,
        name: "Mike Johnson",
        avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80",
        lastMessage: "Great job on the UI project!",
        time: "Yesterday",
        unread: 0,
        online: false,
        type: "mentor"
    },
    {
        id: 4,
        name: "Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=150&q=80",
        lastMessage: "Let's review your code in the next session.",
        time: "Yesterday",
        unread: 0,
        online: true,
        type: "mentor"
    }
];

export const messages = [
    {
        id: 101,
        senderId: "Dr. Emily Chen",
        text: "Hi Alex, how is the Advanced React course going?",
        time: "10:00 AM",
        isMe: false
    },
    {
        id: 102,
        senderId: "Me",
        text: "It's going well! I'm struggling a bit with custom hooks though.",
        time: "10:05 AM",
        isMe: true
    },
    {
        id: 103,
        senderId: "Dr. Emily Chen",
        text: "That's common. I can share some additional resources.",
        time: "10:06 AM",
        isMe: false
    },
    {
        id: 104,
        senderId: "Dr. Emily Chen",
        text: "Don't forget to submit your assignment by Friday!",
        time: "10:30 AM",
        isMe: false
    }
];
