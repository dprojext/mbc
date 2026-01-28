import React from 'react';

const PaletteSimplePreview = ({ colors }) => {
    if (!colors) return null;

    return (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#0a0a0a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#444', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '1px' }}>Palette Live Engine</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: colors.primary, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: colors.secondary, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: colors.accent, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                    <button style={{ background: colors.primary, color: colors.background || '#000', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'default' }}>Confirm</button>
                    <span style={{ color: colors.accent, fontWeight: '700', fontSize: '0.85rem', alignSelf: 'center' }}>Dynamic Tag</span>
                </div>
            </div>
        </div>
    );
};

export default PaletteSimplePreview;
