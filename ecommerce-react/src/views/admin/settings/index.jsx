import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  SettingOutlined, SaveOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, EyeInvisibleOutlined,
  TagOutlined, DollarOutlined, PercentageOutlined,
} from '@ant-design/icons';
import api from '@/services/api';

const NUMERIC_META = {
  home_featured_count: {
    label: 'Home — Featured Products Count',
    description: 'Number of featured products shown in the "Featured Products" section on the Home page.',
    page: 'Home Page',
  },
  home_recommended_count: {
    label: 'Home — Recommended Products Count',
    description: 'Number of recommended products shown in the "Recommended Products" section on the Home page.',
    page: 'Home Page',
  },
  featured_page_count: {
    label: 'Featured Page — Products Count',
    description: 'Total number of featured products displayed on the /featured page.',
    page: '/featured',
  },
  recommended_page_count: {
    label: 'Recommended Page — Products Count',
    description: 'Total number of recommended products displayed on the /recommended page.',
    page: '/recommended',
  },
  shop_page_size: {
    label: 'Shop Page — Products Per Page',
    description: 'Number of products loaded per page on the /shop page.',
    page: '/shop',
  },
};

const PRICE_TOGGLE_META = {
  show_original_price: {
    label: 'Giá gốc',
    description: 'Hiển thị giá gốc (gạch ngang) phía trên giá khuyến mãi.',
    icon: <TagOutlined />,
  },
  show_sale_price: {
    label: 'Giá khuyến mãi',
    description: 'Hiển thị giá bán / giá sau khuyến mãi trên card sản phẩm.',
    icon: <DollarOutlined />,
  },
  show_discount_badge: {
    label: '% Giảm giá',
    description: 'Hiển thị nhãn đỏ phần trăm giảm giá góc trên-trái của card.',
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
      Display Settings &nbsp;({total} settings)
    </h3>
    <span style={{ fontSize: '13px', color: '#999' }}>
      Quản lý hiển thị sản phẩm và thông tin giá trên toàn hệ thống
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
      setFeedback((prev) => ({ ...prev, [setting.key]: { type: 'error', msg: 'Vui lòng nhập số nguyên.' } }));
      return;
    }
    if (num < setting.minValue || num > setting.maxValue) {
      setFeedback((prev) => ({
        ...prev,
        [setting.key]: { type: 'error', msg: `Giá trị phải từ ${setting.minValue} đến ${setting.maxValue}.` }
      }));
      return;
    }
    setSaving((prev) => ({ ...prev, [setting.key]: true }));
    try {
      await api.updateSetting(setting.key, num);
      setSettings((prev) => prev.map((s) => s.key === setting.key ? { ...s, value: String(num) } : s));
      setFeedback((prev) => ({ ...prev, [setting.key]: { type: 'success', msg: 'Đã lưu.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [setting.key]: null })), 3000);
    } catch (e) {
      setFeedback((prev) => ({
        ...prev,
        [setting.key]: { type: 'error', msg: e?.data?.message || e?.message || 'Lưu thất bại.' }
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
      setFeedback((prev) => ({ ...prev, [key]: { type: 'success', msg: 'Đã lưu.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [key]: null })), 2000);
    } catch (e) {
      // revert on error
      setLocalValues((prev) => ({ ...prev, [key]: String(!newBool) }));
      setFeedback((prev) => ({ ...prev, [key]: { type: 'error', msg: 'Lưu thất bại.' } }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ── Split settings into two groups ──────────────────────────────────────
  const numericSettings = settings.filter((s) => s.minValue != null || s.maxValue != null);
  const booleanSettings = settings.filter((s) => s.minValue == null && s.maxValue == null);

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
                Hiển thị giá trên card sản phẩm
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                Áp dụng cho trang Shop và trang Featured · Thay đổi có hiệu lực ngay lập tức
              </div>
            </div>
          </div>

          {/* Toggle rows */}
          {booleanSettings.length === 0 && !isLoading && (
            <div style={{ padding: '20px', color: '#bbb', fontSize: '13px' }}>
              Không tìm thấy cài đặt hiển thị giá.
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
                  {isOn ? 'BẬT' : 'TẮT'}
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
            <SettingOutlined style={{ fontSize: '16px', color: '#1a1a1a' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>
                Số lượng sản phẩm hiển thị
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                Giá trị hợp lệ: <strong>5 – 20</strong> sản phẩm
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Trang</th>
                <th style={thStyle}>Cài đặt</th>
                <th style={thStyle}>Mô tả</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '130px' }}>Giá trị</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Hành động</th>
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
                          <SaveOutlined />&nbsp;{isSaving ? 'Đang lưu...' : 'Lưu'}
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

          {!isLoading && numericSettings.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#ccc' }}>
              <SettingOutlined style={{ fontSize: '28px' }} />
              <p style={{ marginTop: '8px' }}>Không tìm thấy cài đặt.</p>
            </div>
          )}
        </div>

        <p style={{ color: '#bbb', fontSize: '11px', textAlign: 'right', paddingBottom: '16px' }}>
          Thay đổi có hiệu lực ngay lập tức khi khách hàng tải lại trang.
        </p>
      </div>
    </Boundary>
  );
};

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

export default withRouter(AdminSettings);
