
import React from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { FontConfig } from '../types';

// FIX: Updated parameter to take fonts array instead of settings object, as customFonts property doesn't exist on Settings
export const getGlobalFontCSS = (fonts: FontConfig[] | undefined) => {
    if (!fonts) return '';

    const MALAYALAM_RANGE = "U+0D00-0D7F";
    const ARABIC_RANGE = "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF";
    
    let fontFaces = '';

    // Language-specific fonts (GlobalAutoFont uses unicode-range)
    // FIX: Accessing fonts from the collection array instead of settings.customFonts
    const malayalamFont = fonts.find(f => f.language === 'malayalam');
    if (malayalamFont?.url) {
        fontFaces += `
            @font-face {
                font-family: 'GlobalAutoFont';
                src: url('${malayalamFont.url}');
                unicode-range: ${MALAYALAM_RANGE};
                font-display: swap;
            }
        `;
    }

    const arabicFont = fonts.find(f => f.language === 'arabic');
    if (arabicFont?.url) {
        fontFaces += `
            @font-face {
                font-family: 'GlobalAutoFont';
                src: url('${arabicFont.url}');
                unicode-range: ${ARABIC_RANGE};
                font-display: swap;
            }
        `;
    }

    // General Custom Fonts (for explicit selection, using their defined family names)
    // FIX: Accessing general fonts from the collection array instead of settings.generalCustomFonts
    fonts.filter(f => f.language === 'general' || (!f.language && f.family !== 'GlobalAutoFont')).forEach(font => {
        if (font.url && font.family) {
            fontFaces += `
                @font-face {
                    font-family: '${font.family}';
                    src: url('${font.url}');
                    font-display: swap;
                }
            `;
        }
    });

    if (fontFaces) {
        return `
            ${fontFaces}
            
            /* Apply GlobalAutoFont first so it catches the ranges */
            body, .font-sans, .font-serif, h1, h2, h3, h4, h5, h6, p, span, div, a, input, button, textarea, select, table, td, th {
                font-family: 'GlobalAutoFont', 'Inter', 'Roboto Slab', system-ui, -apple-system, sans-serif !important;
            }
            
            /* Helper classes for manual override if needed */
            .font-malayalam { font-family: 'GlobalAutoFont', sans-serif !important; }
            .font-arabic { font-family: 'GlobalAutoFont', serif !important; direction: rtl; }
        `;
    }
    
    return '';
};

const GlobalFontManager: React.FC = () => {
    const { state } = useFirebase();
    // FIX: Pass the fonts array from state to getGlobalFontCSS
    const css = getGlobalFontCSS(state?.fonts);
    return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

export default GlobalFontManager;
