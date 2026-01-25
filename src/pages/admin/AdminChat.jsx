import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FiSend, FiSearch, FiMoreVertical, FiCheck, FiCheckCircle, FiUser, FiPhone, FiMail, FiClock, FiMessageCircle } from 'react-icons/fi';

const AdminChat = () => {
    const { conversations = [], messages = [], sendMessage, markAsRead, users = [] } = useData();
    const [selectedConvo, setSelectedConvo] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
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
        return (messages || []).filter(m => m.conversationId === convoId);
    };

    const getUnreadCount = (convoId) => {
        return getConvoMessages(convoId).filter(m => m.sender !== 'admin' && !m.read).length;
    };

    const activeConvoList = React.useMemo(() => {
        const existingConvos = conversations || [];
        const existingCustomerIds = new Set(existingConvos.map(c => c.customerId));

        // Find users with plans who don't have a conversation yet
        const subbedUsers = (users || []).filter(u => u.plan && u.plan !== 'None' && !existingCustomerIds.has(u.id));

        const newContacts = subbedUsers.map(u => ({
            id: `new-${u.id}`,
            customerId: u.id,
            customerName: u.name,
            lastMessage: 'Start a new conversation',
            lastMessageTime: null,
            isNewContact: true
        }));

        return [...existingConvos, ...newContacts].filter(c =>
            c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
        );
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
                                            {convo.customerName.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                                <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{convo.customerName}</span>
                                                <span style={{ color: '#555', fontSize: '0.7rem' }}>{convo.isNewContact ? 'Subscribed' : formatTime(convo.lastMessageTime)}</span>
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
                                                    {convo.lastMessage || 'No messages yet'}
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
                                    {selectedConvo.customerName.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>{selectedConvo.customerName}</div>
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
                                return (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: isAdmin ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '1rem 1.2rem',
                                            borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: isAdmin ? 'var(--color-gold)' : '#222',
                                            color: isAdmin ? '#000' : '#fff',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5'
                                        }}>
                                            <p style={{ margin: 0 }}>{msg.text}</p>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                marginTop: '0.5rem',
                                                opacity: 0.7,
                                                fontSize: '0.7rem'
                                            }}>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {isAdmin && <FiCheckCircle size={12} />}
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminChat;
