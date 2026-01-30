import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiSend, FiMessageSquare, FiCheckCircle, FiClock, FiUser, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

const UserChat = () => {
    const { user } = useAuth();
    const { conversations = [], messages = [], sendMessage, addConversation } = useData();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Find our conversation or a virtual placeholder
    const myConvo = conversations.find(c => c.customer_id === user?.id || c.customerId === user?.id);

    // Auto-scroll logic (scrolls only the container, not the page)
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, myConvo]);

    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;
        if (!user?.id) {
            console.error("[CHAT] No authenticated user found.");
            return;
        }
        setIsSending(true);

        try {
            // Priority check for conversation (supports both DB snake_case and memory camelCase)
            let convo = conversations.find(c => (c.customer_id === user?.id) || (c.customerId === user?.id));
            let convoId = convo?.id;

            // If no conversation exists yet, create one
            if (!convoId) {
                console.log("[CHAT] Creating new executive conversation...");
                const customerName = user.name || user.email?.split('@')[0] || 'Guest User';
                const newConvo = await addConversation({
                    customerName: customerName,
                    customerId: user.id,
                    lastMessage: newMessage.trim(),
                    lastMessageTime: new Date().toISOString()
                });
                if (newConvo) {
                    convoId = newConvo.id;
                    console.log("[CHAT] New conversation created:", convoId);
                } else {
                    console.error("[CHAT] Failed to create conversation.");
                    return;
                }
            }

            if (convoId) {
                console.log("[CHAT] Sending message to:", convoId);
                const sent = await sendMessage({
                    conversationId: convoId,
                    sender: 'user',
                    text: newMessage.trim(),
                    timestamp: new Date().toISOString()
                });
                if (sent) {
                    setNewMessage('');
                } else {
                    console.error("[CHAT] Message failed to send.");
                }
            } else {
                console.error("[CHAT] Failed to establish conversation ID.");
            }
        } catch (error) {
            console.error("[CHAT] Dispatch failure:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const myMessages = myConvo ? messages.filter(m => m.conversationId === myConvo.id || m.conversation_id === myConvo.id) : [];

    const formatTime = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="user-chat-container" style={{ minHeight: 'calc(100vh - 15rem)', display: 'flex', flexDirection: 'column' }}>
            <header className="admin-flex-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>Support <span className="gold">Chat</span></h1>
                    <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.85rem' }}>Direct secure link to executive care.</p>
                </div>
            </header>

            <div className="admin-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Chat Header Info */}
                <div style={{ padding: '1.2rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                        <FiUser />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>MBC Admin Support</div>
                        <div style={{ color: '#4caf50', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></span>
                            Typically replies in minutes
                        </div>
                    </div>
                </div>

                {/* Messages Body */}
                <div
                    ref={scrollContainerRef}
                    style={{ flex: 1, minHeight: '300px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {myMessages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#444' }}>
                            <FiMessageSquare size={48} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
                            <h3>No messages yet</h3>
                            <p>Send a message below to start chatting with us.</p>
                        </div>
                    )}

                    {myMessages.map((msg, idx) => {
                        const isMe = msg.sender === 'user' || msg.sender === 'customer';
                        const isDeleted = msg.deleted;
                        const isEdited = msg.edited;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '90%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: isDeleted ? 'rgba(255,68,68,0.05)' : (isMe ? 'var(--color-gold)' : '#222'),
                                    color: (isMe && !isDeleted) ? '#000' : '#fff',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    border: isDeleted ? '1px dashed rgba(255,68,68,0.3)' : 'none'
                                }}>
                                    {isDeleted ? (
                                        <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Message Deleted</span>
                                    ) : (
                                        <span style={{ color: msg.text?.startsWith('[PROBLEM REPORTED]') ? '#ff0000ff' : 'inherit' }}>
                                            {msg.text}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.65rem',
                                    color: '#555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontWeight: 'bold'
                                }}>
                                    <span>{formatTime(msg.timestamp)}</span>
                                    {isEdited && !isDeleted && <span>• EDITED {formatTime(msg.edited_at)}</span>}
                                    {isDeleted && <span>• REMOVED {formatTime(msg.deleted_at)}</span>}
                                    {isMe && !isDeleted && <FiCheckCircle size={10} />}
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your issue or request..."
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: '#0a0a0a',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                resize: 'none',
                                fontSize: '0.9rem',
                                outline: 'none',
                                minHeight: '50px',
                                maxHeight: '150px'
                            }}
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || isSending}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: (newMessage.trim() && !isSending) ? 'var(--color-gold)' : '#222',
                                color: (newMessage.trim() && !isSending) ? '#000' : '#444',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                cursor: (newMessage.trim() && !isSending) ? 'pointer' : 'not-allowed',
                                transition: '0.3s',
                                opacity: isSending ? 0.6 : 1
                            }}
                        >
                            <FiSend />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserChat;
