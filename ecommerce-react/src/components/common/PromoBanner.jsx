import React from 'react';
import { useHistory } from 'react-router-dom';

/**
 * PromoBanner — split-layout promotional banner.
 *
 * Props:
 *  tag        — small uppercase label at top  (e.g. "INTERNATIONAL")
 *  title      — script-font headline          (e.g. "Women's Day")
 *  highlight  — giant bold text               (e.g. "SALE")
 *  subtitle   — secondary bold line           (e.g. "MUA 1 TẶNG 1")
 *  ctaText    — button label                  (default "SHOP NOW")
 *  ctaLink    — route or url to navigate
 *  imageUrl   — product photo for left half
 *  bgColor    — right panel background color  (default "#E91E8C")
 *  textColor  — right panel text color        (default "#ffffff")
 *  reverse    — flip: text left, image right  (default false)
 */
const PromoBanner = ({
  tag       = '',
  title     = '',
  highlight = '',
  subtitle  = '',
  ctaText   = 'SHOP NOW',
  ctaLink   = '/shop',
  imageUrl  = '',
  bgColor   = '#E91E8C',
  textColor = '#ffffff',
  reverse   = false,
}) => {
  const history = useHistory();

  const navigate = () => {
    if (!ctaLink) return;
    ctaLink.startsWith('http') ? window.open(ctaLink, '_blank') : history.push(ctaLink);
  };

  const imagePanel = (
    <div style={{
      flex: '0 0 50%',
      background: '#f8f8f8',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '280px',
    }}>
      {imageUrl
        ? <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ color: '#ccc', fontSize: '13px' }}>No image</div>
      }
    </div>
  );

  const promoPanel = (
    <div style={{
      flex: '0 0 50%',
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 56px)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      gap: '4px',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', width: '360px', height: '360px',
        borderRadius: '50%', border: `1px solid ${textColor}25`,
        top: '-80px', right: '-100px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '240px', height: '240px',
        borderRadius: '50%', border: `1px solid ${textColor}25`,
        bottom: '-60px', left: '-60px', pointerEvents: 'none',
      }} />

      {/* Tag */}
      {tag && (
        <span style={{
          color: textColor,
          fontFamily: "'Montserrat', 'Tajawal', sans-serif",
          fontSize: 'clamp(9px, 1.1vw, 13px)',
          fontWeight: '800',
          letterSpacing: '.3em',
          textTransform: 'uppercase',
          opacity: 0.85,
          marginBottom: '2px',
        }}>
          {tag}
        </span>
      )}

      {/* Script headline */}
      {title && (
        <div style={{
          color: textColor,
          fontFamily: "'Dancing Script', cursive, 'Tajawal', sans-serif",
          fontSize: 'clamp(30px, 5.5vw, 68px)',
          fontWeight: '700',
          lineHeight: 1.05,
          textShadow: '0 2px 16px rgba(0,0,0,.12)',
        }}>
          {title}
        </div>
      )}

      {/* Highlight */}
      {highlight && (
        <div style={{
          color: textColor,
          fontFamily: "'Montserrat', 'Tajawal', sans-serif",
          fontSize: 'clamp(28px, 4.8vw, 62px)',
          fontWeight: '900',
          letterSpacing: '.04em',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>
          {highlight}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div style={{
          color: textColor,
          fontFamily: "'Montserrat', 'Tajawal', sans-serif",
          fontSize: 'clamp(13px, 2vw, 26px)',
          fontWeight: '800',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}>
          {subtitle}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={navigate}
        style={{
          marginTop: '20px',
          border: `2px solid ${textColor}`,
          color: textColor,
          fontFamily: "'Montserrat', 'Tajawal', sans-serif",
          fontWeight: '800',
          fontSize: 'clamp(9px, 1vw, 12px)',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          padding: '10px 30px',
          borderRadius: '2px',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'all .25s',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = textColor;
          e.currentTarget.style.color = bgColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = textColor;
        }}
        type="button"
      >
        {ctaText}
      </button>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: reverse ? 'row-reverse' : 'row',
      width: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,.10)',
      marginBottom: '40px',
      aspectRatio: '16 / 5',
    }}>
      {imagePanel}
      {promoPanel}
    </div>
  );
};

export default PromoBanner;
