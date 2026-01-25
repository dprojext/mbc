import React, { useState, useEffect, useRef } from 'react';
import { useData, DataContext } from '../../context/DataContext';
import { FiLayout, FiGlobe, FiShield, FiFileText, FiTrash2, FiPlus, FiCheck, FiActivity, FiImage, FiUpload, FiLink, FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiPhone, FiMail, FiClock, FiMapPin, FiFile, FiEdit2, FiEye, FiEyeOff, FiBold, FiItalic, FiType, FiX } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Services from '../../components/Services';
import About from '../../components/About';
import Membership from '../../components/Membership';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';

const AdminContent = () => {
    const contextData = useData();
    const { settings, updateSettings } = contextData;

    // Local state for form editing and preview
    const [formData, setFormData] = useState(settings);
    const [activeTab, setActiveTab] = useState('branding');
    const [isDirty, setIsDirty] = useState(false);
    const [notification, setNotification] = useState('');
    const fileInputRef = useRef(null);
    const docInputRef = useRef(null);

    // Document Editor State
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const editorRef = useRef(null);

    // Sync if settings change externally
    useEffect(() => {
        if (settings && !isDirty) {
            setFormData(settings);
        }
    }, [settings, isDirty]);

    // Track unsaved changes
    const markDirty = () => setIsDirty(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        markDirty();
    };

    const handleColorChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }));
        markDirty();
    };

    const handleSeoChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            seo: { ...prev.seo, [key]: value }
        }));
        markDirty();
    };

    const handleImageChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            landingImages: { ...prev.landingImages, [key]: value }
        }));
        markDirty();
    };

    const handleContactChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            contact: { ...prev.contact, [key]: value }
        }));
        markDirty();
    };

    const handleSocialChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            contact: {
                ...prev.contact,
                socials: { ...prev.contact.socials, [key]: value }
            }
        }));
        markDirty();
    };

    const handleSave = async () => {
        try {
            await updateSettings(formData);
            setIsDirty(false);
            setNotification('Settings saved successfully!');
            setTimeout(() => setNotification(''), 4000);
        } catch (error) {
            setNotification('Error saving settings.');
            console.error(error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
                markDirty();
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    // --- DOCUMENT LOGIC ---
    const openDocEditor = (doc = null) => {
        if (doc) {
            setEditingDoc({ ...doc });
        } else {
            setEditingDoc({
                id: Date.now(),
                name: 'New Legal Document',
                content: '<p>Start writing your policy here...</p>',
                showInFooter: false,
                showInLogin: false,
                date: new Date().toLocaleDateString()
            });
        }
        setIsDocModalOpen(true);
    };

    // FIX: Optimized saveDocument to ensure it updates context and doesn't "disappear"
    const saveDocument = () => {
        const content = editorRef.current.innerHTML;
        const finalDoc = { ...editingDoc, content };

        const nextDocs = [...(formData.documents || [])];
        const existingIdx = nextDocs.findIndex(d => d.id === finalDoc.id);

        if (existingIdx >= 0) {
            nextDocs[existingIdx] = finalDoc;
        } else {
            nextDocs.push(finalDoc);
        }

        const updatedData = { ...formData, documents: nextDocs };
        setFormData(updatedData);

        // Immediate save to context for documents to prevent loss
        updateSettings(updatedData);

        setIsDocModalOpen(false);
        setEditingDoc(null);
        setIsDirty(false); // Reset dirty because we saved
        setNotification('Document saved successfully!');
        setTimeout(() => setNotification(''), 3000);
    };

    const toggleDocVisibility = (id, field) => {
        const nextDocs = formData.documents.map(d =>
            d.id === id ? { ...d, [field]: !d[field] } : d
        );
        const updatedData = { ...formData, documents: nextDocs };
        setFormData(updatedData);
        updateSettings(updatedData); // Immediate save
        setIsDirty(false);
    };

    const removeDoc = (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            const nextDocs = formData.documents.filter(d => d.id !== id);
            const updatedData = { ...formData, documents: nextDocs };
            setFormData(updatedData);
            updateSettings(updatedData); // Immediate save
            setIsDirty(false);
        }
    };

    const execCmd = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
        editorRef.current.focus();
    };

    const isImageLogo = (str) => {
        return str && (str.startsWith('data:') || str.startsWith('http') || str.startsWith('/'));
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        background: '#111',
        border: '1px solid #333',
        color: '#fff',
        borderRadius: '8px',
        outline: 'none',
        fontSize: '0.95rem',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', margin: 0, color: '#fff', fontSize: '2rem' }}>Site Management</h1>
                    <p style={{ color: '#999', marginTop: '0.5rem' }}>Full control over your platform's appearance and behavior</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {notification && (
                        <span style={{ color: '#4caf50', fontSize: '0.9rem' }}>{notification}</span>
                    )}
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        style={{
                            padding: '0.8rem 2rem',
                            background: isDirty ? 'var(--color-gold)' : '#222',
                            color: isDirty ? '#000' : '#666',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: '600',
                            cursor: isDirty ? 'pointer' : 'default'
                        }}
                    >
                        {isDirty ? 'SAVE CHANGES' : 'SETTINGS SAVED'}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid #333' }}>
                {[
                    { id: 'branding', label: 'Branding & Identity', icon: <FiLayout /> },
                    { id: 'landing', label: 'Landing Page Management', icon: <FiGlobe /> },
                    { id: 'legal', label: 'Legality & Documentation', icon: <FiShield /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '1rem 0',
                            background: 'none',
                            border: 'none',
                            color: activeTab === tab.id ? formData.colors.primary : '#666',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            position: 'relative'
                        }}
                    >
                        {tab.icon} {tab.label}
                        {activeTab === tab.id && (
                            <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', background: formData.colors.primary }}></div>
                        )}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'legal' ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '2rem', alignItems: 'start' }}>
                {/* LEFT COLUMN: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {activeTab === 'branding' && (
                        <>
                            <Section title="Visual Identity">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <ColorInput label="Primary" color={formData.colors.primary} onChange={(c) => handleColorChange('primary', c)} desc="Brand Color" />
                                    <ColorInput label="Secondary" color={formData.colors.secondary} onChange={(c) => handleColorChange('secondary', c)} desc="Background" />
                                    <ColorInput label="Accent" color={formData.colors.accent} onChange={(c) => handleColorChange('accent', c)} desc="Highlights" />
                                </div>
                            </Section>

                            <Section title="Typography">
                                <select name="typography" value={formData.typography} onChange={handleChange} style={inputStyle}>
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Outfit">Outfit</option>
                                    <option value="Cinzel">Cinzel</option>
                                </select>
                            </Section>

                            <Section title="Logo & Branding">
                                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '60px', height: '60px', background: '#222', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isImageLogo(formData.logo) ? <img src={formData.logo} style={{ width: '100%' }} /> : formData.logo}
                                        </div>
                                        <button onClick={triggerFileUpload} style={{ background: '#333', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Change Logo</button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                                    </div>
                                    <input placeholder="Logo Text or URL" name="logo" value={formData.logo} onChange={handleChange} style={inputStyle} />
                                </div>
                            </Section>
                        </>
                    )}

                    {activeTab === 'landing' && (
                        <>
                            <Section title="Media & Visuals">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <ImageInput label="Hero Visual" value={formData.landingImages?.hero} onChange={(v) => handleImageChange('hero', v)} desc="Main background/visual" />
                                    <ImageInput label="About Image" value={formData.landingImages?.about} onChange={(v) => handleImageChange('about', v)} desc="Secondary story visual" />
                                    <ImageInput label="Membership BG" value={formData.landingImages?.membership} onChange={(v) => handleImageChange('membership', v)} desc="Pricing section context" />
                                    <ImageInput label="Contact Section" value={formData.landingImages?.contact} onChange={(v) => handleImageChange('contact', v)} desc="Map fallback/context" />
                                </div>
                            </Section>

                            <Section title="Service Area & Map">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input placeholder="Area Name (e.g. Addis Ababa)" value={formData.contact?.address || ''} onChange={(e) => handleContactChange('address', e.target.value)} style={inputStyle} />
                                    <input placeholder="Google Maps iFrame URL" value={formData.contact?.googleMapLink || ''} onChange={(e) => handleContactChange('googleMapLink', e.target.value)} style={inputStyle} />
                                </div>
                            </Section>

                            <Section title="Contact MBC Management">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(var(--color-gold-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                                                <FiPhone />
                                            </div>
                                            <input
                                                placeholder="+251 900 000 000"
                                                value={formData.contact?.phone || ''}
                                                onChange={(e) => handleContactChange('phone', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(var(--color-gold-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                                                <FiMail />
                                            </div>
                                            <input
                                                placeholder="care@metroblackline.com"
                                                value={formData.contact?.email || ''}
                                                onChange={(e) => handleContactChange('email', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Hours</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(var(--color-gold-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                                                <FiClock />
                                            </div>
                                            <input
                                                placeholder="Mon - Sun: 7AM - 8PM"
                                                value={formData.contact?.hours || ''}
                                                onChange={(e) => handleContactChange('hours', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Section>



                        </>
                    )}

                    {activeTab === 'legal' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <Section title="Legal Strategy & Tools">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                                    <div>
                                        <label style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Global Copyright Text</label>
                                        <input name="legalText" value={formData.legalText} onChange={handleChange} style={inputStyle} />

                                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                                                <h4 style={{ color: formData.colors.primary, marginBottom: '0.5rem' }}>New Document</h4>
                                                <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Draft yours Privacy Policy, Terms of Service, or any legal agreement.</p>
                                                <button
                                                    onClick={() => openDocEditor()}
                                                    className="btn btn-primary"
                                                    style={{ width: '100%', borderRadius: '8px' }}
                                                >
                                                    <FiPlus /> CREATE NEW DOCUMENT
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiFileText /> ACTIVE DOCUMENTS
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {(formData.documents || []).map(doc => (
                                                <div key={doc.id} style={{ padding: '1rem', background: '#111', borderRadius: '10px', border: '1px solid #222' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                        <div>
                                                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{doc.name}</div>
                                                            <div style={{ color: '#555', fontSize: '0.75rem' }}>Updated: {doc.date}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => openDocEditor(doc)} style={{ background: '#222', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}><FiEdit2 /></button>
                                                            <button onClick={() => removeDoc(doc.id)} style={{ background: '#222', color: '#ff4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}><FiTrash2 /></button>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.8rem', borderTop: '1px solid #222' }}>
                                                        <button
                                                            onClick={() => toggleDocVisibility(doc.id, 'showInFooter')}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                                color: doc.showInFooter ? formData.colors.primary : '#444', fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {doc.showInFooter ? <FiEye /> : <FiEyeOff />} Footer
                                                        </button>
                                                        <button
                                                            onClick={() => toggleDocVisibility(doc.id, 'showInLogin')}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                                color: doc.showInLogin ? formData.colors.primary : '#444', fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {doc.showInLogin ? <FiEye /> : <FiEyeOff />} Login
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!formData.documents || formData.documents.length === 0) && (
                                                <div style={{ textAlign: 'center', padding: '3rem', color: '#333' }}>No formal documents created yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}
                </div>

                {/* --- DOCUMENT EDITOR MODAL --- */}
                {isDocModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <div style={{ width: '100%', maxWidth: '900px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <input
                                    value={editingDoc.name}
                                    onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', fontFamily: 'var(--font-heading)', width: '70%', outline: 'none' }}
                                    placeholder="Document Title"
                                />
                                <button onClick={() => setIsDocModalOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><FiX size={24} /></button>
                            </div>

                            {/* TOOLBAR */}
                            <div style={{ padding: '0.8rem 1.5rem', background: '#111', borderBottom: '1px solid #222', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => execCmd('bold')} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}><FiBold /></button>
                                <button onClick={() => execCmd('italic')} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}><FiItalic /></button>
                                <button onClick={() => execCmd('formatBlock', 'h3')} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}><FiType /></button>
                                <div style={{ width: '1px', height: '30px', background: '#333' }}></div>
                                <button onClick={() => execCmd('insertUnorderedList')} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>• List</button>
                            </div>

                            {/* WRITER */}
                            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    dangerouslySetInnerHTML={{ __html: editingDoc.content }}
                                    style={{
                                        minHeight: '400px',
                                        color: '#ccc',
                                        lineHeight: '1.8',
                                        outline: 'none',
                                        fontSize: '1.1rem'
                                    }}
                                />
                            </div>

                            <div style={{ padding: '1.5rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setIsDocModalOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Cancel</button>
                                <button
                                    onClick={saveDocument}
                                    className="btn btn-primary"
                                    style={{ padding: '0.8rem 2rem', borderRadius: '8px' }}
                                >
                                    SAVE DOCUMENT
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RIGHT COLUMN: Real-Time Preview */}
                {(activeTab !== 'legal' && !isDocModalOpen) && (
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{ background: '#2d2d2d', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }}></div>
                            </div>
                            <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '6px', padding: '0.3rem 1rem', fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                {isImageLogo(formData.logo) ? (
                                    <img src={formData.logo} alt="Favicon" style={{ width: '12px', height: '12px' }} />
                                ) : <span>{formData.logo}</span>}
                                <span>{formData.siteName}</span>
                            </div>
                        </div>

                        <div style={{
                            background: '#000',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px',
                            border: '1px solid #333',
                            height: '700px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <DataContext.Provider value={{ ...contextData, settings: formData }}>
                                <div style={{
                                    width: '250%', // Zoom level compensation (1 / 0.4)
                                    height: '250%',
                                    transform: 'scale(0.4)',
                                    transformOrigin: 'top left',
                                    background: formData.colors.secondary,
                                    fontFamily: formData.typography,
                                    overflowY: 'auto'
                                }}>
                                    <Navbar />
                                    <Hero />
                                    <Services />
                                    <About />
                                    <Membership />
                                    <Contact />
                                    <Footer />
                                </div>
                            </DataContext.Provider>
                        </div>

                        {/* SEO & Social Sections Under Preview */}
                        {activeTab === 'landing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <Section title="Global SEO & Strategy">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input placeholder="Meta Title" value={formData.seo?.title || ''} onChange={(e) => handleSeoChange('title', e.target.value)} style={inputStyle} />
                                        <textarea placeholder="Meta Description" value={formData.seo?.description || ''} onChange={(e) => handleSeoChange('description', e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
                                    </div>
                                </Section>

                                <Section title="Social Connectivity">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input placeholder="Instagram" value={formData.contact?.socials?.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} style={inputStyle} />
                                        <input placeholder="Facebook" value={formData.contact?.socials?.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} style={inputStyle} />
                                        <input placeholder="Twitter" value={formData.contact?.socials?.twitter || ''} onChange={(e) => handleSocialChange('twitter', e.target.value)} style={inputStyle} />
                                        <input placeholder="LinkedIn" value={formData.contact?.socials?.linkedin || ''} onChange={(e) => handleSocialChange('linkedin', e.target.value)} style={inputStyle} />
                                    </div>
                                </Section>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FULL WIDTH SECTIONS (Outside Grid) */}
            {
                activeTab === 'landing' && (
                    <div style={{ marginTop: '3rem' }}>
                        <Section title="Footer Architecture (Full Width)">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#888' }}>Navigation Columns</span>
                                <button onClick={() => {
                                    const next = [...(formData.footerSections || []), { title: 'New Column', links: [{ label: 'Link', url: '#' }] }];
                                    setFormData({ ...formData, footerSections: next });
                                    markDirty();
                                }} style={{ color: formData.colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ ADD COLUMN</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {(formData.footerSections || []).map((section, sIdx) => (
                                    <div key={sIdx} style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.8rem' }}>
                                            <input value={section.title} onChange={(e) => {
                                                const next = [...formData.footerSections];
                                                next[sIdx] = { ...next[sIdx], title: e.target.value };
                                                setFormData({ ...formData, footerSections: next });
                                                markDirty();
                                            }} style={{ background: 'none', border: 'none', color: formData.colors.primary, fontWeight: 'bold', fontSize: '1rem', width: '100%' }} />
                                            <button onClick={() => {
                                                const next = formData.footerSections.filter((_, i) => i !== sIdx);
                                                setFormData({ ...formData, footerSections: next });
                                                markDirty();
                                            }} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', paddingLeft: '0.5rem' }}><FiTrash2 /></button>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {section.links.map((link, lIdx) => (
                                                <div key={lIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <input value={link.label} onChange={(e) => {
                                                        const next = [...formData.footerSections];
                                                        const updatedLinks = [...next[sIdx].links];
                                                        updatedLinks[lIdx] = { ...updatedLinks[lIdx], label: e.target.value };
                                                        next[sIdx] = { ...next[sIdx], links: updatedLinks };
                                                        setFormData({ ...formData, footerSections: next });
                                                        markDirty();
                                                    }} placeholder="Label" style={{ ...inputStyle, padding: '0.6rem', fontSize: '0.85rem' }} />
                                                    <input value={link.url} onChange={(e) => {
                                                        const next = [...formData.footerSections];
                                                        const updatedLinks = [...next[sIdx].links];
                                                        updatedLinks[lIdx] = { ...updatedLinks[lIdx], url: e.target.value };
                                                        next[sIdx] = { ...next[sIdx], links: updatedLinks };
                                                        setFormData({ ...formData, footerSections: next });
                                                        markDirty();
                                                    }} placeholder="URL" style={{ ...inputStyle, padding: '0.6rem', fontSize: '0.85rem' }} />
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => {
                                            const next = [...formData.footerSections];
                                            const updatedLinks = [...next[sIdx].links, { label: 'New Link', url: '#' }];
                                            next[sIdx] = { ...next[sIdx], links: updatedLinks };
                                            setFormData({ ...formData, footerSections: next });
                                            markDirty();
                                        }} style={{ marginTop: '1rem', padding: '0.8rem', background: '#1a1a1a', color: '#888', border: '1px dashed #333', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', width: '100%' }}>+ Add Link</button>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                )
            }
        </div>
    );
};

const Section = ({ title, children }) => (
    <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>{title}</h3>
        {children}
    </div>
);

const ColorInput = ({ label, color, onChange, desc }) => {
    const [hexValue, setHexValue] = useState(color);
    useEffect(() => { setHexValue(color); }, [color]);
    return (
        <div>
            <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.8rem' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="color" value={color} onChange={(e) => onChange(e.target.value)} style={{ width: '30px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                <input type="text" value={hexValue} onChange={(e) => { setHexValue(e.target.value); if (/^#[0-9A-F]{6}$/i.test(e.target.value)) onChange(e.target.value); }} style={{ color: '#fff', background: '#000', border: '1px solid #333', fontSize: '0.7rem', width: '60px', padding: '0.3rem' }} />
            </div>
        </div>
    );
};

const ImageInput = ({ label, value, onChange, desc }) => {
    const fileRef = useRef(null);
    return (
        <div style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '12px', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{label}</div>
                <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#111', overflow: 'hidden' }}>
                    {value ? <img src={value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiImage style={{ color: '#333', padding: '10px' }} />}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="URL or Base64" style={{ flex: 1, background: '#000', border: '1px solid #333', color: '#fff', fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px' }} />
                <button onClick={() => fileRef.current.click()} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}><FiUpload /></button>
                <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                        const r = new FileReader();
                        r.onloadend = () => onChange(r.result);
                        r.readAsDataURL(f);
                    }
                }} />
            </div>
        </div>
    );
};

export default AdminContent;
