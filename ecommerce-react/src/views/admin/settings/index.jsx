import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import {
  SettingOutlined, SaveOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, EyeInvisibleOutlined,
  TagOutlined, DollarOutlined, PercentageOutlined,
  UploadOutlined, ShopOutlined, PhoneOutlined,
  MailOutlined, HomeOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, GlobalOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import api from '@/services/api';

const NUMERIC_META = {
  home_featured_count: {
    label: 'Home Page — Featured Products Count',
    description: 'Number of featured products displayed in the "Featured Products" section on the home page.',
    page: 'Home Page',
  },
  home_recommended_count: {
    label: 'Home Page — Recommended Products Count',
    description: 'Number of recommended products displayed in the "Recommended Products" section on the home page.',
    page: 'Home Page',
  },
  featured_page_count: {
    label: 'Featured Page — Display Count',
    description: 'Total number of featured products displayed on the /featured page.',
    page: '/featured',
  },
  recommended_page_count: {
    label: 'Recommended Page — Display Count',
    description: 'Total number of recommended products displayed on the /recommended page.',
    page: '/recommended',
  },
  shop_page_size: {
    label: 'Shop Page — Products Per Page',
    description: 'Number of products displayed per page on the /shop page.',
    page: '/shop',
  },
};

const PRICE_TOGGLE_META = {
  show_original_price: {
    label: 'Original Price',
    description: 'Display the original price (crossed out) above the sale price.',
    icon: <TagOutlined />,
  },
  show_sale_price: {
    label: 'Sale Price',
    description: 'Display the sale / selling price on the product card.',
    icon: <DollarOutlined />,
  },
  show_discount_badge: {
    label: 'Discount Percentage',
    description: 'Display a red discount percentage badge at the top-left corner of the card.',
    icon: <PercentageOutlined />,
  },
};

// ─── Toggle Switch component ─────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      background: checked ? '#1a1a1a' : '#d9d9d9',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background .2s',
      padding: 0,
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
    }}
    aria-checked={checked}
    role="switch"
  >
    <span style={{
      position: 'absolute',
      left: checked ? '22px' : '2px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      transition: 'left .2s',
    }} />
  </button>
);

// ─── Navbar ──────────────────────────────────────────────────────────────────
const SettingsNavbar = ({ total }) => (
  <div className="product-admin-header">
    <h3 className="product-admin-header-title">
      Display & Brand Identity Settings ({total} settings)
    </h3>
    <span style={{ fontSize: '13px', color: '#999' }}>
      Manage product displays, store details, Logo, Favicon, and contact Footer info across the system.
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AdminSettings = () => {
  useDocumentTitle('Display Settings | Admin');
  useScrollTop();

  const [settings, setSettings] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [localValues, setLocalValues] = useState({});
  const [saving, setSaving] = useState({});
  const [feedback, setFeedback] = useState({});

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSettings();
      setSettings(data);
      const init = {};
      data.forEach((s) => { init[s.key] = s.value; });
      setLocalValues(init);
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Numeric setting handlers ─────────────────────────────────────────────
  const handleNumericChange = (key, val) => {
    setLocalValues((prev) => ({ ...prev, [key]: val }));
    setFeedback((prev) => ({ ...prev, [key]: null }));
  };

  const handleNumericSave = async (setting) => {
    const rawVal = localValues[setting.key];
    const num = parseInt(rawVal, 10);
    if (isNaN(num)) {
      setFeedback((prev) => ({ ...prev, [setting.key]: { type: 'error', msg: 'Please enter an integer.' } }));
      return;
    }
    if (num < setting.minValue || num > setting.maxValue) {
      setFeedback((prev) => ({
        ...prev,
        [setting.key]: { type: 'error', msg: `Value must be between ${setting.minValue} and ${setting.maxValue}.` }
      }));
      return;
    }
    setSaving((prev) => ({ ...prev, [setting.key]: true }));
    try {
      await api.updateSetting(setting.key, num);
      setSettings((prev) => prev.map((s) => s.key === setting.key ? { ...s, value: String(num) } : s));
      setFeedback((prev) => ({ ...prev, [setting.key]: { type: 'success', msg: 'Saved successfully.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [setting.key]: null })), 3000);
    } catch (e) {
      setFeedback((prev) => ({
        ...prev,
        [setting.key]: { type: 'error', msg: e?.data?.message || e?.message || 'Save failed.' }
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [setting.key]: false }));
    }
  };

  const handleNumericReset = (setting) => {
    setLocalValues((prev) => ({ ...prev, [setting.key]: setting.value }));
    setFeedback((prev) => ({ ...prev, [setting.key]: null }));
  };

  // ── Boolean toggle handler ───────────────────────────────────────────────
  const handleToggle = async (key, newBool) => {
    const newVal = String(newBool);
    setLocalValues((prev) => ({ ...prev, [key]: newVal }));
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await api.updateSetting(key, newVal);
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value: newVal } : s));
      setFeedback((prev) => ({ ...prev, [key]: { type: 'success', msg: 'Saved.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [key]: null })), 2000);
    } catch (e) {
      // revert on error
      setLocalValues((prev) => ({ ...prev, [key]: String(!newBool) }));
      setFeedback((prev) => ({ ...prev, [key]: { type: 'error', msg: 'Save failed.' } }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ── Identity Text & Image handler ─────────────────────────────────────────
  const handleIdentityChange = (key, val) => {
    setLocalValues((prev) => ({ ...prev, [key]: val }));
    setFeedback((prev) => ({ ...prev, [key]: null }));
  };

  const handleIdentitySave = async (key) => {
    const val = localValues[key] || '';
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await api.updateSetting(key, val);
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value: val } : s));
      setFeedback((prev) => ({ ...prev, [key]: { type: 'success', msg: 'Saved successfully.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [key]: null })), 3000);
    } catch (e) {
      setFeedback((prev) => ({
        ...prev,
        [key]: { type: 'error', msg: 'Save failed.' }
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const uploadedUrl = await api.storeImage(file);
      setLocalValues((prev) => ({ ...prev, [key]: uploadedUrl }));
      await api.updateSetting(key, uploadedUrl);
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value: uploadedUrl } : s));
      setFeedback((prev) => ({ ...prev, [key]: { type: 'success', msg: 'Image uploaded successfully.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [key]: null })), 3000);
    } catch (error) {
      setFeedback((prev) => ({ ...prev, [key]: { type: 'error', msg: 'Failed to upload image.' } }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveAllIdentity = async () => {
    const dirtySettings = settings.filter(
      (s) => s.key.startsWith('shop_') && localValues[s.key] !== s.value
    );

    if (dirtySettings.length === 0) {
      alert('No brand identity configurations have changed.');
      return;
    }

    let successCount = 0;
    for (const s of dirtySettings) {
      setSaving((prev) => ({ ...prev, [s.key]: true }));
      try {
        const val = localValues[s.key] || '';
        await api.updateSetting(s.key, val);
        successCount++;
      } catch (e) {
        console.error('Failed to save key: ' + s.key, e);
      } finally {
        setSaving((prev) => ({ ...prev, [s.key]: false }));
      }
    }

    fetchSettings();
    alert(`Successfully saved ${successCount}/${dirtySettings.length} brand configurations.`);
  };

  // ── Split settings into groups ──────────────────────────────────────
  const numericSettings = settings.filter((s) => !s.key.startsWith('shop_') && !s.key.endsWith('_product_ids') && (s.minValue != null || s.maxValue != null));
  const booleanSettings = settings.filter((s) => !s.key.startsWith('shop_') && !s.key.endsWith('_product_ids') && s.minValue == null && s.maxValue == null);

  const getIdentitySettingVal = (key) => localValues[key] ?? '';

  return (
    <Boundary>
      {/* Loading overlay */}
      <div className="loader" style={{ display: isLoading ? 'flex' : 'none' }}>
        <div className="loader-renderer" />
      </div>

      <SettingsNavbar total={settings.length} />

      <div className="product-admin-items">

        {/* ── Section 1: Product Card Price Display ────────────────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: '10px',
          marginBottom: '28px',
          overflow: 'hidden',
        }}>
          {/* Section header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f5f5f5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <EyeOutlined style={{ fontSize: '16px', color: '#1a1a1a' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>
                Product Card Price Display
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                Applies to the Shop and Featured pages - changes take effect immediately
              </div>
            </div>
          </div>

          {/* Toggle rows */}
          {booleanSettings.length === 0 && !isLoading && (
            <div style={{ padding: '20px', color: '#bbb', fontSize: '13px' }}>
              No price display settings found.
            </div>
          )}
          {booleanSettings.map((setting, idx) => {
            const meta = PRICE_TOGGLE_META[setting.key] || {};
            const isOn = (localValues[setting.key] ?? setting.value) !== 'false';
            const isSaving = saving[setting.key];
            const fb = feedback[setting.key];
            const isLast = idx === booleanSettings.length - 1;

            return (
              <div
                key={setting.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: isLast ? 'none' : '1px solid #f9f9f9',
                  gap: '16px',
                  transition: 'background .15s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: isOn ? '#1a1a1a' : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isOn ? '#fff' : '#bbb',
                  fontSize: '16px',
                  flexShrink: 0,
                  transition: 'background .2s, color .2s',
                }}>
                  {meta.icon || <SettingOutlined />}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a' }}>
                    {meta.label || setting.key}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                    {meta.description || setting.description}
                  </div>
                  {/* Feedback */}
                  {fb && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: fb.type === 'success' ? '#388e3c' : '#e53935',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {fb.type === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      {fb.msg}
                    </div>
                  )}
                </div>

                {/* Status label */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: isOn ? '#388e3c' : '#aaa',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {isOn ? 'ON' : 'OFF'}
                </span>

                {/* Toggle */}
                <Toggle
                  checked={isOn}
                  onChange={(val) => handleToggle(setting.key, val)}
                  disabled={isSaving}
                />

                {/* Eye icon status */}
                <div style={{ color: isOn ? '#1a1a1a' : '#ccc', fontSize: '16px', flexShrink: 0 }}>
                  {isOn ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Section 2: Page Size / Count Settings ────────────────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '28px',
        }}>
          {/* Section header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f5f5f5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <SettingOutlined style={{ fontSize: '16px', color: '#1a1a1a' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>
                Displayed Product Counts
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                Valid value: <strong>5 – 20</strong> products
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Page</th>
                <th style={thStyle}>Setting</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '130px' }}>Value</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {numericSettings.map((setting) => {
                const meta = NUMERIC_META[setting.key] || {};
                const isSaving = saving[setting.key];
                const val = localValues[setting.key] ?? setting.value;
                const isDirty = val !== setting.value;
                const fb = feedback[setting.key];

                return (
                  <tr key={setting.key} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#f5f5f5',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#555',
                        fontFamily: 'monospace',
                      }}>
                        {meta.page || setting.key}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>
                        {meta.label || setting.key}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#888', fontSize: '12px', maxWidth: '280px' }}>
                      {meta.description || setting.description}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <input
                        type="number"
                        min={setting.minValue}
                        max={setting.maxValue}
                        value={val}
                        onChange={(e) => handleNumericChange(setting.key, e.target.value)}
                        style={{
                          width: '64px',
                          padding: '6px 8px',
                          border: `1.5px solid ${fb?.type === 'error' ? '#e53935' : isDirty ? '#1a1a1a' : '#ddd'}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '700',
                          textAlign: 'center',
                          outline: 'none',
                          background: isDirty ? '#fffdf0' : '#fafafa',
                          transition: 'border-color .2s, background .2s',
                        }}
                      />
                      {fb && (
                        <div style={{
                          marginTop: '4px',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: fb.type === 'success' ? '#388e3c' : '#e53935',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}>
                          {fb.type === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                          {fb.msg}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="button button-small"
                          type="button"
                          disabled={isSaving || !isDirty}
                          onClick={() => handleNumericSave(setting)}
                          style={{ opacity: (!isDirty || isSaving) ? 0.45 : 1 }}
                        >
                          <SaveOutlined />&nbsp;{isSaving ? 'Saving...' : 'Save'}
                        </button>
                        {isDirty && (
                          <button
                            className="button button-small button-muted"
                            type="button"
                            onClick={() => handleNumericReset(setting)}
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Section 3: Identity & Footer Settings (PREMIUM DESIGN) ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {/* Section header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShopOutlined style={{ fontSize: '18px', color: '#1a1a1a' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>
                  Store Identity & Contact Footer
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                  Configure Logo, Favicon, Shop Name, contact information, and social media links.
                </div>
              </div>
            </div>

            {/* Quick Save All */}
            <button
              onClick={handleSaveAllIdentity}
              className="button button-small"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a1a1a', color: '#fff' }}
            >
              <SaveOutlined /> Save All Settings
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Group 1: Brand Identity */}
            <div>
              <h4 style={groupTitleStyle}>1. Brand Identity & Logos</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* File Upload Logo */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <ShopOutlined />&nbsp;&nbsp;SHOP LOGO
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '120px',
                      height: '60px',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      background: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '4px'
                    }}>
                      {getIdentitySettingVal('shop_logo_url') ? (
                        <img
                          src={getIdentitySettingVal('shop_logo_url')}
                          alt="Logo Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '10px', color: '#bbb' }}>No Logo</span>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        value={getIdentitySettingVal('shop_logo_url')}
                        onChange={(e) => handleIdentityChange('shop_logo_url', e.target.value)}
                        placeholder="Enter logo URL or upload image..."
                        style={inputStyle}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current.click()}
                          style={uploadBtnStyle}
                          disabled={saving['shop_logo_url']}
                        >
                          <UploadOutlined /> Choose File
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIdentitySave('shop_logo_url')}
                          style={saveSubBtnStyle}
                          disabled={saving['shop_logo_url'] || getIdentitySettingVal('shop_logo_url') === settings.find(s => s.key === 'shop_logo_url')?.value}
                        >
                          Save URL
                        </button>
                        <input
                          type="file"
                          ref={logoInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload('shop_logo_url', e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>
                  {feedback['shop_logo_url'] && (
                    <div style={{ ...feedbackStyle, color: feedback['shop_logo_url'].type === 'success' ? '#388e3c' : '#e53935' }}>
                      {feedback['shop_logo_url'].msg}
                    </div>
                  )}
                </div>

                {/* File Upload Favicon */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <GlobalOutlined />&nbsp;&nbsp;BROWSER FAVICON (16x16 / 32x32)
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      background: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '4px'
                    }}>
                      {getIdentitySettingVal('shop_favicon_url') ? (
                        <img
                          src={getIdentitySettingVal('shop_favicon_url')}
                          alt="Favicon Preview"
                          style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '10px', color: '#bbb' }}>No Icon</span>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        value={getIdentitySettingVal('shop_favicon_url')}
                        onChange={(e) => handleIdentityChange('shop_favicon_url', e.target.value)}
                        placeholder="Enter favicon URL or upload image..."
                        style={inputStyle}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current.click()}
                          style={uploadBtnStyle}
                          disabled={saving['shop_favicon_url']}
                        >
                          <UploadOutlined /> Choose File
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIdentitySave('shop_favicon_url')}
                          style={saveSubBtnStyle}
                          disabled={saving['shop_favicon_url'] || getIdentitySettingVal('shop_favicon_url') === settings.find(s => s.key === 'shop_favicon_url')?.value}
                        >
                          Save URL
                        </button>
                        <input
                          type="file"
                          ref={faviconInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload('shop_favicon_url', e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>
                  {feedback['shop_favicon_url'] && (
                    <div style={{ ...feedbackStyle, color: feedback['shop_favicon_url'].type === 'success' ? '#388e3c' : '#e53935' }}>
                      {feedback['shop_favicon_url'].msg}
                    </div>
                  )}
                </div>

                {/* Shop Name */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><ShopOutlined />&nbsp;&nbsp;SHOP NAME</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_name')}
                      onChange={(e) => handleIdentityChange('shop_name', e.target.value)}
                      placeholder="e.g. Salinaka Eyewear..."
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => handleIdentitySave('shop_name')}
                      className="button button-small"
                      disabled={saving['shop_name']}
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Slogan */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><InfoCircleOutlined />&nbsp;&nbsp;SLOGAN / TAGLINE</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_tagline')}
                      onChange={(e) => handleIdentityChange('shop_tagline', e.target.value)}
                      placeholder="A very short description of your brand..."
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => handleIdentitySave('shop_tagline')}
                      className="button button-small"
                      disabled={saving['shop_tagline']}
                    >
                      Save
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

            {/* Group 2: Contact Info */}
            <div>
              <h4 style={groupTitleStyle}>2. Contact Information (Footer)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Hotline */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><PhoneOutlined />&nbsp;&nbsp;HOTLINE / PHONE</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_phone')}
                      onChange={(e) => handleIdentityChange('shop_phone', e.target.value)}
                      placeholder="e.g. +84 912 345 678..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_phone')} className="button button-small">Save</button>
                  </div>
                </div>

                {/* Email */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><MailOutlined />&nbsp;&nbsp;SUPPORT EMAIL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      value={getIdentitySettingVal('shop_email')}
                      onChange={(e) => handleIdentityChange('shop_email', e.target.value)}
                      placeholder="e.g. support@salinaka.com..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_email')} className="button button-small">Save</button>
                  </div>
                </div>

                {/* Address */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><HomeOutlined />&nbsp;&nbsp;STORE ADDRESS</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_address')}
                      onChange={(e) => handleIdentityChange('shop_address', e.target.value)}
                      placeholder="Enter physical address of the store..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_address')} className="button button-small">Save</button>
                  </div>
                </div>

                {/* Working Hours */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><ClockCircleOutlined />&nbsp;&nbsp;WORKING HOURS</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_working_hours')}
                      onChange={(e) => handleIdentityChange('shop_working_hours', e.target.value)}
                      placeholder="e.g. 8:00 AM - 10:00 PM (Daily)..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_working_hours')} className="button button-small">Save</button>
                  </div>
                </div>

              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

            {/* Group 3: Social Media Links */}
            <div>
              <h4 style={groupTitleStyle}>3. Social Media Links</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Facebook */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><FacebookOutlined style={{ color: '#1877f2' }} />&nbsp;&nbsp;FACEBOOK URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_facebook_url')}
                      onChange={(e) => handleIdentityChange('shop_facebook_url', e.target.value)}
                      placeholder="https://facebook.com/..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_facebook_url')} className="button button-small">Save</button>
                  </div>
                </div>

                {/* Instagram */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><InstagramOutlined style={{ color: '#e4405f' }} />&nbsp;&nbsp;INSTAGRAM URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_instagram_url')}
                      onChange={(e) => handleIdentityChange('shop_instagram_url', e.target.value)}
                      placeholder="https://instagram.com/..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_instagram_url')} className="button button-small">Save</button>
                  </div>
                </div>

                {/* TikTok */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><GlobalOutlined style={{ color: '#000' }} />&nbsp;&nbsp;TIKTOK URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_tiktok_url')}
                      onChange={(e) => handleIdentityChange('shop_tiktok_url', e.target.value)}
                      placeholder="https://tiktok.com/@..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_tiktok_url')} className="button button-small">Save</button>
                  </div>
                </div>

                {/* Zalo */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}><PhoneOutlined style={{ color: '#0068ff' }} />&nbsp;&nbsp;ZALO LINK</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={getIdentitySettingVal('shop_zalo_url')}
                      onChange={(e) => handleIdentityChange('shop_zalo_url', e.target.value)}
                      placeholder="https://zalo.me/..."
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => handleIdentitySave('shop_zalo_url')} className="button button-small">Save</button>
                  </div>
                </div>

              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

            {/* Group 4: Copyright */}
            <div>
              <h4 style={groupTitleStyle}>4. Copyright & Footer Copyright</h4>
              <div style={formGroupStyle}>
                <label style={labelStyle}><InfoCircleOutlined />&nbsp;&nbsp;COPYRIGHT STATEMENT (FOOTER)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={getIdentitySettingVal('shop_copyright')}
                    onChange={(e) => handleIdentityChange('shop_copyright', e.target.value)}
                    placeholder="e.g. © 2026 Salinaka Eyewear. All Rights Reserved."
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => handleIdentitySave('shop_copyright')} className="button button-small">Save</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Section 4: Custom Featured & Recommended Products ──────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {/* Section header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f5f5f5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <SettingOutlined style={{ fontSize: '18px', color: '#1a1a1a' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>
                Custom Featured & Recommended Products
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                Assign specific products to display on home/sub-pages instead of automated rules.
              </div>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Custom Featured */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                CUSTOM FEATURED PRODUCTS (COMMA-SEPARATED PRODUCT IDS)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={getIdentitySettingVal('featured_product_ids')}
                  onChange={(e) => handleIdentityChange('featured_product_ids', e.target.value)}
                  placeholder="e.g. 5e1b764c-b17a-4284-814d-91b5c928befd, 82d92956-6a3f-42e7-8178-5777328bf3c8..."
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => handleIdentitySave('featured_product_ids')}
                  className="button button-small"
                  disabled={saving['featured_product_ids']}
                >
                  Save
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                Enter product UUIDs separated by commas. If empty, the system defaults to products currently on sale.
              </div>
              {feedback['featured_product_ids'] && (
                <div style={{ ...feedbackStyle, color: feedback['featured_product_ids'].type === 'success' ? '#388e3c' : '#e53935' }}>
                  {feedback['featured_product_ids'].msg}
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

            {/* Custom Recommended */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                CUSTOM RECOMMENDED PRODUCTS (COMMA-SEPARATED PRODUCT IDS)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={getIdentitySettingVal('recommended_product_ids')}
                  onChange={(e) => handleIdentityChange('recommended_product_ids', e.target.value)}
                  placeholder="e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d, 9f8e7d6c-5b4a-3c2b-1a0f-9e8d7c6b5a4f..."
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => handleIdentitySave('recommended_product_ids')}
                  className="button button-small"
                  disabled={saving['recommended_product_ids']}
                >
                  Save
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                Enter product UUIDs separated by commas. If empty, the system automatically recommends the newest products.
              </div>
              {feedback['recommended_product_ids'] && (
                <div style={{ ...feedbackStyle, color: feedback['recommended_product_ids'].type === 'success' ? '#388e3c' : '#e53935' }}>
                  {feedback['recommended_product_ids'].msg}
                </div>
              )}
            </div>

            <div style={{
              background: '#fcf8e3',
              border: '1px solid #faebcc',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#8a6d3b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <InfoCircleOutlined />
              <span>
                <strong>💡 Tip:</strong> You can find and copy <strong>Product IDs</strong> directly from the <strong>Admin Product Catalog</strong> table (under Products list).
              </span>
            </div>
          </div>
        </div>

        <p style={{ color: '#bbb', fontSize: '11px', textAlign: 'right', paddingBottom: '16px' }}>
          All changes to display settings and brand identity will take effect immediately when the page is reloaded.
        </p>
      </div>
    </Boundary>
  );
};

// ─── Style Tokens ──────────────────────────────────────────────────────────
const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '700',
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  borderBottom: '2px solid #f0f0f0',
  background: '#fafafa',
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '13px',
  color: '#444',
  verticalAlign: 'middle',
};

const groupTitleStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderLeft: '3px solid #1a1a1a',
  paddingLeft: '8px'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#666',
  letterSpacing: '0.03em',
};

const inputStyle = {
  flex: 1,
  padding: '10px 14px',
  border: '1.5px solid #ddd',
  borderRadius: '6px',
  fontSize: '13px',
  outline: 'none',
  background: '#fafafa',
  transition: 'border-color .2s, background .2s',
  color: '#333'
};

const uploadBtnStyle = {
  padding: '8px 12px',
  border: '1px solid #1a1a1a',
  borderRadius: '4px',
  background: 'none',
  color: '#1a1a1a',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'background 0.2s',
};

const saveSubBtnStyle = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  background: '#e1e1e1',
  color: '#555',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
};

const feedbackStyle = {
  fontSize: '11px',
  fontWeight: '500',
  marginTop: '4px',
};

export default withRouter(AdminSettings);
