import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FiSend, FiSearch, FiMoreVertical, FiCheck, FiCheckCircle, FiUser, FiPhone, FiMail, FiClock, FiMessageCircle, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminChat = () => {
    const { conversations = [], messages = [], sendMessage, markAsRead, users = [], addConversation, editMessage, deleteMessage } = useData();
    const [selectedConvo, setSelectedConvo] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [deletingMsgId, setDeletingMsgId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedConvo]);

    const handleSend = async () => {
        if (newMessage.trim() && selectedConvo) {
            let convoId = selectedConvo.id;

            // If it's a virtual contact, create actual conversation first
            if (activeConvoList.find(c => c.id === selectedConvo.id)?.isNewContact) {
                const newConvo = await addConversation({
                    customerName: selectedConvo.customerName,
                    customerId: selectedConvo.customerId,
                    lastMessage: newMessage.trim(),
                    lastMessageTime: new Date().toISOString()
                });
                if (newConvo) {
                    convoId = newConvo.id;
                    setSelectedConvo(newConvo);
                }
            }

            sendMessage({
                conversationId: convoId,
                sender: 'admin',
                text: newMessage.trim(),
                timestamp: new Date().toISOString()
            });
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };


    const getConvoMessages = (convoId) => {
        // Check both camelCase and snake_case to ensure all messages match
        return (messages || []).filter(m => m.conversationId === convoId || m.conversation_id === convoId);
    };

    const getUnreadCount = (convoId) => {
        return getConvoMessages(convoId).filter(m => m.sender !== 'admin' && !m.read).length;
    };

    const activeConvoList = React.useMemo(() => {
        const existingConvos = conversations || [];
        const existingCustomerIds = new Set(existingConvos.map(c => c.customerId || c.customer_id));

        // Show all registered users who don't have a conversation yet (no membership requirement)
        // Users only need an ID - name can fallback to email prefix
        const allUsers = (users || []).filter(u => u.id && !existingCustomerIds.has(u.id));

        const newContacts = allUsers.map(u => ({
            id: `new-${u.id}`,
            customerId: u.id,
            customerName: u.name || u.email?.split('@')[0] || 'Unknown User',
            lastMessage: 'Start a new conversation',
            lastMessageTime: null,
            isNewContact: true
        }));

        return [...existingConvos, ...newContacts].filter(c => {
            const name = c.customerName || c.customer_name || '';
            const msg = c.lastMessage || c.last_message || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [conversations, users, searchQuery]);

    const filteredConversations = activeConvoList;

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    return (
        <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            {/* Left: Conversations List */}
            <div style={{
                width: '340px',
                background: 'rgba(20,20,20,0.8)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)' }}>Messages</h2>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem 0.8rem 2.5rem',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                        <FiSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredConversations.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>
                            <FiMessageCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>No conversations yet</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Customer inquiries will appear here</p>
                        </div>
                    ) : (
                        filteredConversations.map(convo => {
                            const unread = getUnreadCount(convo.id);
                            const isSelected = selectedConvo?.id === convo.id;
                            return (
                                <div
                                    key={convo.id}
                                    onClick={() => {
                                        setSelectedConvo(convo);
                                        if (unread > 0) markAsRead(convo.id);
                                    }}
                                    style={{
                                        padding: '1.2rem 1.5rem',
                                        cursor: 'pointer',
                                        background: isSelected ? 'rgba(var(--color-gold-rgb), 0.08)' : 'transparent',
                                        borderLeft: isSelected ? '3px solid var(--color-gold)' : '3px solid transparent',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        transition: '0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: '#000',
                                            fontSize: '1.1rem',
                                            flexShrink: 0
                                        }}>
                                            {(convo.customerName || convo.customer_name || 'U').charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                                <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{convo.customerName || convo.customer_name}</span>
                                                <span style={{ color: '#555', fontSize: '0.7rem' }}>{convo.isNewContact ? 'Registered' : formatTime(convo.lastMessageTime || convo.last_message_time)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{
                                                    color: (unread > 0 || convo.isNewContact) ? '#fff' : '#666',
                                                    fontSize: '0.85rem',
                                                    margin: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    fontWeight: (unread > 0 || convo.isNewContact) ? '500' : '400',
                                                    fontStyle: convo.isNewContact ? 'italic' : 'normal'
                                                }}>
                                                    {convo.lastMessage || convo.last_message || 'No messages yet'}
                                                </p>
                                                {unread > 0 && (
                                                    <span style={{
                                                        background: 'var(--color-gold)',
                                                        color: '#000',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold',
                                                        padding: '2px 8px',
                                                        borderRadius: '50px',
                                                        marginLeft: '0.5rem'
                                                    }}>{unread}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right: Chat Window */}
            <div style={{
                flex: 1,
                background: 'rgba(20,20,20,0.8)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {selectedConvo ? (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '1.2rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#000'
                                }}>
                                    {(selectedConvo.customerName || selectedConvo.customer_name || 'U').charAt(0)}
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>{selectedConvo.customerName || selectedConvo.customer_name}</div>
                                    <div style={{ color: '#4caf50', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></span>
                                        Online
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {selectedConvo.phone && (
                                    <a href={`tel:${selectedConvo.phone}`} style={{
                                        background: '#222',
                                        border: '1px solid #333',
                                        color: '#fff',
                                        padding: '0.6rem',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <FiPhone />
                                    </a>
                                )}
                                {selectedConvo.email && (
                                    <a href={`mailto:${selectedConvo.email}`} style={{
                                        background: '#222',
                                        border: '1px solid #333',
                                        color: '#fff',
                                        padding: '0.6rem',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <FiMail />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {getConvoMessages(selectedConvo.id).map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                const isDeleted = msg.deleted;
                                const isEditing = editingMsgId === msg.id;

                                return (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isAdmin ? 'flex-end' : 'flex-start',
                                        gap: '0.4rem'
                                    }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '0.8rem 1.2rem',
                                            borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: isDeleted ? 'rgba(255,68,68,0.05)' : (isAdmin ? 'var(--color-gold)' : '#222'),
                                            color: isAdmin && !isDeleted ? '#000' : '#fff',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5',
                                            position: 'relative',
                                            border: isDeleted ? '1px dashed #ff4444' : 'none'
                                        }} className="message-bubble">
                                            {isDeleted ? (
                                                <div style={{ fontStyle: 'italic', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FiTrash2 size={12} /> Message Deleted
                                                </div>
                                            ) : isEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        style={{ width: '100%', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.1)', color: 'inherit', padding: '0.5rem', borderRadius: '8px' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => setEditingMsgId(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><FiX /></button>
                                                        <button onClick={async () => { await editMessage(msg.id, editValue); setEditingMsgId(null); }} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer' }}><FiCheck /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p style={{ margin: 0 }}>{msg.text}</p>
                                                    {isAdmin && (
                                                        <div className="message-actions" style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', display: 'none', gap: '0.5rem', padding: '0 1rem' }}>
                                                            <button onClick={() => { setEditingMsgId(msg.id); setEditValue(msg.text); }} style={{ background: '#333', border: 'none', color: '#fff', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}><FiEdit2 size={12} /></button>
                                                            <button onClick={() => setDeletingMsgId(msg.id)} style={{ background: '#441111', border: 'none', color: '#ff4444', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}><FiTrash2 size={12} /></button>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                marginTop: '0.5rem',
                                                opacity: 0.6,
                                                fontSize: '0.65rem',
                                                fontWeight: 'bold'
                                            }}>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {msg.edited && !isDeleted && <span>(EDITED {formatTime(msg.edited_at)})</span>}
                                                {isDeleted && <span>(REMOVED {formatTime(msg.deleted_at)})</span>}
                                                {isAdmin && !isDeleted && <FiCheckCircle size={10} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div style={{
                            padding: '1.2rem 1.5rem',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    rows={1}
                                    style={{
                                        flex: 1,
                                        padding: '1rem 1.2rem',
                                        background: '#111',
                                        border: '1px solid #333',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        resize: 'none',
                                        maxHeight: '120px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim()}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: newMessage.trim() ? 'var(--color-gold)' : '#333',
                                        border: 'none',
                                        color: newMessage.trim() ? '#000' : '#666',
                                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        transition: '0.2s'
                                    }}
                                >
                                    <FiSend />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#444',
                        padding: '3rem'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(var(--color-gold-rgb), 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem'
                        }}>
                            <FiMessageCircle size={40} style={{ color: 'var(--color-gold)', opacity: 0.5 }} />
                        </div>
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Welcome to Customer Chat</h3>
                        <p style={{ textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
                            Select a conversation from the left to start communicating with your customers.
                        </p>
                    </div>
                )}
            </div>

            {/* Deletion Confirmation Modal */}
            <AnimatePresence>
                {deletingMsgId && (
                    <div className="modal active" onClick={() => setDeletingMsgId(null)} style={{ zIndex: 3000 }}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '400px',
                                padding: '3rem',
                                textAlign: 'center',
                                borderRadius: '35px',
                                background: 'rgba(10,10,10,0.99)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                backdropFilter: 'blur(40px)'
                            }}
                        >
                            <div style={{ width: '70px', height: '70px', background: 'rgba(239,68,68,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 1.5rem' }}>
                                <FiTrash2 size={28} />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.8rem', fontFamily: 'var(--font-heading)' }}>Remove Message?</h3>
                            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Are you sure you want to authorize the removal of this message from the communication registry?
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingMsgId(null)}>ABORT</button>
                                <button className="btn btn-primary" style={{ flex: 1, background: '#ef4444', border: 'none' }} onClick={async () => { await deleteMessage(deletingMsgId); setDeletingMsgId(null); }}>PURGE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .message-bubble:hover .message-actions {
                    display: flex !important;
                }
                .glass-modal {
                    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                }
            `}</style>
        </div>
    );
};

export default AdminChat;
