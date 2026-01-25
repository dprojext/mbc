import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const { user } = useAuth();

    // Mock user history
    const history = user?.requests || [
        { id: 1, service: 'Signature Hand Wash', date: '2023-10-15', status: 'Completed', notes: 'Great job!' },
        { id: 2, service: 'Interior Detail', date: '2023-11-20', status: 'Completed', notes: '' }
    ];

    return (
        <div style={{ background: 'var(--color-black)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="garage-container">
                <div className="garage-header">
                    <h1 className="garage-title">My Garage</h1>
                    <Link to="/booking" className="btn btn-primary">
                        <span>New Appointment</span>
                        <div className="btn-shine"></div>
                    </Link>
                </div>

                <div className="garage-card">
                    <h2 className="garage-card-title">Recent Activity</h2>

                    {history.length > 0 ? (
                        <div className="history-list">
                            {history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="history-info">
                                        <div className="history-service">{item.service}</div>
                                        <div className="history-id">ID: #{item.id}</div>
                                    </div>
                                    <div className="history-date">{item.date}</div>
                                    <div className="history-status">
                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="history-actions">
                                        <button className="btn btn-secondary">Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No service history found.</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserDashboard;
