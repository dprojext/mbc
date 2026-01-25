import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FiSearch, FiFilter, FiPlus, FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign, FiClock, FiTrash2, FiX, FiCheckCircle, FiCopy } from 'react-icons/fi';

const AdminUsers = () => {
    const { users = [], addUser: addContextUser, deleteUser: deleteContextUser } = useData();

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Users'); // 'Users' or 'Staff'
    const [newUser, setNewUser] = useState({ name: '', email: '', plan: 'None', status: 'Pending', phone: '', role: 'user', password: '' });
    const [createdUser, setCreatedUser] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [copiedField, setCopiedField] = useState(null); // 'email' or 'password'

    const handleDelete = () => {
        if (deleteConfirm === selectedUser.name) {
            deleteContextUser(selectedUser.id);
            setSelectedUser(null);
            setIsDeleting(false);
            setDeleteConfirm('');
        }
    };

    const handleAddUser = () => {
        if (newUser.name && newUser.email) {
            const tempPassword = newUser.password || Math.random().toString(36).slice(-8).toUpperCase();
            const id = Date.now(); // Ensure unique ID
            const userToAdd = {
                ...newUser,
                id,
                joined: new Date().toISOString().split('T')[0],
                totalSpent: 0,
                lastActive: 'Never',
                tempPassword,
                requires_password_change: true
            };
            addContextUser(userToAdd);
            setCreatedUser(userToAdd);
            setIsAddingUser(false);
            setShowSuccess(true);
            setNewUser({ name: '', email: '', plan: 'None', status: 'Pending', phone: '', role: 'user', password: '' });
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' ||
            user.status === activeFilter ||
            user.plan === activeFilter;

        const isStaff = user.role && user.role !== 'user';
        const matchesTab = activeTab === 'Staff' ? isStaff : !isStaff;

        return matchesSearch && matchesFilter && matchesTab;
    });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', position: 'relative' }}>
            {/* Header with Long Search and Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Management</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', margin: 0, color: '#fff' }}>User Registry</h1>
                </div>

                {/* Sub-Tabs */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Users', 'Staff'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '1rem 0.5rem',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab ? 'var(--color-gold)' : '#555',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: '0.3s'
                            }}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--color-gold)', borderRadius: '2px' }} />
                            )}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search by name, email, or membership tier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '50px',
                                padding: '0.9rem 1.5rem 0.9rem 3rem',
                                color: '#fff',
                                fontSize: '0.95rem',
                                width: '100%',
                                outline: 'none',
                                transition: '0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(var(--color-gold-rgb), 0.4)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                        />
                        <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, color: 'var(--color-gold)', display: 'flex', alignItems: 'center' }}>
                            <FiSearch />
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', position: 'relative' }}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '50px',
                                padding: '0.9rem 1.5rem',
                                color: activeFilter !== 'All' ? 'var(--color-gold)' : '#aaa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                cursor: 'pointer',
                                transition: '0.3s',
                                fontSize: '0.9rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                            <FiFilter />
                            <span>{activeFilter === 'All' ? 'Filter' : activeFilter}</span>
                        </button>

                        {isFilterOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: '140px',
                                marginTop: '0.5rem',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                zIndex: 100,
                                width: '150px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                            }}>
                                {['All', 'Active', 'Inactive', 'Pending', 'Gold', 'Platinum', 'Silver'].map(option => (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            setActiveFilter(option);
                                            setIsFilterOpen(false);
                                        }}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            cursor: 'pointer',
                                            color: activeFilter === option ? 'var(--color-gold)' : '#888',
                                            fontSize: '0.85rem',
                                            borderRadius: '6px'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ padding: '0.9rem 2rem' }} onClick={() => setIsAddingUser(true)}>
                            + Add {activeTab === 'Staff' ? 'Staff' : 'User'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Table */}
            <div style={{
                background: 'rgba(20,20,20,0.8)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member Profile</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{activeTab === 'Staff' ? 'Role' : 'Tier'}</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last Activity</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{activeTab === 'Staff' ? 'Access' : 'Revenue'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(var(--color-gold-rgb), 0.03)';
                                    e.currentTarget.style.paddingLeft = '5px';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            color: '#000',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                        }}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '500', fontSize: '1rem', marginBottom: '0.2rem' }}>{user.name}</div>
                                            <div style={{ color: '#555', fontSize: '0.8rem' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{
                                        color: (user.plan === 'Platinum' || user.role === 'admin') ? 'var(--color-gold)' : (user.plan === 'Gold' || user.role === 'importer') ? '#d4af37' : '#999',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        letterSpacing: '0.02em',
                                        textTransform: 'capitalize'
                                    }}>
                                        {activeTab === 'Staff' ? (user.role === 'importer' ? 'Data Importer' : user.role === 'cleaner' ? 'Cleaner / Washer' : user.role) : user.plan}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '5px 12px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        background: user.status === 'Active' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255, 68, 68, 0.08)',
                                        color: user.status === 'Active' ? '#4caf50' : '#ff4444',
                                        border: `1px solid ${user.status === 'Active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)'}`
                                    }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                        {user.status}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', color: '#666', fontSize: '0.9rem' }}>{user.lastActive}</td>
                                <td style={{ padding: '1.5rem', color: '#fff', fontWeight: '700', fontSize: '1rem' }}>{activeTab === 'Staff' ? (user.role === 'admin' ? 'Full Access' : 'Limited') : user.totalSpent}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Unified View/Edit Modal */}
            {selectedUser && !isDeleting && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.3s ease'
                }} >
                    <div style={{
                        background: '#0d0d0d',
                        padding: '3rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        width: '100%',
                        maxWidth: '550px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>

                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                margin: '0 auto 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#000',
                                boxShadow: '0 10px 20px rgba(var(--color-gold-rgb), 0.2)'
                            }}>
                                {selectedUser.name.charAt(0)}
                            </div>
                            <h2 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.8rem' }}>{selectedUser.name}</h2>
                            <p style={{ color: '#555', margin: 0 }}>Member since {selectedUser.joined}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
                                    <input type="email" defaultValue={selectedUser.email} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</label>
                                    <input type="text" defaultValue={selectedUser.phone} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{selectedUser.role && selectedUser.role !== 'user' ? 'Staff Role' : 'Tier'}</label>
                                    {selectedUser.role && selectedUser.role !== 'user' ? (
                                        <select defaultValue={selectedUser.role} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }}>
                                            <option value="admin" style={{ background: '#0a0a0a', color: '#fff' }}>Admin</option>
                                            <option value="importer" style={{ background: '#0a0a0a', color: '#fff' }}>Data Importer</option>
                                            <option value="cleaner" style={{ background: '#0a0a0a', color: '#fff' }}>Cleaner / Washer</option>
                                            <option value="other" style={{ background: '#0a0a0a', color: '#fff' }}>Other Staff</option>
                                        </select>
                                    ) : (
                                        <select defaultValue={selectedUser.plan} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }}>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>Silver</option>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>Gold</option>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>Platinum</option>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>None</option>
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</label>
                                    <select defaultValue={selectedUser.status} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }}>
                                        <option style={{ background: '#0a0a0a', color: '#fff' }}>Active</option>
                                        <option style={{ background: '#0a0a0a', color: '#fff' }}>Inactive</option>
                                        <option style={{ background: '#0a0a0a', color: '#fff' }}>Pending</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-primary" style={{ flex: 2, padding: '1rem' }} onClick={() => setSelectedUser(null)}>
                                    Save Profile Updates
                                </button>
                                <button
                                    onClick={() => setIsDeleting(true)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,68,68,0.05)',
                                        border: '1px solid rgba(255,68,68,0.1)',
                                        color: '#ff4444',
                                        borderRadius: '50px',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: '0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.05)'}
                                >
                                    Delete Account
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#444',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Cancel and Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.3s ease'
                }} onClick={() => setIsAddingUser(false)}>
                    <div style={{
                        background: '#0d0d0d',
                        padding: '3rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        width: '100%',
                        maxWidth: '550px',
                        position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>

                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(var(--color-gold-rgb), 0.1)',
                                margin: '0 auto 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-gold)'
                            }}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                            </div>
                            <h2 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.8rem' }}>Register New User</h2>
                            <p style={{ color: '#555', margin: 0 }}>Create a new member account manually.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
                                    <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{activeTab === 'Staff' ? 'Staff Role' : 'Initial Tier'}</label>
                                    {activeTab === 'Staff' ? (
                                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }}>
                                            <option value="admin" style={{ background: '#0a0a0a', color: '#fff' }}>Admin</option>
                                            <option value="importer" style={{ background: '#0a0a0a', color: '#fff' }}>Data Importer</option>
                                            <option value="cleaner" style={{ background: '#0a0a0a', color: '#fff' }}>Cleaner / Washer</option>
                                            <option value="other" style={{ background: '#0a0a0a', color: '#fff' }}>Other Staff</option>
                                        </select>
                                    ) : (
                                        <select value={newUser.plan} onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }}>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>None</option>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>Silver</option>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>Gold</option>
                                            <option style={{ background: '#0a0a0a', color: '#fff' }}>Platinum</option>
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input type="text" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="+1 (555) 000-0000" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Temporary Password (Optional)</label>
                            <input
                                type="text"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Leave blank to auto-generate"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', color: '#fff', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: '1rem' }} onClick={handleAddUser}>
                                Create Account
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setIsAddingUser(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal for New User */}
            {showSuccess && createdUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1200,
                    backdropFilter: 'blur(15px)',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{
                        background: '#0d0d0d',
                        padding: '3.5rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                        width: '100%',
                        maxWidth: '500px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,1)'
                    }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'rgba(76, 175, 80, 0.1)',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4caf50'
                        }}>
                            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.8rem' }}>User Registered!</h2>
                        <p style={{ color: '#666', marginBottom: '2.5rem' }}>Login credentials have been generated and sent to {createdUser.email}.</p>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem', textAlign: 'left' }}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.4rem' }}>Temporary Login</label>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>{createdUser.email}</div>
                                    <button
                                        onClick={() => copyToClipboard(createdUser.email, 'email')}
                                        style={{ background: 'none', border: 'none', color: copiedField === 'email' ? '#4caf50' : '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        {copiedField === 'email' ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>{copiedField === 'email' ? 'COPIED' : 'COPY'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.4rem' }}>Temporary Password</label>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{createdUser.tempPassword}</div>
                                    <button
                                        onClick={() => copyToClipboard(createdUser.tempPassword, 'password')}
                                        style={{ background: 'none', border: 'none', color: copiedField === 'password' ? '#4caf50' : '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        {copiedField === 'password' ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>{copiedField === 'password' ? 'COPIED' : 'COPY'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '2.5rem', lineHeight: '1.5' }}>
                            The user will be prompted to change this password upon their first successful login.
                        </p>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.2rem' }}
                            onClick={() => setShowSuccess(false)}
                        >
                            Got it, continue
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {isDeleting && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100,
                    backdropFilter: 'blur(20px)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: '#111',
                        padding: '3rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,68,68,0.2)',
                        width: '100%',
                        maxWidth: '450px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⚠️</div>
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Delete Account?</h2>
                        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: '1.6' }}>
                            This action is permanent. To confirm, please type <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser.name}</span> exactly as it appears.
                        </p>

                        <input
                            type="text"
                            placeholder="Type user name to confirm..."
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#000',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '1rem',
                                color: '#fff',
                                outline: 'none',
                                marginBottom: '2rem',
                                textAlign: 'center',
                                fontSize: '1.1rem'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    setIsDeleting(false);
                                    setDeleteConfirm('');
                                }}
                                style={{ flex: 1, padding: '1rem', background: '#222', border: 'none', color: '#888', borderRadius: '50px', cursor: 'pointer' }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirm !== selectedUser.name}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: deleteConfirm === selectedUser.name ? '#ff4444' : '#333',
                                    border: 'none',
                                    color: deleteConfirm === selectedUser.name ? '#fff' : '#555',
                                    borderRadius: '50px',
                                    cursor: deleteConfirm === selectedUser.name ? 'pointer' : 'not-allowed',
                                    fontWeight: 'bold',
                                    transition: '0.3s'
                                }}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminUsers;
