import * as Route from '@/constants/routes';
import logoFallback from '@/images/logo-full.png';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/hooks';
import {
  FacebookOutlined,
  InstagramOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const Footer = () => {
  const { pathname } = useLocation();
  const { settings } = useSiteSettings();

  const visibleOnlyPath = [
    Route.HOME,
    Route.SHOP
  ];

  if (!visibleOnlyPath.includes(pathname)) return null;

  const shopLogo = settings.shop_logo_url || logoFallback;

  return (
    <footer className="footer" style={{
      background: '#f9f9f9',
      borderTop: '1px solid #e1e1e1',
      padding: '48px 0 24px 0',
      marginTop: '48px',
      color: '#444'
    }}>
      <div className="footer-content" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px',
      }}>
        {/* Cột 1: Thương hiệu */}
        <div className="footer-brand-sec" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <img
            alt={settings.shop_name || 'Salinaka logo'}
            src={shopLogo}
            style={{ maxHeight: '45px', objectFit: 'contain', alignSelf: 'flex-start' }}
          />
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#666', margin: 0 }}>
            {settings.shop_tagline || 'Cung cấp các sản phẩm kính mắt cao cấp chính hãng mang lại phong cách thời thượng cho bạn.'}
          </p>
          {settings.shop_working_hours && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#777', marginTop: '8px' }}>
              <ClockCircleOutlined />
              <span>Giờ mở cửa: {settings.shop_working_hours}</span>
            </div>
          )}
        </div>

        {/* Cột 2: Thông tin liên hệ */}
        <div className="footer-contact-sec" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Thông Tin Liên Hệ
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            {settings.shop_address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <HomeOutlined style={{ marginTop: '3px', color: '#888' }} />
                <span style={{ lineHeight: '1.4' }}>{settings.shop_address}</span>
              </div>
            )}
            {settings.shop_phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneOutlined style={{ color: '#888' }} />
                <a href={`tel:${settings.shop_phone.replace(/\s+/g, '')}`} style={{ color: '#444', textDecoration: 'none', fontWeight: '500' }}>
                  {settings.shop_phone}
                </a>
              </div>
            )}
            {settings.shop_email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MailOutlined style={{ color: '#888' }} />
                <a href={`mailto:${settings.shop_email}`} style={{ color: '#444', textDecoration: 'none' }}>
                  {settings.shop_email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Cột 3: Kết nối mạng xã hội */}
        <div className="footer-social-sec" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kết Nối Với Chúng Tôi
          </h4>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Theo dõi chúng tôi trên mạng xã hội để cập nhật các bộ sưu tập mới nhất.
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '20px', marginTop: '4px' }}>
            {settings.shop_facebook_url && (
              <a href={settings.shop_facebook_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', transition: 'transform 0.2s' }} className="social-icon-hover">
                <FacebookOutlined />
              </a>
            )}
            {settings.shop_instagram_url && (
              <a href={settings.shop_instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#e4405f', transition: 'transform 0.2s' }} className="social-icon-hover">
                <InstagramOutlined />
              </a>
            )}
            {settings.shop_tiktok_url && (
              <a href={settings.shop_tiktok_url} target="_blank" rel="noopener noreferrer" style={{ color: '#010101', transition: 'transform 0.2s' }} className="social-icon-hover">
                <GlobalOutlined />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dòng bản quyền (Copyright) */}
      <div style={{
        maxWidth: '1200px',
        margin: '32px auto 0 auto',
        padding: '24px 20px 0 20px',
        borderTop: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: '#888'
      }}>
        <span>
          {settings.shop_copyright || `© ${new Date().getFullYear()} Salinaka Eyewear. Tất cả quyền được bảo lưu.`}
        </span>
        <span style={{ fontSize: '11px' }}>
          Developed by <a href="https://github.com/jgudo" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>JULIUS GUEVARRA</a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
