import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import api from '@/services/api';

const AUTOPLAY_INTERVAL = 5000;

// ─── Google Font injection (script font, once) ────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('promo-fonts')) {
  const link = document.createElement('link');
  link.id = 'promo-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@800;900&display=swap';
  document.head.appendChild(link);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const handleNavigate = (banner, history) => {
  if (!banner.linkValue) return;
  switch (banner.linkType) {
    case 'PRODUCT':  history.push(`/product/${banner.linkValue}`); break;
    case 'CATEGORY': history.push(`/shop?category=${banner.linkValue}`); break;
    case 'CUSTOM_URL':
      banner.linkValue.startsWith('http')
        ? (window.location.href = banner.linkValue)
        : history.push(banner.linkValue);
      break;
    default: break;
  }
};

// ─── Rich Promo Slide (split layout) ─────────────────────────────────────────
// Used when banner.displayStyle === 'PROMO' (or when no plain image fits)
const PromoSlide = ({ banner, onClick }) => {
  const tag      = banner.tag      || '';
  const title    = banner.title    || '';
  const highlight= banner.highlight|| '';
  const subtitle = banner.subtitle || '';
  const ctaText  = banner.ctaText  || 'SHOP NOW';
  const bgColor  = banner.bgColor  || '#E91E8C';
  const textColor= banner.textColor|| '#ffffff';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', width: '100%', height: '100%',
        cursor: banner.linkValue ? 'pointer' : 'default',
        fontFamily: 'inherit',
        userSelect: 'none',
      }}
    >
      {/* Left — product photo */}
      <div style={{
        flex: '0 0 50%', background: '#f8f8f8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ color: '#ccc', fontSize: '14px' }}>No image</div>
        )}
      </div>

      {/* Right — promo content */}
      <div style={{
        flex: '0 0 50%', background: bgColor,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 40px', gap: '6px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', width: '320px', height: '320px',
          borderRadius: '50%',
          border: `1px solid ${textColor}22`,
          top: '-60px', right: '-80px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '220px', height: '220px',
          borderRadius: '50%',
          border: `1px solid ${textColor}22`,
          bottom: '-40px', left: '-50px', pointerEvents: 'none',
        }} />

        {/* Tag line */}
        {tag && (
          <span style={{
            color: textColor, fontSize: 'clamp(10px, 1.2vw, 14px)',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: '800', letterSpacing: '.25em',
            textTransform: 'uppercase', opacity: 0.9,
          }}>
            {tag}
          </span>
        )}

        {/* Script title */}
        {title && (
          <div style={{
            color: textColor,
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: '700',
            lineHeight: 1.1,
            textShadow: '0 2px 12px rgba(0,0,0,.15)',
          }}>
            {title}
          </div>
        )}

        {/* Highlight (e.g. "SALE") */}
        {highlight && (
          <div style={{
            color: textColor,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(28px, 4.5vw, 58px)',
            fontWeight: '900',
            letterSpacing: '.04em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            {highlight}
          </div>
        )}

        {/* Subtitle (e.g. "MUA 1 TẶNG 1") */}
        {subtitle && (
          <div style={{
            color: textColor,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(14px, 2vw, 24px)',
            fontWeight: '800',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}>
            {subtitle}
          </div>
        )}

        {/* CTA Button */}
        {ctaText && (
          <div style={{
            marginTop: '18px',
            border: `2px solid ${textColor}`,
            color: textColor,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: '800',
            fontSize: 'clamp(10px, 1.1vw, 13px)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            padding: '10px 28px',
            borderRadius: '2px',
            background: 'transparent',
            transition: 'all .25s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = textColor;
            e.currentTarget.style.color = bgColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = textColor;
          }}
          >
            {ctaText}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Image Slide (original full-image) ───────────────────────────────────────
const ImageSlide = ({ banner, onClick }) => (
  <div
    onClick={onClick}
    style={{ width: '100%', height: '100%', position: 'relative', cursor: banner.linkValue ? 'pointer' : 'default' }}
  >
    <img
      src={banner.imageUrl}
      alt={banner.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      onError={(e) => { e.target.src = 'https://placehold.co/1600x500?text=Banner'; }}
    />
    {(banner.title || banner.subtitle) && (
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '40px 50px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
      }}>
        {banner.title && (
          <h2 style={{
            color: '#fff', fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: '700',
            fontFamily: "'Tajawal', Helvetica, Arial, sans-serif",
            margin: '0 0 6px', textShadow: '0 2px 8px rgba(0,0,0,.3)',
          }}>
            {banner.title}
          </h2>
        )}
        {banner.subtitle && (
          <p style={{
            color: 'rgba(255,255,255,.9)', fontSize: 'clamp(13px, 1.6vw, 18px)',
            fontFamily: "'Tajawal', Helvetica, Arial, sans-serif",
            fontWeight: '400', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.3)',
          }}>
            {banner.subtitle}
          </p>
        )}
      </div>
    )}
  </div>
);

// ─── Carousel ─────────────────────────────────────────────────────────────────
const HeroBannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    api.getActiveBanners()
      .then(data => setBanners(data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const goNext = useCallback(() => setCurrent(p => (p + 1) % banners.length), [banners.length]);
  const goPrev = useCallback(() => setCurrent(p => (p - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    timerRef.current = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [banners.length, isHovered, goNext]);

  if (isLoading) return (
    <div style={{ width: '100%', aspectRatio: '16 / 5', background: '#f0f0f0', borderRadius: '16px', marginBottom: '40px' }} />
  );
  if (banners.length === 0) return null;

  const arrowStyle = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)',
    border: 'none', borderRadius: '50%', width: '44px', height: '44px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', fontSize: '22px', zIndex: 2,
    transition: 'background .25s',
  };

  return (
    <div
      style={{
        position: 'relative', width: '100%', marginBottom: '40px',
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,.12)',
        aspectRatio: '16 / 5',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track */}
      <div style={{
        display: 'flex', height: '100%',
        transform: `translateX(-${current * 100}%)`,
        transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
      }}>
        {banners.map((banner, i) => (
          <div key={banner.id || i} style={{ minWidth: '100%', height: '100%' }}>
            {banner.displayStyle === 'PROMO'
              ? <PromoSlide banner={banner} onClick={() => handleNavigate(banner, history)} />
              : <ImageSlide banner={banner} onClick={() => handleNavigate(banner, history)} />
            }
          </div>
        ))}
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            style={{ ...arrowStyle, left: '12px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
            aria-label="Previous"
          >‹</button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            style={{ ...arrowStyle, right: '12px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
            aria-label="Next"
          >›</button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '14px', left: '50%',
          transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 2,
        }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: i === current ? '28px' : '10px', height: '10px',
                borderRadius: '10px', border: '2px solid rgba(255,255,255,.7)',
                background: i === current ? '#fff' : 'transparent',
                cursor: 'pointer', padding: 0, transition: 'all .3s',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBannerCarousel;
