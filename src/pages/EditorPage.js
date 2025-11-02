import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { initSocket } from '../socket.js';
import ACTIONS from '../Actions.js';
import Editor from '../components/Editor.js';
import Chat from '../components/Chat.js';

const EditorPage = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const [clients, setClients] = useState([]);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [chatVisible, setChatVisible] = useState(true); // Force chat to be visible
    const socketRef = useRef(null);
    const codeRef = useRef(null);

    useEffect(() => {
        if (!location.state) {
            return <Navigate to="/" />;
        }

        const init = async () => {
            socketRef.current = await initSocket();
            
            socketRef.current.on('connect_error', (err) => {
                console.log('connection error', err);
            });

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state.username,
            });

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                setClients(clients);
                console.log(`${username} joined the room`);
            });

            // Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
                console.log(`${username} left the room`);
            });
        };
        init();
    }, [roomId, location.state]);

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            alert('Room ID copied!');
        } catch (err) {
            console.error('Failed to copy room ID', err);
        }
    };

    const leaveRoom = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        window.location.href = '/';
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const toggleChat = () => {
        setChatVisible(!chatVisible);
    };

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <>
            {/* Header */}
            <div className="editor-header">
                <div className="header-container">
                    <div className="logo-section">
                        <div className="logo">CodeGen4Future</div>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-copy" onClick={copyRoomId}>
                            📋 Copy Room ID
                        </button>
                        <button className="btn btn-leave" onClick={leaveRoom}>
                            🚪 Leave Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Buttons */}
            <button 
                className="sidebar-toggle" 
                onClick={toggleSidebar}
                title={sidebarVisible ? "Hide Connected Users" : "Show Connected Users"}
            >
                {sidebarVisible ? '◀' : '▶'}
            </button>
            <button 
                className="chat-toggle" 
                onClick={toggleChat}
                title={chatVisible ? "Hide Chat" : "Show Chat"}
            >
                
            </button>

            {/* Main Content */}
            <div className={`mainWrap${!sidebarVisible ? ' sidebar-hidden' : ''}${!chatVisible ? ' chat-hidden' : ''}`}>
                <aside className={`aside${sidebarVisible ? '' : ' hidden'}`}>
                    <div className="sidebar-section">
                        <div className="section-title">👥 Connected Users</div>
                        <div className="clientsList">
                            {clients.map((client) => (
                                <div key={client.socketId} className="client">
                                    <div className="clientAvatar">
                                        {client.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="userName">{client.username}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <div className="editorWrap">
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                        }}
                    />
                </div>
                <div className={`chatSidebar${chatVisible ? '' : ' hidden'}`}>
                    <Chat
                        socketRef={socketRef}
                        roomId={roomId}
                        username={location.state?.username}
                    />
                </div>
            </div>
        </>
    );
};

export default EditorPage;
