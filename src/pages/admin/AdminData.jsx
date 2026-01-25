import React from 'react';
import { useData } from '../../context/DataContext';

const AdminData = () => {
    const { transactions, bookings, plans, services, users, purgeSystemData } = useData();
    const [downloadType, setDownloadType] = React.useState('CSV'); // 'CSV' or 'JSON'

    const generateCSV = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                const val = row[fieldName];
                return JSON.stringify(val === undefined || val === null ? '' : val);
            }).join(','))
        ];
        return csvRows.join('\n');
    };

    const getDataByType = (type) => {
        switch (type) {
            case 'User Data':
                return users;
            case 'Payment Data':
                return transactions;
            case 'Website Data':
                return { services, plans, bookings };
            case 'All Data':
                return { users, transactions, services, plans, bookings };
            default:
                return [];
        }
    };

    const handleDownload = (category) => {
        const data = getDataByType(category);
        const date = new Date().toISOString().split('T')[0];
        let filename = `${category.toLowerCase().replace(' ', '-')}-${date}`;
        let content = '';
        let type = '';

        if (downloadType === 'JSON' || category === 'Website Data' || category === 'All Data') {
            // Complex data types force JSON
            content = JSON.stringify(data, null, 2);
            type = 'application/json';
            filename += '.json';
        } else {
            content = generateCSV(data);
            type = 'text/csv;charset=utf-8;';
            filename += '.csv';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = (category) => {
        // Trigger file input
        const input = document.getElementById(`file-upload-${category}`);
        if (input) input.click();
    };

    const onFileChange = (event, category) => {
        const file = event.target.files[0];
        if (file) {
            alert(`Uploading ${category}: ${file.name} (Mock Process)`);
            // Here you would parse the file and update the context
        }
    };

    const dataCategories = [
        { label: 'User Data', desc: 'Member profiles & accounts' },
        { label: 'Payment Data', desc: 'Transactions & invoices' },
        { label: 'Website Data', desc: 'Services, plans & bookings' },
        { label: 'All Data', desc: 'Full system backup archive' }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem', color: '#fff' }}>Data Hub</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                {/* Export Section */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, color: '#fff' }}>Export Data</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#222', padding: '0.3rem', borderRadius: '8px' }}>
                            <button
                                onClick={() => setDownloadType('CSV')}
                                style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                    background: downloadType === 'CSV' ? 'var(--color-gold)' : 'transparent',
                                    color: downloadType === 'CSV' ? 'var(--color-btn-text, #000)' : '#888', fontWeight: '600', fontSize: '0.8rem'
                                }}
                            >CSV</button>
                            <button
                                onClick={() => setDownloadType('JSON')}
                                style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                    background: downloadType === 'JSON' ? 'var(--color-gold)' : 'transparent',
                                    color: downloadType === 'JSON' ? 'var(--color-btn-text, #000)' : '#888', fontWeight: '600', fontSize: '0.8rem'
                                }}
                            >JSON</button>
                        </div>
                    </div>
                    <p style={{ color: '#999', marginBottom: '2rem' }}>Download system records. 'Website' and 'All Data' will always download as JSON.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {dataCategories.map((item) => {
                            const isJsonOnly = item.label === 'Website Data' || item.label === 'All Data';
                            const effectiveType = isJsonOnly ? 'JSON' : downloadType;

                            return (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#111', borderRadius: '8px', border: '1px solid #222' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: '500' }}>{item.label}</div>
                                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{item.desc}</div>
                                        {isJsonOnly && downloadType === 'CSV' && (
                                            <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', marginTop: '0.2rem' }}>* JSON format only</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDownload(item.label)}
                                        className="btn"
                                        style={{
                                            padding: '0.6rem 1.2rem', fontSize: '0.8rem', background: '#222',
                                            color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer',
                                            transition: '0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--color-gold)';
                                            e.currentTarget.style.color = 'var(--color-gold)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#333';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                    >
                                        Download {effectiveType}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Import Section */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Import Data</h2>
                    <p style={{ color: '#999', marginBottom: '2rem' }}>Upload files to update system records. Supported: .csv, .json</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {dataCategories.map((item) => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#111', borderRadius: '8px', border: '1px solid #222' }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: '500' }}>{item.label}</div>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{item.desc}</div>
                                </div>
                                <button
                                    onClick={() => handleUpload(item.label)}
                                    className="btn"
                                    style={{
                                        padding: '0.6rem 1.2rem', fontSize: '0.8rem', background: 'rgba(76, 175, 80, 0.1)',
                                        color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.2)', borderRadius: '8px', cursor: 'pointer',
                                        transition: '0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
                                    }}
                                >
                                    Upload
                                </button>
                                <input
                                    type="file"
                                    id={`file-upload-${item.label}`}
                                    style={{ display: 'none' }}
                                    onChange={(e) => onFileChange(e, item.label)}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #222' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(var(--color-gold-rgb), 0.1)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                            <div style={{ color: 'var(--color-gold)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                                <strong>Warning:</strong> Importing data will overwrite existing records with matching IDs. Please ensure you have a backup ("All Data") before proceeding.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,68,68,0.2)', paddingTop: '2rem' }}>
                <div style={{ background: 'rgba(255,68,68,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,68,68,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ color: '#ff4444', margin: '0 0 0.5rem 0' }}>Danger Zone</h3>
                        <p style={{ color: '#666', margin: 0 }}>Permanently delete all system data (Users, Bookings, Payments, etc). This cannot be undone.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('CRITICAL: Are you absolutely sure? This will wipe ALL customers, bookings, and payment records from the system permanently.')) {
                                purgeSystemData();
                                alert('System reset complete. All data has been purged.');
                            }
                        }}
                        style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                    >
                        Purge All System Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminData;
