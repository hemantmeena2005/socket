// components/Chat.tsx
"use client";
import { useState, useEffect, KeyboardEvent } from 'react';
import io from 'socket.io-client';
import { databases } from '../lib/appwrite';
import { useAuth, useUser } from '@clerk/nextjs';

interface Message {
  text: string;
  user: string;
  userId: string;
  timestamp: string;
}

const socket = io({ path: '/socket.io' });

const Chat = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Fetch messages from Appwrite database
    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments('66923778003056cb26dd', '669237800025ce01a817');
        // Map and transform Document[] to Message[]
        const transformedMessages: Message[] = response.documents.map((doc) => ({
          text: doc.text, // Adjust based on your Appwrite document structure
          user: doc.user, // Adjust based on your Appwrite document structure
          userId: doc.userId, // Adjust based on your Appwrite document structure
          timestamp: doc.timestamp, // Adjust based on your Appwrite document structure
        }));
        setMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Listen for new messages
    socket.on('receiveMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      // Cleanup the socket connection
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = async () => {
    if (input.trim() && userId && user) {
      const message: Message = {
        text: input,
        user: user.firstName!,
        userId: userId,
        timestamp: new Date().toISOString(),
      };

      try {
        // Save message to Appwrite database
        await databases.createDocument('66923778003056cb26dd', '669237800025ce01a817', 'unique()', message);

        // Emit message to Socket.IO
        socket.emit('sendMessage', message);

        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col w-full h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-auto p-4 bg-white rounded shadow">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 p-4 rounded max-w-full ${msg.userId === userId ? 'bg-blue-500 text-right text-white self-end' : 'bg-green-500 text-left text-white self-start'}`}
          >
            <div className="text-2xl text-black font-bold">{msg.user}</div>
            <div className="mt-1">{msg.text}</div>
            <div className="text-xs text-gray-200 text-right">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center">
        <input
          className="flex-1 p-2 border text-black rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
