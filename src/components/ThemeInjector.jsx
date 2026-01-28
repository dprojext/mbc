import { useEffect } from 'react';
import { useData } from '../context/DataContext';

const ThemeInjector = () => {
    const { settings } = useData();

    useEffect(() => {
        if (settings) {
            const root = document.documentElement;

            // Helper to convert hex to rgb for opacity-based variables
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '201, 169, 106';
            };

            // Helper to get contrast color (black or white) based on background hex
            const getContrastColor = (hex) => {
                const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                const rgb = match ? [
                    parseInt(match[1], 16),
                    parseInt(match[2], 16),
                    parseInt(match[3], 16)
                ] : [201, 169, 106];

                // Luma calculation (perceived brightness)
                const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
                return luma > 160 ? '#000000' : '#ffffff';
            };

            // Colors
            if (settings && settings.colors) {
                const primary = settings.colors.primary || '#c9a96a';
                const secondary = settings.colors.secondary || '#1a1a1a';
                const accent = settings.colors.accent || '#ffffff';
                const background = settings.colors.background || '#0a0a0a';

                const primaryRgb = hexToRgb(primary);
                const secondaryRgb = hexToRgb(secondary);
                const bgRgb = hexToRgb(background);
                const accentRgb = hexToRgb(accent);

                // 1. PRIMARY -> All Gold related variables
                root.style.setProperty('--color-gold', primary);
                root.style.setProperty('--color-gold-rgb', primaryRgb);
                root.style.setProperty('--color-primary', primary);
                root.style.setProperty('--color-btn-text', getContrastColor(primary));
                root.style.setProperty('--color-gold-light', primary + 'cc');
                root.style.setProperty('--color-gold-dark', primary + '99');
                root.style.setProperty('--gradient-gold', `linear-gradient(135deg, ${primary} 0%, ${primary}99 50%, ${primary} 100%)`);
                root.style.setProperty('--shadow-gold', `0 4px 20px rgba(${primaryRgb}, 0.3)`);

                // 2. SECONDARY -> UI Structure
                root.style.setProperty('--color-secondary', secondary);
                root.style.setProperty('--color-secondary-rgb', secondaryRgb);
                root.style.setProperty('--color-graphite', `rgba(${secondaryRgb}, 0.2)`);
                root.style.setProperty('--color-graphite-solid', secondary);
                root.style.setProperty('--color-black-light', `rgba(${secondaryRgb}, 0.4)`);

                // 3. BACKGROUND -> Global Atmosphere
                root.style.setProperty('--color-background', background);
                root.style.setProperty('--color-background-rgb', bgRgb);
                root.style.setProperty('--color-black', background);
                root.style.setProperty('--color-black-rgb', bgRgb);
                root.style.setProperty('--color-bg-contrast', getContrastColor(background));

                // 4. ACCENT -> Text & Details
                root.style.setProperty('--color-accent', accent);
                root.style.setProperty('--color-platinum', accent);
                root.style.setProperty('--color-white', accent);
                root.style.setProperty('--color-title-base', accent);
                root.style.setProperty('--color-silver', `rgba(${accentRgb}, 0.7)`);
                root.style.setProperty('--color-grey-light', `rgba(${accentRgb}, 0.5)`);
            }


            // Typography
            if (settings.typography) {
                // 1. DYNAMIC FONT LOADING: Inject Google Font if it's not already loaded
                const fontId = `google-font-${settings.typography.replace(/\s+/g, '-').toLowerCase()}`;
                if (!document.getElementById(fontId)) {
                    const link = document.createElement('link');
                    link.id = fontId;
                    link.rel = 'stylesheet';
                    link.href = `https://fonts.googleapis.com/css2?family=${settings.typography.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
                    document.head.appendChild(link);
                }

                root.style.setProperty('--font-heading', settings.typography + ', serif');
                root.style.setProperty('--font-body', settings.typography + ', sans-serif');
            }

            // SEO Metadata (Title & Favicon)
            if (settings.seo && settings.seo.title) {
                document.title = settings.seo.title;
            }

            // FAVICON Update
            const faviconSource = settings.favicon || settings.logo || '●';
            if (faviconSource) {
                // Remove all existing icons to force a fresh paint
                const existing = document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon']");
                existing.forEach(e => e.remove());

                const link = document.createElement('link');
                link.rel = 'icon';

                if (String(faviconSource).length > 10 && (faviconSource.startsWith('data:') || faviconSource.startsWith('http') || faviconSource.startsWith('/'))) {
                    link.href = faviconSource;
                } else {
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = settings.colors?.primary || '#c9a96a';
                    ctx.beginPath(); ctx.arc(64, 64, 60, 0, 2 * Math.PI); ctx.fill();
                    ctx.fillStyle = '#000'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(String(faviconSource).charAt(0).toUpperCase(), 64, 68);
                    link.href = canvas.toDataURL('image/png');
                }
                document.head.appendChild(link);
            }
        }
    }, [settings]);

    return null;
};

export default ThemeInjector;
