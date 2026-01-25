import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FiSearch, FiFilter, FiPlus, FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign, FiClock, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const { users = [], addUser, deleteUser } = useData();

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Users'); // 'Users' or 'Staff'
    const [activeFilter, setActiveFilter] = useState('All');
    const [newUser, setNewUser] = useState({ name: '', email: '', plan: 'None', status: 'Active', role: 'user' });

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const isStaff = user.role && user.role !== 'user';
        const matchesTab = activeTab === 'Staff' ? isStaff : !isStaff;
        const matchesFilter = activeFilter === 'All' || user.plan === activeFilter || user.status === activeFilter;
        return matchesSearch && matchesTab && matchesFilter;
    });

    const handleAddUser = () => {
        if (newUser.name && newUser.email) {
            addUser({
                ...newUser,
                id: Date.now(),
                joined: new Date().toISOString().split('T')[0],
                totalSpent: 0,
                lastActive: 'Just now'
            });
            setIsAddingUser(false);
            setNewUser({ name: '', email: '', plan: 'None', status: 'Active', role: 'user' });
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            deleteUser(selectedUser.id);
            setSelectedUser(null);
            setIsDeleting(false);
        }
    };

    return (
        <div className="admin-users-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>User Management</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Registry of all registered users and staff members.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddingUser(true)}>
                    <FiPlus /> Add {activeTab === 'Staff' ? 'Staff' : 'User'}
                </button>
            </header>

            <div className="admin-card" style={{ padding: '0.8rem', marginBottom: '2rem' }}>
                <div className="admin-flex-between">
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Users', 'Staff'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                                    background: activeTab === tab ? 'var(--color-gold)' : 'transparent',
                                    color: activeTab === tab ? '#000' : '#888',
                                    fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s'
                                }}
                            >{tab}</button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px', width: '100%' }}>
                        <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                        <input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', background: '#0a0a0a',
                                border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Member</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Plan / Role</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Joined</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#444' }}>No registry records found</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.2s' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {user.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '500' }}>{user.name}</div>
                                                <div style={{ color: '#555', fontSize: '0.8rem' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>{user.role === 'user' ? (user.plan || 'None') : user.role}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem',
                                            background: user.status === 'Active' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                            color: user.status === 'Active' ? '#4caf50' : '#ff9800'
                                        }}>{user.status}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>{user.joined}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <button
                                            onClick={() => { setSelectedUser(user); setIsDeleting(true); }}
                                            style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                                        ><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddingUser && (
                    <div className="modal active" onClick={() => setIsAddingUser(false)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="admin-title" style={{ fontSize: '1.5rem' }}>Add New Account</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                                <input placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                    <select value={newUser.plan} onChange={e => setNewUser({ ...newUser, plan: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}>
                                        <option value="None">No Plan</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Platinum">Platinum</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddUser}>Create Account</button>
                                <button className="btn btn-secondary" onClick={() => setIsAddingUser(false)}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isDeleting && selectedUser && (
                    <div className="modal active" onClick={() => setIsDeleting(false)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <FiTrash2 size={48} color="#ff4444" style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Terminate Account?</h2>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>Are you sure you want to delete <b>{selectedUser.name}</b>? This action is permanent.</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsDeleting(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1, background: '#ff4444' }} onClick={handleDelete}>Delete Now</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
