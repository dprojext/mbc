import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { FiSearch, FiFilter, FiPlus, FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign, FiClock, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const { users = [], addUser, deleteUser, updateUserStatus } = useData();
    const { showToast } = useToast();

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isViewingDetails, setIsViewingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Users'); // 'Users', 'Staff', 'Archive'
    const [activeFilter, setActiveFilter] = useState('All');
    const [newUser, setNewUser] = useState({ name: '', email: '', plan: 'None', status: 'Active', role: 'user', description: '' });

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const isStaff = user.role && user.role !== 'user';
        const isArchived = ['Banned', 'Suspended', 'Archived'].includes(user.status);

        let matchesTab = false;
        if (activeTab === 'Archive') {
            matchesTab = isArchived;
        } else if (activeTab === 'Staff') {
            matchesTab = isStaff && !isArchived;
        } else {
            matchesTab = !isStaff && !isArchived;
        }

        const matchesFilter = activeFilter === 'All' || user.plan === activeFilter || user.status === activeFilter;
        return matchesSearch && matchesTab && matchesFilter;
    });

    const handleAddUser = () => {
        const tempId = `USR-${Date.now()}`;
        const userPayload = {
            ...newUser,
            id: tempId,
            joined: new Date().toISOString().split('T')[0],
            totalSpent: 0,
            lastActive: 'Just now',
            setupComplete: false,
            savedVehicles: [],
            savedAddresses: [],
            phone: ''
        };
        addUser(userPayload);

        showToast(`Account protocol initiated for ${newUser.name}. Setup email dispatched.`, 'success');

        setIsAddingUser(false);
        setNewUser({ name: '', email: '', plan: 'None', status: 'Active', role: 'user', description: '' });
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
                        {['Users', 'Staff', 'Archive'].map(tab => (
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
                                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                            <button
                                                onClick={() => { setSelectedUser(user); setIsViewingDetails(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                            >Details</button>

                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                {user.status === 'Active' ? (
                                                    <>
                                                        <button onClick={() => { updateUserStatus(user.id, 'Suspended'); showToast('Registry item suspended.', 'info'); }} style={{ background: 'rgba(255,152,0,0.1)', border: 'none', color: '#ff9800', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="Suspend"><FiClock size={14} /></button>
                                                        <button onClick={() => { updateUserStatus(user.id, 'Banned'); showToast('Registry item banned.', 'error'); }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="Ban"><FiCheckCircle size={14} /></button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => { updateUserStatus(user.id, 'Active'); showToast('Registry item restored.', 'success'); }} style={{ background: 'rgba(76,175,80,0.1)', border: 'none', color: '#4caf50', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="Restore">Active</button>
                                                )}

                                                {user.status !== 'Archived' && (
                                                    <button onClick={() => { updateUserStatus(user.id, 'Archived'); showToast('Registry item archived.', 'info'); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="Archive">Archive</button>
                                                )}

                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsDeleting(true); }}
                                                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '0.4rem' }}
                                                    title="Permanently Delete"
                                                ><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
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
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '850px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)' }}>
                            <h2 className="admin-title" style={{ fontSize: '1.5rem' }}>Add New Account</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={{ padding: '1rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', color: '#fff' }} />
                                <input placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={{ padding: '1rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', color: '#fff' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>ACCOUNT TYPE & ROLE</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={['user', 'admin', 'staff', 'supervisor', 'fleet'].includes(newUser.role) ? newUser.role : 'custom'}
                                                onChange={e => setNewUser({ ...newUser, role: e.target.value === 'custom' ? '' : e.target.value })}
                                                style={{ width: '100%', marginBottom: '0.5rem' }}
                                            >
                                                <optgroup label="Global Archetypes">
                                                    <option value="user">Private Client</option>
                                                    <option value="admin">Executive Administrator</option>
                                                </optgroup>
                                                <optgroup label="Operational Staff">
                                                    <option value="staff">Field Technician</option>
                                                    <option value="supervisor">Lead Supervisor</option>
                                                    <option value="fleet">Fleet Orchestrator</option>
                                                </optgroup>
                                                <option value="custom">Bespoke Title...</option>
                                            </select>
                                            {!['user', 'admin', 'staff', 'supervisor', 'fleet'].includes(newUser.role) && (
                                                <input placeholder="Enter specific title..." value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ padding: '0.8rem', background: '#0d0d0d', border: '1px solid #c9a96a44', borderRadius: '8px', color: '#fff', width: '100%', fontSize: '0.85rem' }} />
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>TIER / PLAN</label>
                                        <div style={{ position: 'relative' }}>
                                            <select value={['None', 'Gold', 'Platinum'].includes(newUser.plan) ? newUser.plan : 'custom'} onChange={e => setNewUser({ ...newUser, plan: e.target.value === 'custom' ? '' : e.target.value })} style={{ width: '100%', marginBottom: '0.5rem' }}>
                                                <option value="None">No Plan</option>
                                                <option value="Gold">Gold</option>
                                                <option value="Platinum">Platinum</option>
                                                <option value="custom">Custom Tier...</option>
                                            </select>
                                            {!['None', 'Gold', 'Platinum'].includes(newUser.plan) && (
                                                <input placeholder="Enter custom tier name..." value={newUser.plan} onChange={e => setNewUser({ ...newUser, plan: e.target.value })} style={{ padding: '0.8rem', background: '#0d0d0d', border: '1px solid #c9a96a44', borderRadius: '8px', color: '#fff', width: '100%', fontSize: '0.85rem' }} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Mandate / Strategic Bio</label>
                                    <textarea
                                        placeholder={newUser.role === 'staff' || newUser.role === 'supervisor' ? "Identify core competencies (e.g. Master Detailer, Shield Protection Expert, Fleet Logistics)..." : "Client profile notes or administrative biography..."}
                                        value={newUser.description}
                                        onChange={e => setNewUser({ ...newUser, description: e.target.value })}
                                        style={{ width: '100%', padding: '1.2rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #222', borderRadius: '15px', color: '#fff', minHeight: '120px', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.6' }}
                                    />
                                    <p style={{ color: '#444', fontSize: '0.65rem', marginTop: '0.6rem' }}>This information is critical for internal resource allocation and specialization tracking.</p>
                                </div>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddUser}>Create Account</button>
                                <button className="btn btn-secondary" onClick={() => setIsAddingUser(false)}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isViewingDetails && selectedUser && (
                    <div className="modal active" onClick={() => setIsViewingDetails(false)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 className="admin-title">Member Details</h2>
                                <button onClick={() => setIsViewingDetails(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><FiX size={24} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Account Information</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <div><span style={{ color: '#666', fontSize: '0.75rem' }}>FULL NAME</span><div style={{ color: '#fff' }}>{selectedUser.name}</div></div>
                                        <div><span style={{ color: '#666', fontSize: '0.75rem' }}>EMAIL</span><div style={{ color: '#fff' }}>{selectedUser.email}</div></div>
                                        <div><span style={{ color: '#666', fontSize: '0.75rem' }}>PHONE</span><div style={{ color: '#fff' }}>{selectedUser.phone || 'N/A'}</div></div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Operational Mandate</h4>
                                    <div style={{ padding: '1.2rem', background: 'rgba(201,169,106,0.05)', borderRadius: '15px', border: '1px solid rgba(201,169,106,0.1)' }}>
                                        <p style={{ margin: 0, color: '#aaa', lineHeight: '1.6', fontSize: '0.9rem' }}>{selectedUser.description || 'No operational mandate or specialization recorded for this member.'}</p>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
                                        <div><span style={{ color: '#666', fontSize: '0.75rem' }}>PRIMARY ROLE</span><div style={{ color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedUser.role}</div></div>
                                        <div><span style={{ color: '#666', fontSize: '0.75rem' }}>STATUS</span><div style={{ color: selectedUser.status === 'Active' ? '#4caf50' : '#ff9800' }}>{selectedUser.status}</div></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Saved Fleet & Locations</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem' }}>VEHICLES</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {(selectedUser.savedVehicles || []).length > 0 ? selectedUser.savedVehicles.map((v, i) => (
                                                <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.85rem', color: '#fff' }}>{v}</div>
                                            )) : <div style={{ color: '#444', fontSize: '0.85rem' }}>No saved vehicles</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem' }}>ADDRESSES</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {(selectedUser.savedAddresses || []).length > 0 ? selectedUser.savedAddresses.map((a, i) => (
                                                <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.85rem', color: '#fff' }}>{a}</div>
                                            )) : <div style={{ color: '#444', fontSize: '0.85rem' }}>No saved addresses</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2.5rem' }} onClick={() => setIsViewingDetails(false)}>Close Registry Entry</button>
                        </motion.div>
                    </div>
                )}
                {isDeleting && selectedUser && (
                    <div className="modal active" onClick={() => setIsDeleting(false)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '450px',
                                padding: '3.5rem',
                                textAlign: 'center',
                                borderRadius: '35px',
                                background: 'rgba(20,20,20,0.96)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                backdropFilter: 'blur(40px)'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 2rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                                <FiTrash2 size={32} />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Purge Account?</h2>
                            <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                                Are you sure you want to authorize the permanent deletion of <b>{selectedUser.name}</b>'s registry entry? This action cannot be reversed.
                            </p>
                            <div style={{ display: 'flex', gap: '1.2rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setIsDeleting(false)}>ABORT</button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#ef4444', border: 'none', color: '#fff', fontWeight: '900' }} onClick={handleDelete}>AUTHORIZE PURGE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
