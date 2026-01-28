import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import {
    FiLayout, FiGlobe, FiShield, FiX, FiCheck, FiSave, FiUpload,
    FiTrash2, FiSearch, FiLayers, FiFileText, FiLink, FiImage,
    FiSettings, FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook,
    FiTwitter, FiLinkedin, FiPlus, FiClock, FiEdit2, FiExternalLink,
    FiUsers, FiHome, FiMonitor, FiBookOpen, FiCopy, FiEye, FiType, FiDroplet,
    FiYoutube, FiGithub, FiMessageSquare, FiTablet, FiSmartphone, FiAlertTriangle, FiTrash
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ToggleSwitch = React.memo(({ checked, onChange, id, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => onChange({ target: { checked: !checked, type: 'checkbox', id } })}>
        <div style={{
            width: '42px',
            height: '24px',
            background: checked ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            position: 'relative',
            transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: checked ? '0 0 15px rgba(201,169,106,0.3)' : 'none'
        }}>
            <div style={{
                width: '18px',
                height: '18px',
                background: checked ? '#000' : '#444',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: checked ? '21px' : '3px',
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
        </div>
        {label && <label htmlFor={id} style={{ fontSize: '0.75rem', color: checked ? '#fff' : '#666', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}>{label}</label>}
    </div>
));

const GOOGLE_FONTS = [
    "Outfit", "Inter", "Nunito", "Playfair Display", "Montserrat", "Raleway", "Roboto", "Open Sans", "Lato", "Poppins",
    "Oswald", "Source Sans Pro", "Slabo 27px", "PT Sans", "Merriweather", "Noto Sans", "Ubuntu", "Lora", "Mukta",
    "Rubik", "Kanit", "Work Sans", "Fira Sans", "Quicksand", "Barlow", "Nanum Gothic", "Inconsolata"
];

const InputField = React.memo(({ label, value, name, onChange, placeholder, icon: Icon, type = 'text', multiline = false, onUpload }) => {
    const fileRef = useRef(null);
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpload(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                {label && <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>}
                {onUpload && (
                    <button onClick={() => fileRef.current?.click()} style={{ background: 'rgba(201,169,106,0.1)', color: 'var(--color-gold)', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.6rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FiUpload size={10} /> UPLOAD DEVICE
                    </button>
                )}
            </div>
            <div style={{ position: 'relative' }}>
                {multiline ? (
                    <textarea value={value} onChange={onChange} name={name} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.2rem', color: '#fff', fontSize: '0.9rem', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', transition: '0.3s' }} />
                ) : (
                    <input type={type} value={value} onChange={onChange} name={name} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem 1rem 1rem 3rem', color: '#fff', fontSize: '0.9rem', transition: '0.3s' }} />
                )}
                {Icon && <Icon style={{ position: 'absolute', left: '1.2rem', top: multiline ? '1.4rem' : '50%', transform: multiline ? 'none' : 'translateY(-50%)', color: 'var(--color-gold)', opacity: 0.4, fontSize: '1rem' }} />}
            </div>
            {onUpload && <input type="file" ref={fileRef} onChange={handleFile} style={{ display: 'none' }} accept="image/*" />}
        </div>
    );
});

const ColorField = React.memo(({ label, value, onChange }) => (
    <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{label}</label>
            <span style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'monospace' }}>{value}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: value || '#000', border: '2px solid #1a1a1a', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                <input type="color" value={value || '#000000'} onChange={onChange} style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer', border: 'none', background: 'none' }} />
            </div>
            <input value={value || ''} onChange={onChange} placeholder="#000000" style={{ flex: 1, padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }} />
        </div>
    </div>
));

const SectionCard = ({ title, icon: Icon, children, actions, style = {} }) => (
    <div style={{
        background: 'rgba(255,255,255,0.01)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '28px',
        padding: '2rem',
        marginBottom: '1.8rem',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        ...style
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '700', margin: 0 }}>
                {Icon && <div style={{ width: '40px', height: '40px', background: 'rgba(201,169,106,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}><Icon size={18} /></div>}
                {title}
            </h4>
            {actions && <div>{actions}</div>}
        </div>
        <div>
            {children}
        </div>
    </div>
);

// --- REFINED PREVIEW COMPONENT ---

const ImgFallback = ({ src, fallback, style, padding = '0px', imgStyle = {} }) => {
    const [failed, setFailed] = React.useState(false);

    // Robust check for valid image data/url
    const isValid = src && (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/') || src.length > 30);

    if (isValid && !failed) {
        return (
            <img
                src={src}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding, ...imgStyle }}
                onError={() => setFailed(true)}
                alt="Asset"
            />
        );
    }
    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
            {fallback}
        </div>
    );
};

// --- SIMPLE PREVIEWS ---

const PaletteSimplePreview = ({ colors }) => (
    <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#0a0a0a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#444', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>Branding Sample</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: colors?.primary }} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: colors?.secondary }} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: colors?.accent }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.8rem' }}>
                <button style={{ background: colors?.primary, color: colors?.background, padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: '800' }}>Primary CTA</button>
            </div>
        </div>
    </div>
);

const TypographySimplePreview = ({ typography, colors }) => (
    <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#0a0a0a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: typography || 'inherit' }}>
        <h2 style={{ color: colors?.primary || '#fff', fontSize: '2rem', fontWeight: '800', margin: '0 0 5px 0', lineHeight: 1 }}>Precision Cleaning</h2>
        <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.4', margin: 0 }}>The absolute standard in automotive restoration using <strong>{typography}</strong>.</p>
    </div>
);

const BrandingOverview = ({ formData }) => (
    <div style={{
        position: 'sticky',
        top: '2rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        padding: '2.5rem',
        borderRadius: '32px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        backdropFilter: 'blur(40px)',
        boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 40px ${formData?.colors?.primary || '#c9a96a'}15`
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ color: '#555', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '3px' }}>Synergy Snapshot</h5>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)', boxShadow: '0 0 10px var(--color-gold)' }} />
        </div>

        {/* IDENTITY PREVIEW */}
        <motion.div whileHover={{ scale: 1.02 }} style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'default' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '16px', background: 'linear-gradient(45deg, rgba(255,255,255,0.05), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ImgFallback
                    src={formData?.logo}
                    padding="5px"
                    fallback={<span style={{ color: 'var(--color-gold)', fontWeight: '900', fontSize: '1.2rem' }}>{formData?.siteName?.charAt(0) || 'M'}</span>}
                />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>{formData?.siteName || 'Unspecified Entity'}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', color: 'var(--color-gold)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>{formData?.tagline || 'SYSTEM STEALTH'}</p>
            </div>
        </motion.div>

        {/* INTERACTIVE PALETTE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem' }}>
            {['primary', 'accent', 'secondary', 'background'].map(c => (
                <motion.div key={c} whileHover={{ y: -5 }} style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        background: formData?.colors?.[c] || '#000',
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        boxShadow: `0 10px 20px rgba(0,0,0,0.3)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)', position: 'absolute' }} />
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.5rem', color: '#444', fontWeight: '900', textTransform: 'uppercase' }}>{c[0]}</p>
                </motion.div>
            ))}
        </div>

        {/* TYPOGRAPHY SPECIMEN */}
        <motion.div whileHover={{ scale: 1.01 }} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-15px', top: '-10px', fontSize: '6rem', fontWeight: '900', color: 'rgba(255,255,255,0.02)', fontFamily: formData?.typography || 'inherit' }}>Aa</div>
            <p style={{ fontFamily: formData?.typography || 'inherit', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.8rem 0', color: formData?.colors?.primary || '#fff', lineHeight: 1, letterSpacing: '-1px' }}>Executive</p>
            <p style={{ fontFamily: formData?.typography || 'inherit', fontSize: '0.85rem', color: '#888', lineHeight: '1.7', margin: 0, maxWidth: '80%' }}>
                Leveraging <strong>{formData?.typography || 'System Default'}</strong> to define market superiority and brand clarity.
            </p>
        </motion.div>

        {/* SEO SUITE */}
        <motion.div whileHover={{ y: -5 }} style={{ background: '#fff', padding: '1.8rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
            {formData?.seo?.ogImage && (
                <div style={{ height: '80px', margin: '-1.8rem -1.8rem 1rem -1.8rem', background: '#000' }}>
                    <img src={formData.seo.ogImage} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #eee' }}>
                    <ImgFallback
                        src={formData?.favicon}
                        padding="4px"
                        fallback={<div style={{ fontSize: '10px', color: 'var(--color-gold)', fontWeight: 'bold' }}>{formData?.siteName?.charAt(0) || '●'}</div>}
                    />
                </div>
                <div>
                    <p style={{ fontSize: '0.85rem', color: '#202124', margin: 0, fontWeight: '400' }}>{formData?.siteName || 'Synergy Web'}</p>
                    <p style={{ fontSize: '0.7rem', color: '#5f6368', margin: 0 }}>https://{formData?.siteName?.toLowerCase().replace(/\s+/g, '') || 'synergy'}.cluster.com</p>
                </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: '10px 0 6px 0', fontWeight: '400', lineHeight: 1.3, color: '#1a0dab', borderBottom: '1px solid transparent' }}>{formData?.seo?.title || formData?.siteName || 'Digital Presence'}</h3>
            <p style={{ fontSize: '0.85rem', color: '#4d5156', margin: '0 0 1rem 0', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {formData?.seo?.description || 'The standard in administrative orchestration and visual dominance. Experience the synergy of precision and performance.'}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                {Object.entries(formData.contact?.socials || {}).filter(([_, url]) => url && url.length > 5).map(([k, v]) => (
                    <div key={k} style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368', fontSize: '10px' }}>
                        {k[0].toUpperCase()}
                    </div>
                ))}
            </div>
        </motion.div>
    </div>
);


// --- REAL-WORLD PREVIEW PANEL ---

const LivePreviewPanel = React.memo(({ previewType, setPreviewType }) => {
    const [deviceMode, setDeviceMode] = useState('laptop');
    const stageRef = useRef(null);
    const [scale, setScale] = useState(1);

    const devices = {
        mobile: { width: 390, height: 844, label: 'Phone', icon: <FiSmartphone />, r: '36px' },
        tablet: { width: 820, height: 1180, label: 'Tablet', icon: <FiTablet />, r: '24px' },
        laptop: { width: 1366, height: 768, label: 'Laptop', icon: <FiMonitor />, r: '16px' }
    };

    useEffect(() => {
        const updateScale = () => {
            if (stageRef.current) {
                const availableWidth = stageRef.current.clientWidth - 10;
                const availableHeight = stageRef.current.clientHeight - 10;
                const deviceWidth = devices[deviceMode].width;
                const deviceHeight = devices[deviceMode].height;

                const scaleW = availableWidth / deviceWidth;
                const scaleH = availableHeight / deviceHeight;

                // Maximize scale to fit container bounds perfectly
                const bestScale = Math.min(scaleW, scaleH, 1);
                setScale(bestScale);
            }
        };
        updateScale();
        const t = setTimeout(updateScale, 200);
        window.addEventListener('resize', updateScale);
        return () => { window.removeEventListener('resize', updateScale); clearTimeout(t); };
    }, [deviceMode, previewType]);

    const urls = { landing: '/', user: '/dashboard', admin: '/admin' };
    const absoluteUrl = `${window.location.origin}${urls[previewType] || '/'}${urls[previewType]?.includes('?') ? '&' : '?'}preview=true`;

    return (
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '1rem', height: 'calc(100vh - 100px)', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase' }}>Preview Engine</span>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {['landing', 'user', 'admin'].map(t => (
                        <button key={t} onClick={() => setPreviewType(t)} style={{ padding: '0.3rem 0.6rem', background: previewType === t ? 'var(--color-gold)' : '#111', color: previewType === t ? '#000' : '#444', border: 'none', borderRadius: '4px', fontSize: '0.55rem', fontWeight: '900' }}>{t.toUpperCase()}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', background: '#0a0a0a', padding: '0.3rem', borderRadius: '12px', gap: '0.2rem' }}>
                {Object.entries(devices).map(([k, d]) => (
                    <button key={k} onClick={() => setDeviceMode(k)} style={{ flex: 1, padding: '0.6rem', background: deviceMode === k ? '#1a1a1a' : 'transparent', color: deviceMode === k ? 'var(--color-gold)' : '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                        {d.icon} <span style={{ fontSize: '0.55rem', fontWeight: '800' }}>{d.label}</span>
                    </button>
                ))}
            </div>

            <div ref={stageRef} style={{ flex: 1, background: '#020202', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                    width: devices[deviceMode].width,
                    height: devices[deviceMode].height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    borderRadius: devices[deviceMode].r,
                    overflow: 'hidden',
                    border: '12px solid #1a1a1a',
                    background: '#fff',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
                    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <iframe key={`${previewType}-${deviceMode}`} src={absoluteUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#0a0a0a', borderRadius: '10px' }}>
                <span style={{ color: '#333', fontSize: '0.6rem', fontWeight: '900' }}>{devices[deviceMode].width} × {devices[deviceMode].height} @ {Math.round(scale * 100)}%</span>
                <button onClick={() => window.open(absoluteUrl, '_blank')} style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer' }}>EXTERNAL <FiExternalLink size={10} /></button>
            </div>
        </div>
    );
});

// --- ADMIN MAIN ---

const AdminContent = () => {
    const { settings, updateSettings, liveUpdateSettings } = useData();
    const [formData, setFormData] = useState(settings);
    const [activeTab, setActiveTab] = useState('branding');
    const [activeSubTab, setActiveSubTab] = useState('identity');
    const [previewType, setPreviewType] = useState('landing');
    const [isDirty, setIsDirty] = useState(false);
    const [notification, setNotification] = useState('');
    const [editingDoc, setEditingDoc] = useState(null);
    const [modalConfig, setModalConfig] = useState(null); // { type: 'confirm'|'prompt', title, message, onConfirm, placeholder }

    // Sync from settings ONLY if we are not currently editing (to avoid feedback loop resetting cursor/input)
    useEffect(() => {
        if (settings && !isDirty) {
            setFormData(settings);
        }
    }, [settings, isDirty]);

    // REMOVED: Aggressive live sync that was causing conflicts
    // Settings now only update on explicit save via handleSave

    const handleSave = async () => {
        try {
            await updateSettings(prev => ({
                ...prev,
                siteName: formData.siteName,
                tagline: formData.tagline,
                description: formData.description,
                logo: formData.logo,
                favicon: formData.favicon,
                legalText: formData.legalText,
                showLegal: formData.showLegal,
                colors: formData.colors,
                typography: formData.typography,
                contact: formData.contact,
                seo: formData.seo
            }));
            setIsDirty(false);
            setNotification('Cluster Config Synced');
            setTimeout(() => setNotification(''), 3000);
        } catch (e) {
            setNotification('Error syncing config');
        }
    };


    const handleSubChange = (s, k, v, autoSave = false) => {
        setFormData(p => {
            const next = { ...p, [s]: { ...p[s], [k]: v } };
            if (autoSave) {
                // Use functional update pattern to avoid overwriting other settings
                updateSettings(prev => ({ ...prev, [s]: { ...prev[s], [k]: v } }));
            }
            return next;
        });
        setIsDirty(!autoSave);
    };


    const handleSocialChange = (k, v) => {
        setFormData(p => ({
            ...p,
            contact: {
                ...p.contact,
                socials: { ...p.contact?.socials, [k]: v }
            }
        }));
        setIsDirty(true);
    };

    const deleteSocial = (k) => {
        setFormData(p => {
            const nextSocials = { ...p.contact?.socials };
            delete nextSocials[k];
            return {
                ...p,
                contact: {
                    ...p.contact,
                    socials: nextSocials
                }
            };
        });
        setIsDirty(true);
    };

    const nav = {
        branding: { id: 'identity', label: 'Global Persona', icon: FiGlobe },
        contacts: { id: 'comms', label: 'Communications', icon: FiMessageSquare },
        assets: { id: 'media', label: 'Media Vault', icon: FiImage },
        legal: { id: 'legal', label: 'Legal Framework', icon: FiShield },
        simulation: { id: 'preview', label: 'Simulation Lab', icon: FiMonitor }
    };

    useEffect(() => {
        if (nav[activeTab]) setActiveSubTab(nav[activeTab].id);
    }, [activeTab]);

    return (
        <div style={{ maxWidth: '1750px', margin: '0 auto', padding: '2rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                position: 'sticky',
                top: 0,
                background: 'rgba(var(--color-black-rgb), 0.8)',
                backdropFilter: 'blur(20px)',
                zIndex: 100,
                padding: '1.5rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-1px' }}>Cluster <span style={{ color: 'var(--color-gold)' }}>Synergy</span></h1>
                    {notification && <p style={{ color: '#4caf50', fontSize: '0.8rem', margin: 0 }}>{notification}</p>}
                </div>
                <button onClick={handleSave} style={{ background: isDirty ? 'var(--color-gold)' : '#1a1a1a', padding: '0.8rem 2.4rem', borderRadius: '12px', color: isDirty ? '#000' : '#555', border: 'none', cursor: 'pointer', fontWeight: '900', boxShadow: isDirty ? '0 0 30px rgba(201,169,106,0.3)' : 'none', transition: '0.3s' }}>{isDirty ? 'DEPLOY CONFIG' : 'SYNCHRONIZED'}</button>
            </header>

            <div style={{ display: 'flex', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '20px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                {Object.entries(nav).map(([t, info]) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        style={{
                            flex: 1,
                            padding: '1.2rem',
                            background: activeTab === t ? 'rgba(201,169,106,0.15)' : 'transparent',
                            color: activeTab === t ? '#fff' : '#555',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '1px',
                            fontSize: '0.8rem',
                            boxShadow: activeTab === t ? '0 10px 25px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        <info.icon size={18} style={{ color: activeTab === t ? 'var(--color-gold)' : 'inherit' }} />
                        {info.label}
                    </button>
                ))}
            </div>

            <div style={{ minHeight: 'calc(100vh - 250px)' }}>
                {activeTab === 'simulation' ? (
                    <motion.div key="sim-lab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <LivePreviewPanel previewType={previewType} setPreviewType={setPreviewType} />
                    </motion.div>
                ) : (
                    <div style={{ maxWidth: activeTab === 'branding' ? '1450px' : '1000px', margin: '0 auto', transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '32px', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(40px)' }}>
                            <AnimatePresence mode="wait">
                                {/* BRANDING: IDENTITY & SEO */}
                                {activeSubTab === 'identity' && (
                                    <motion.div key="identity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', damping: 20 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '3rem', alignItems: 'start' }}>
                                        <div>
                                            <SectionCard title="System Identity" icon={FiLayout}>
                                                <InputField label="Site Name" value={formData?.siteName} onChange={e => { setFormData(prev => ({ ...prev, siteName: e.target.value })); setIsDirty(true); }} placeholder="e.g. Precision Cleaning" />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                                                    {/* LOGO ASSET */}
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <label style={{ display: 'block', color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>Principal Logo</label>
                                                        <div style={{ height: '120px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(var(--color-black-rgb), 0.4)', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                            <ImgFallback
                                                                src={formData?.logo}
                                                                padding="10px"
                                                                fallback={<div style={{ color: 'var(--color-gold)', fontSize: '2.5rem', fontWeight: '900', textShadow: '0 0 20px rgba(201,169,106,0.2)' }}>{formData?.logo?.length < 5 ? formData.logo : (formData?.siteName?.charAt(0) || 'M')}</div>}
                                                            />
                                                            <button
                                                                onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = () => { const val = r.result; setFormData(prev => ({ ...prev, logo: val })); setIsDirty(true); }; r.readAsDataURL(f); } }; i.click(); }}
                                                                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--color-gold)', color: '#000', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                                                            >
                                                                <FiUpload size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* FAVICON ASSET */}
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <label style={{ display: 'block', color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>Favicon Marker</label>
                                                        <div style={{ height: '120px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(var(--color-black-rgb), 0.4)', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                            <ImgFallback
                                                                src={formData?.favicon}
                                                                padding="30px"
                                                                fallback={<div style={{ color: 'var(--color-gold)', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(201,169,106,0.2)' }}>{formData?.favicon?.length < 5 ? formData.favicon : '●'}</div>}
                                                            />
                                                            <button
                                                                onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = () => { const val = r.result; setFormData(prev => ({ ...prev, favicon: val })); setIsDirty(true); }; r.readAsDataURL(f); } }; i.click(); }}
                                                                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--color-gold)', color: '#000', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                                                            >
                                                                <FiUpload size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <InputField label="Tagline" value={formData?.tagline} onChange={e => { setFormData(prev => ({ ...prev, tagline: e.target.value })); setIsDirty(true); }} placeholder="The Gold Standard" />
                                                <InputField label="Description" value={formData?.description} onChange={e => { setFormData(prev => ({ ...prev, description: e.target.value })); setIsDirty(true); }} placeholder="Core business value proposition..." multiline />
                                            </SectionCard>

                                            <SectionCard title="Visual Engine" icon={FiDroplet}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <ColorField label="Primary" value={formData?.colors?.primary} onChange={e => handleSubChange('colors', 'primary', e.target.value)} />
                                                    <ColorField label="Accent" value={formData?.colors?.accent} onChange={e => handleSubChange('colors', 'accent', e.target.value)} />
                                                    <ColorField label="Secondary" value={formData?.colors?.secondary} onChange={e => handleSubChange('colors', 'secondary', e.target.value)} />
                                                    <ColorField label="Background" value={formData?.colors?.background} onChange={e => handleSubChange('colors', 'background', e.target.value)} />
                                                </div>
                                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                                                    <div style={{ flex: 1 }}><PaletteSimplePreview colors={formData?.colors} /></div>
                                                    <div style={{ flex: 1.5 }}><TypographySimplePreview typography={formData?.typography} colors={formData?.colors} /></div>
                                                </div>
                                            </SectionCard>

                                            <SectionCard title="Typography Engine" icon={FiType}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', background: 'rgba(var(--color-black-rgb), 0.3)', padding: '1.2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                    {GOOGLE_FONTS.map(f => (
                                                        <button key={f} onClick={() => { const next = { ...formData, typography: f }; setFormData(next); updateSettings(next); setIsDirty(false); }} style={{ padding: '0.6rem', background: formData?.typography === f ? 'rgba(201,169,106,0.1)' : 'transparent', color: formData?.typography === f ? 'var(--color-gold)' : '#444', border: '1px solid ' + (formData?.typography === f ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)'), borderRadius: '10px', fontSize: '0.75rem', fontFamily: f, cursor: 'pointer', transition: '0.2s' }}>{f}</button>
                                                    ))}
                                                </div>
                                            </SectionCard>

                                            <SectionCard title="SEO Mastery" icon={FiGlobe}>
                                                <InputField label="Meta Title" value={formData?.seo?.title} onChange={e => handleSubChange('seo', 'title', e.target.value)} />
                                                <InputField label="Meta Description" value={formData?.seo?.description} onChange={e => handleSubChange('seo', 'description', e.target.value)} multiline />

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                                                    {/* SEO BRAND LOGO REF */}
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <label style={{ display: 'block', color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>SEO Branding Reference</label>
                                                        <div style={{ height: '100px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(var(--color-black-rgb), 0.4)', position: 'relative', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                                                            <ImgFallback
                                                                src={formData?.logo}
                                                                fallback={<div style={{ color: 'var(--color-gold)', fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(201,169,106,0.3)' }}>{formData?.siteName?.charAt(0) || 'M'}</div>}
                                                            />
                                                        </div>
                                                    </div>
                                                    streams
                                                    {/* SEO SOCIAL IMAGE */}
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <label style={{ display: 'block', color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>Social Sharing (OG:Image)</label>
                                                        <div style={{ height: '100px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(var(--color-black-rgb), 0.4)', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                            <ImgFallback
                                                                src={formData?.seo?.ogImage}
                                                                imgStyle={{ objectFit: 'cover' }}
                                                                fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222' }}><FiImage size={30} /></div>}
                                                            />
                                                            <button
                                                                onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = () => { const val = r.result; setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogImage: val } })); setIsDirty(true); }; r.readAsDataURL(f); } }; i.click(); }}
                                                                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--color-gold)', color: '#000', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                                                            >
                                                                <FiUpload size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    streams                                                </div>
                                            </SectionCard>
                                        </div>
                                        <div>
                                            <BrandingOverview formData={formData} />
                                        </div>
                                    </motion.div>
                                )}


                                {/* ENGAGEMENT: COMMS */}
                                {activeSubTab === 'comms' && (
                                    <motion.div key="comms" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 25 }}>
                                        <SectionCard title="Direct Support" icon={FiPhone}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <InputField label="Phone" value={formData.contact?.phone} onChange={e => handleSubChange('contact', 'phone', e.target.value)} icon={FiPhone} />
                                                <InputField label="Email" value={formData.contact?.email} onChange={e => handleSubChange('contact', 'email', e.target.value)} icon={FiMail} />
                                            </div>
                                            <InputField label="Hours" value={formData.contact?.hours} onChange={e => handleSubChange('contact', 'hours', e.target.value)} icon={FiClock} />
                                        </SectionCard>
                                        <SectionCard title="Physical Base" icon={FiMapPin}>
                                            <InputField label="Address" value={formData.contact?.address} onChange={e => handleSubChange('contact', 'address', e.target.value)} multiline icon={FiMapPin} />
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                                <div style={{ flex: 1 }}><InputField label="Google Maps Link" value={formData.contact?.googleMapLink} onChange={e => handleSubChange('contact', 'googleMapLink', e.target.value)} icon={FiLink} /></div>
                                                <button onClick={() => window.open('https://www.google.com/maps', '_blank')} style={{ marginBottom: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', color: 'var(--color-gold)', cursor: 'pointer' }} title="Find on Maps"><FiMapPin size={16} /></button>
                                            </div>
                                        </SectionCard>
                                        <SectionCard title="Social Architecture" icon={FiLayers} actions={<button onClick={() => {
                                            setModalConfig({
                                                type: 'social-add',
                                                title: 'Integrate Platform',
                                                message: 'Select the social architecture to synchronize.',
                                                onConfirm: (platform, url) => {
                                                    if (platform && url) handleSocialChange(platform, url);
                                                    setModalConfig(null);
                                                }
                                            });
                                        }} style={{ background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', transition: '0.3s' }}>+ ADD NETWORK</button>}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                                {Object.entries(formData.contact?.socials || {}).map(([k, v]) => (
                                                    <motion.div key={k} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                                                            {k.toLowerCase().includes('instagram') && <FiInstagram size={22} />}
                                                            {k.toLowerCase().includes('facebook') && <FiFacebook size={22} />}
                                                            {k.toLowerCase().includes('twitter') && <FiTwitter size={22} />}
                                                            {k.toLowerCase().includes('linkedin') && <FiLinkedin size={22} />}
                                                            {k.toLowerCase().includes('youtube') && <FiYoutube size={22} />}
                                                            {k.toLowerCase().includes('whatsapp') && <FiGithub size={22} />}
                                                            {!['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'whatsapp'].some(x => k.toLowerCase().includes(x)) && <FiLink size={20} color="#333" />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{k}</p>
                                                            <input value={v} onChange={(e) => handleSocialChange(k, e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none', padding: '4px 0', fontWeight: '500' }} placeholder="Connect URL..." />
                                                        </div>
                                                        <button onClick={() => deleteSocial(k)} style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: 'none', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' }} className="social-del-btn"><FiTrash2 size={16} /></button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {/* ENGAGEMENT: PRESENCE */}
                                {activeSubTab === 'presence' && (
                                    <motion.div key="presence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <SectionCard title="Physical Presence" icon={FiMapPin}>
                                            <InputField label="Address" value={formData.contact?.address} onChange={e => handleSubChange('contact', 'address', e.target.value)} multiline />
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                                <div style={{ flex: 1 }}><InputField label="Google Maps Link" value={formData.contact?.googleMapLink} onChange={e => handleSubChange('contact', 'googleMapLink', e.target.value)} icon={FiLink} /></div>
                                                <button onClick={() => window.open('https://www.google.com/maps', '_blank')} style={{ marginBottom: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', color: 'var(--color-gold)', cursor: 'pointer' }} title="Find on Maps"><FiMapPin size={16} /></button>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {/* ASSETS: MEDIA */}
                                {activeSubTab === 'media' && (
                                    <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <SectionCard title="Landing Asset Registry" icon={FiImage}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                {[
                                                    { k: 'hero', l: 'Hero Interface' },
                                                    { k: 'about', l: 'About Context' },
                                                    { k: 'membership', l: 'Member Portal' },
                                                    { k: 'contact', l: 'Support Hub' }
                                                ].map(img => (
                                                    <div key={img.k} style={{ position: 'relative', background: '#080808', padding: '1.2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>{img.l}</label>
                                                        <div style={{ height: '150px', borderRadius: '16px', overflow: 'hidden', background: '#000', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            {formData.landingImages?.[img.k] ? (
                                                                <img src={formData.landingImages[img.k]} alt={img.l} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                                                            ) : (
                                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222' }}><FiImage size={40} /></div>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    const i = document.createElement('input');
                                                                    i.type = 'file';
                                                                    i.accept = 'image/*';
                                                                    i.onchange = (e) => {
                                                                        const f = e.target.files[0];
                                                                        if (f) { const r = new FileReader(); r.onload = () => handleSubChange('landingImages', img.k, r.result, true); r.readAsDataURL(f); }
                                                                    };
                                                                    i.click();
                                                                }}
                                                                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--color-gold)', color: '#000', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', transition: '0.3s' }}
                                                                title="Switch Asset"
                                                            >
                                                                <FiUpload size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                        <SectionCard title="Executive Experience" icon={FiMonitor}>
                                            <div style={{ position: 'relative', background: '#080808', padding: '1.2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>Overview Banner</label>
                                                <div style={{ height: '220px', borderRadius: '16px', overflow: 'hidden', background: '#000', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {formData.dashboardImages?.hero ? (
                                                        <img src={formData.dashboardImages.hero} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                                                    ) : (
                                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222' }}><FiMonitor size={60} /></div>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const i = document.createElement('input');
                                                            i.type = 'file';
                                                            i.accept = 'image/*';
                                                            i.onchange = (e) => {
                                                                const f = e.target.files[0];
                                                                if (f) { const r = new FileReader(); r.onload = () => handleSubChange('dashboardImages', 'hero', r.result, true); r.readAsDataURL(f); }
                                                            };
                                                            i.click();
                                                        }}
                                                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--color-gold)', color: '#000', border: 'none', width: '55px', height: '55px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', transition: '0.3s' }}
                                                        title="Switch Banner"
                                                    >
                                                        <FiUpload size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {/* ASSETS: LEGAL */}
                                {activeSubTab === 'legal' && (
                                    <motion.div key="legal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <SectionCard title="Global Legal Settings" icon={FiShield}>
                                            <InputField label="Copyright Text" value={formData?.legalText} onChange={e => { setFormData(prev => ({ ...prev, legalText: e.target.value })); setIsDirty(true); }} placeholder="© 2026 Synergy" />
                                            <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <ToggleSwitch checked={formData?.showLegal} onChange={e => { setFormData(prev => ({ ...prev, showLegal: e.target.checked })); setIsDirty(true); }} id="legal_toggle" label="Show legal links in footer" />
                                            </div>
                                        </SectionCard>
                                        <SectionCard title="Managed Policies" icon={FiFileText} actions={<button onClick={() => setEditingDoc({ id: 'doc-' + Date.now(), name: '', content: '' })} style={{ background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer' }}>+ NEW POLICY</button>}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {formData.documents?.map(doc => (
                                                    <motion.div whileHover={{ y: -5 }} key={doc.id} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                                                        <h5 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{doc.name || 'Untitled Policy'}</h5>
                                                        <div style={{ color: '#666', fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Last Updated: {doc.date || 'N/A'}</div>
                                                        <button onClick={() => setEditingDoc(doc)} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: '0.3s' }}><FiEdit2 size={13} /> Manage Document</button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}
                                {/* Fallback */}
                                {!['identity', 'visuals', 'comms', 'presence', 'media', 'legal'].includes(activeSubTab) && (
                                    <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <SectionCard title={activeSubTab.toUpperCase()}>
                                            <p style={{ color: '#444' }}>Module fully integrated into the synergy stack.</p>
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* POLICY EDITOR MODAL */}
            <AnimatePresence>
                {editingDoc && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '32px', width: '100%', maxWidth: '800px', padding: '3rem', position: 'relative' }}>
                            <button onClick={() => setEditingDoc(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><FiX size={24} /></button>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><FiFileText style={{ color: 'var(--color-gold)' }} /> Policy Editor</h2>

                            <InputField label="Document Title" value={editingDoc.name} onChange={e => setEditingDoc({ ...editingDoc, name: e.target.value })} placeholder="e.g. Terms of Service" />
                            <InputField label="Content" value={editingDoc.content} onChange={e => setEditingDoc({ ...editingDoc, content: e.target.value })} multiline placeholder="Markdown or plain text content..." />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {[
                                    { k: 'showOnLogin', l: 'Display on Login' },
                                    { k: 'showOnSignup', l: 'Display on Signup' },
                                    { k: 'showOnFooter', l: 'Display on Footer' }
                                ].map(x => (
                                    <ToggleSwitch key={x.k} checked={editingDoc[x.k]} onChange={e => setEditingDoc({ ...editingDoc, [x.k]: e.target.checked })} id={`p_vis_${x.k}`} label={x.l} />
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => {
                                    const docs = formData.documents || [];
                                    const updatedDoc = {
                                        ...editingDoc,
                                        date: new Date().toLocaleString([], {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })
                                    };
                                    const index = docs.findIndex(d => d.id === editingDoc.id);
                                    let newDocs;
                                    if (index >= 0) {
                                        newDocs = [...docs];
                                        newDocs[index] = updatedDoc;
                                    } else {
                                        newDocs = [...docs, updatedDoc];
                                    }
                                    setFormData({ ...formData, documents: newDocs });
                                    setIsDirty(true);
                                    setEditingDoc(null);
                                }} style={{ flex: 1.2, padding: '1.2rem', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' }}>Save Changes</button>

                                <button onClick={() => {
                                    const captureId = editingDoc.id;
                                    setEditingDoc(null); // Eliminate the editor's dark overlay first
                                    setTimeout(() => {
                                        setModalConfig({
                                            type: 'confirm',
                                            title: 'Terminate Policy',
                                            message: 'Are you sure you want to permanently erase this document? This action cannot be undone.',
                                            onConfirm: () => {
                                                setFormData(prev => {
                                                    const filtered = (prev.documents || []).filter(d => String(d.id) !== String(captureId));
                                                    return { ...prev, documents: filtered };
                                                });
                                                setIsDirty(true);
                                                setModalConfig(null);
                                            }
                                        });
                                    }, 100); // Slight delay for smooth AnimatePresence exit
                                }} style={{ flex: 1, padding: '1.2rem', background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)', transition: '0.3s' }}>Delete Policy</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* SYNERGY ACTION MODAL */}
            <AnimatePresence>
                {modalConfig && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', width: '450px', padding: '2.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {modalConfig.type === 'confirm' ? <FiAlertTriangle style={{ color: '#ff4444' }} /> : <FiPlus style={{ color: 'var(--color-gold)' }} />}
                                {modalConfig.title}
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>{modalConfig.message}</p>

                            {modalConfig.type === 'prompt' && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <input autoFocus id="synergy_prompt" placeholder={modalConfig.placeholder} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                                </div>
                            )}

                            {modalConfig.type === 'social-add' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <select id="synergy_social_platform" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', appearance: 'none' }}>
                                        {['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 'WhatsApp', 'Threads', 'Snapchat'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <input id="synergy_social_url" placeholder="https://..." style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => {
                                    if (modalConfig.type === 'prompt') {
                                        const val = document.getElementById('synergy_prompt')?.value;
                                        modalConfig.onConfirm(val);
                                    } else if (modalConfig.type === 'social-add') {
                                        const p = document.getElementById('synergy_social_platform')?.value;
                                        const u = document.getElementById('synergy_social_url')?.value;
                                        modalConfig.onConfirm(p, u);
                                    } else {
                                        modalConfig.onConfirm();
                                    }
                                }} style={{ flex: 1, padding: '1rem', background: modalConfig.type === 'confirm' ? '#ff4444' : 'var(--color-gold)', color: modalConfig.type === 'confirm' ? '#fff' : '#000', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' }}>
                                    {modalConfig.type === 'confirm' ? 'CONFIRM TERMINATION' : 'CONTINUE'}
                                </button>
                                <button onClick={() => setModalConfig(null)} style={{ flex: 0.8, padding: '1rem', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>CANCEL</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminContent;
