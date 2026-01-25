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
                const secondary = settings.colors.secondary || '#0a0a0a';
                const accent = settings.colors.accent || '#ffffff';

                // 1. PRIMARY -> All Gold related variables
                if (primary) {
                    const primaryRgb = hexToRgb(primary);
                    root.style.setProperty('--color-gold', primary);
                    root.style.setProperty('--color-gold-rgb', primaryRgb);
                    root.style.setProperty('--color-primary', primary);
                    root.style.setProperty('--color-btn-text', getContrastColor(primary));

                    // Simple luminance-based tint/shade for light/dark variants
                    root.style.setProperty('--color-gold-light', primary + 'cc'); // 80% opacity
                    root.style.setProperty('--color-gold-dark', primary + '99');  // 60% opacity

                    // Update Gradients
                    root.style.setProperty('--gradient-gold', `linear-gradient(135deg, ${primary} 0%, ${primary}99 50%, ${primary} 100%)`);

                    // Update Shadow (using hexToRgb)
                    root.style.setProperty('--shadow-gold', `0 4px 20px rgba(${primaryRgb}, 0.3)`);
                }

                // 2. SECONDARY -> All Black/Graphite related variables (Global Atmosphere)
                if (secondary) {
                    const secondaryRgb = hexToRgb(secondary);
                    root.style.setProperty('--color-secondary', secondary);
                    root.style.setProperty('--color-black', secondary);
                    root.style.setProperty('--color-black-rgb', secondaryRgb);
                    root.style.setProperty('--color-black-light', secondary + 'ee'); // Slightly lighter
                    root.style.setProperty('--color-graphite', secondary); // Used for cards

                    // Slightly lighter variant for cards/borders
                    root.style.setProperty('--color-graphite-light', `rgba(${secondaryRgb}, 0.8)`);
                    root.style.setProperty('--color-charcoal', `rgba(${secondaryRgb}, 0.6)`);
                }

                // 3. ACCENT -> All Platinum/Grey related variables (Text & Indicators)
                if (accent) {
                    root.style.setProperty('--color-accent', accent);
                    root.style.setProperty('--color-platinum', accent); // Main body text
                    root.style.setProperty('--color-white', accent);
                    root.style.setProperty('--color-title-base', accent);

                    // Lower opacity for subtext
                    const accentRgb = hexToRgb(accent);
                    root.style.setProperty('--color-silver', `rgba(${accentRgb}, 0.7)`);
                    root.style.setProperty('--color-grey-light', `rgba(${accentRgb}, 0.5)`);
                }
            }

            // Typography
            if (settings.typography) {
                root.style.setProperty('--font-heading', settings.typography + ', serif');
                root.style.setProperty('--font-body', settings.typography + ', sans-serif');
            }

            // SEO Metadata (Title & Favicon)
            if (settings.seo && settings.seo.title) {
                document.title = settings.seo.title;
            }

            // FAVICON Update
            if (settings.logo) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }

                if (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) {
                    link.href = settings.logo;
                } else {
                    // If it's an emoji or character, we can create a data URL for it
                    const canvas = document.createElement('canvas');
                    canvas.width = 64;
                    canvas.height = 64;
                    const ctx = canvas.getContext('2d');
                    ctx.font = '48px serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(settings.logo, 32, 32);
                    link.href = canvas.toDataURL();
                }
            }
        }
    }, [settings]);

    return null;
};

export default ThemeInjector;
