"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Send,
  Smile,
  Search,
  MessageCircle,
  Circle,
  MoreVertical,
} from "lucide-react";
import { ChatUser, ChatMessage } from "@/types";

// Dummy data for teacher chat functionality
const dummyUsers: ChatUser[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    role: "student",
    isOnline: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    role: "teacher",
    isOnline: false,
    lastSeen: "2 hours ago",
  },
  {
    id: "3",
    name: "Charlie Brown",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    role: "student",
    isOnline: true,
  },
  {
    id: "4",
    name: "Diana Prince",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    role: "teacher",
    isOnline: true,
  },
  {
    id: "5",
    name: "Eve Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    role: "student",
    isOnline: false,
    lastSeen: "1 day ago",
  },
  {
    id: "6",
    name: "Frank Miller",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
    role: "student",
    isOnline: true,
  },
  {
    id: "7",
    name: "Grace Lee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
    role: "student",
    isOnline: false,
    lastSeen: "30 minutes ago",
  },
];

const dummyMessages: Record<string, ChatMessage[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      receiverId: "current-user",
      content: "Hi Professor! I'm having trouble with the React hooks assignment.",
      timestamp: "2024-01-15T10:30:00Z",
      isRead: true,
      type: "text",
    },
    {
      id: "2",
      senderId: "current-user",
      receiverId: "1",
      content: "Hello Alice! I'd be happy to help. Can you tell me specifically which hook is giving you trouble?",
      timestamp: "2024-01-15T10:32:00Z",
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      senderId: "1",
      receiverId: "current-user",
      content: "It's the useEffect hook. I'm not sure when to use the dependency array.",
      timestamp: "2024-01-15T10:35:00Z",
      isRead: true,
      type: "text",
    },
    {
      id: "4",
      senderId: "current-user",
      receiverId: "1",
      content: "Great question! The dependency array tells React when to re-run the effect. If you leave it empty [], it runs only once after the initial render. If you include dependencies, it re-runs when those values change.",
      timestamp: "2024-01-15T10:37:00Z",
      isRead: true,
      type: "text",
    },
  ],
  "2": [
    {
      id: "5",
      senderId: "2",
      receiverId: "current-user",
      content: "Hey colleague! How's your Algorithms class going?",
      timestamp: "2024-01-14T15:20:00Z",
      isRead: false,
      type: "text",
    },
    {
      id: "6",
      senderId: "current-user",
      receiverId: "2",
      content: "Going well! The students are really engaged with the dynamic programming problems.",
      timestamp: "2024-01-14T15:25:00Z",
      isRead: true,
      type: "text",
    },
    {
      id: "7",
      senderId: "2",
      receiverId: "current-user",
      content: "That's great to hear! Have you tried the new visualization tool I mentioned?",
      timestamp: "2024-01-14T15:27:00Z",
      isRead: false,
      type: "text",
    },
  ],
  "3": [
    {
      id: "8",
      senderId: "3",
      receiverId: "current-user",
      content: "Professor, can we schedule a meeting to discuss my project proposal?",
      timestamp: "2024-01-13T09:15:00Z",
      isRead: true,
      type: "text",
    },
    {
      id: "9",
      senderId: "current-user",
      receiverId: "3",
      content: "Of course! I'm available tomorrow afternoon. Does 2 PM work for you?",
      timestamp: "2024-01-13T09:20:00Z",
      isRead: true,
      type: "text",
    },
  ],
  "4": [
    {
      id: "10",
      senderId: "4",
      receiverId: "current-user",
      content: "Hi! I'm organizing a faculty development workshop next month. Would you be interested in presenting?",
      timestamp: "2024-01-12T14:00:00Z",
      isRead: true,
      type: "text",
    },
  ],
  "6": [
    {
      id: "11",
      senderId: "6",
      receiverId: "current-user",
      content: "Professor, I submitted my assignment but haven't received feedback yet. Is everything okay?",
      timestamp: "2024-01-11T16:45:00Z",
      isRead: false,
      type: "text",
    },
  ],
};

const emojis = [
  "😀", "😂", "😊", "😍", "🥰", "😘", "😉", "😎", "🤔", "😮",
  "😢", "😭", "😤", "😅", "🙃", "🤗", "🤭", "🤫", "🤥", "😴",
  "👍", "👎", "👌", "✌️", "🤞", "👏", "🙌", "🤝", "🙏", "✍️",
  "❤️", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
  "🚀", "💯", "🔥", "⭐", "✨", "💫", "🎉", "🎊", "🎈", "🎁",
];

export function Messages() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser) {
      const userMessages = dummyMessages[selectedUser.id] || [];
      setMessages(userMessages);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      receiverId: selectedUser.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: "text",
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate receiving a response after 2-4 seconds
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedUser.id,
        receiverId: "current-user",
        content: getRandomResponse(selectedUser.role),
        timestamp: new Date().toISOString(),
        isRead: false,
        type: "text",
      };
      setMessages(prev => [...prev, response]);
    }, 2000 + Math.random() * 2000);
  };

  const getRandomResponse = (userRole: "student" | "teacher") => {
    const studentResponses = [
      "Thank you for your help, Professor! That makes much more sense now.",
      "I appreciate you taking the time to explain this. I'll work on it right away.",
      "Got it! I'll revise my approach based on your feedback.",
      "Thanks for the clarification. When is the next class?",
      "I understand now. Can I schedule some office hours with you?",
      "That helps a lot! I'm excited to apply this to my project.",
      "Thank you! I'll let you know if I have any more questions.",
    ];

    const teacherResponses = [
      "Absolutely, I'd love to participate in the workshop!",
      "That sounds like a great initiative. Count me in.",
      "Thanks for thinking of me. What's the proposed schedule?",
      "I'm interested! Can you send me more details about the topic?",
      "Great idea! I'd be happy to contribute to the faculty development.",
      "Perfect timing. I've been wanting to collaborate more with colleagues.",
      "Excellent! Let's discuss the logistics in our next department meeting.",
    ];

    const responses = userRole === "student" ? studentResponses : teacherResponses;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = dummyUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-slate-950">
      {/* Users Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search students & colleagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 cursor-pointer border-b border-slate-700 hover:bg-slate-800 transition-colors ${
                selectedUser?.id === user.id ? 'bg-slate-800 border-l-4 border-blue-500' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    user.isOnline ? 'bg-green-500' : 'bg-slate-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Circle className={`w-2 h-2 ${user.isOnline ? 'fill-green-500 text-green-500' : 'fill-slate-500 text-slate-500'}`} />
                    <span>{user.isOnline ? 'Online' : user.lastSeen || 'Offline'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      selectedUser.isOnline ? 'bg-green-500' : 'bg-slate-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-400">
                      {selectedUser.isOnline ? 'Online' : selectedUser.lastSeen || 'Offline'} • {selectedUser.role === 'student' ? 'Student' : 'Colleague'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'current-user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 'current-user' ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-900">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Message ${selectedUser.role === 'student' ? 'student' : 'colleague'}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-12 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-16 right-4 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg"
                  >
                    <div className="grid grid-cols-10 gap-2 max-w-xs">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-lg hover:bg-slate-700 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Select a conversation</h3>
              <p className="text-slate-500">Choose a student or colleague from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}