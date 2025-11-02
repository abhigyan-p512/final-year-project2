import React, { useEffect, useRef, useState } from 'react';
import ACTIONS from '../Actions.js';

const ChatComponent = ({ socketRef, roomId, username }) => {
    const [messages, setMessages] = useState([
        { sender: 'TestUser', message: 'Hello! This is a test message.' },
        { sender: 'System', message: 'Chat is now visible! 🎉' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socketRef.current) return;
        const socket = socketRef.current;
        const handleMessage = ({ username: sender, message }) => {
            console.log('Client received:', sender, message);
            setMessages(prev => [...prev, { sender, message }]);
        };
        socket.on(ACTIONS.CHAT_MESSAGE, handleMessage);
        return () => {
            socket.off(ACTIONS.CHAT_MESSAGE, handleMessage);
        };
    }, [socketRef.current]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input;
        console.log('Client sending:', username, msg, roomId);
        socketRef.current.emit(ACTIONS.CHAT_MESSAGE, {
            roomId,
            username,
            message: msg,
        });
        setInput('');
    };

    console.log('Chat component rendering with:', { username, roomId, messagesCount: messages.length });
    
    // Add a notification to show the chat is working
    useEffect(() => {
        if (messages.length > 0) {
            console.log('✅ Chat is working! Messages:', messages);
        }
    }, [messages]);
    
    return (
        <div className="chat-container">
            <div className="chatHeader">
                💬 Live Chat
            </div>
            
            <div className="chatMessages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chatMessage ${msg.sender === username ? 'myMessage' : 'otherMessage'}`}>
                        <div className="username">{msg.sender}</div>
                        <div className="message">{msg.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={sendMessage} className="chatInputForm">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="chatInput"
                />
                <button type="submit" className="chatSendBtn" disabled={!input.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatComponent;

