import React from 'react';

const TypographySimplePreview = ({ typography, colors }) => {
    return (
        <div style={{ marginTop: '1.5rem', padding: '2.5rem', background: '#050505', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: typography || 'inherit' }}>
            <h2 style={{ color: colors?.primary || '#fff', fontSize: '2.8rem', fontWeight: '900', lineHeight: '0.9', marginBottom: '1rem' }}>The Art of <br />Precision</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', margin: 0, maxWidth: '450px' }}>Discover the future of professional restoration. This sample demonstrates the <strong>{typography}</strong> typeface in a high-fidelity hero configuration.</p>
        </div>
    );
};

export default TypographySimplePreview;
