import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { SettingOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '@/services/api';

// Human-readable labels for each setting key
const SETTING_META = {
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
    description: 'Number of products loaded per page on the /shop page. Users can click "Show More" to load the next batch.',
    page: '/shop',
  },
};

const SettingsNavbar = ({ settingsCount }) => (
  <div className="product-admin-header">
    <h3 className="product-admin-header-title">
      Display Settings &nbsp;({settingsCount} settings)
    </h3>
    <span style={{ fontSize: '13px', color: '#999' }}>
      Control how many products appear on each page &nbsp;·&nbsp; Valid range: <strong>5 – 20</strong>
    </span>
  </div>
);

const AdminSettings = () => {
  useDocumentTitle('Display Settings | Admin');
  useScrollTop();

  const [settings, setSettings] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [localValues, setLocalValues] = useState({});
  const [saving, setSaving] = useState({});
  const [feedback, setFeedback] = useState({}); // { key: { type: 'success'|'error', msg } }

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, val) => {
    setLocalValues((prev) => ({ ...prev, [key]: val }));
    setFeedback((prev) => ({ ...prev, [key]: null }));
  };

  const handleSave = async (setting) => {
    const rawVal = localValues[setting.key];
    const num = parseInt(rawVal, 10);

    if (isNaN(num)) {
      setFeedback((prev) => ({ ...prev, [setting.key]: { type: 'error', msg: 'Please enter a valid integer.' } }));
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
      // Update original value in settings list
      setSettings((prev) => prev.map((s) => s.key === setting.key ? { ...s, value: String(num) } : s));
      setFeedback((prev) => ({ ...prev, [setting.key]: { type: 'success', msg: 'Saved successfully.' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [setting.key]: null })), 3000);
    } catch (e) {
      setFeedback((prev) => ({
        ...prev,
        [setting.key]: { type: 'error', msg: e?.data?.message || e?.message || 'Failed to save.' }
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [setting.key]: false }));
    }
  };

  const handleReset = (setting) => {
    setLocalValues((prev) => ({ ...prev, [setting.key]: setting.value }));
    setFeedback((prev) => ({ ...prev, [setting.key]: null }));
  };

  return (
    <Boundary>
      {/* Loading overlay */}
      <div className="loader" style={{ display: isLoading ? 'flex' : 'none' }}>
        <div className="loader-renderer" />
      </div>

      {/* Page Navbar — matches other admin pages */}
      <SettingsNavbar settingsCount={settings.length} />

      {/* Content area — matches other admin pages */}
      <div className="product-admin-items">

        {/* Settings Table */}
        <table className="table table-hover" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Page</th>
              <th style={thStyle}>Setting</th>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '140px' }}>Value ({settings[0]?.minValue ?? 5}–{settings[0]?.maxValue ?? 20})</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => {
              const meta = SETTING_META[setting.key] || {};
              const isSaving = saving[setting.key];
              const val = localValues[setting.key] ?? setting.value;
              const isDirty = val !== setting.value;
              const fb = feedback[setting.key];

              return (
                <tr key={setting.key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {/* Page column */}
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

                  {/* Label column */}
                  <td style={tdStyle}>
                    <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>
                      {meta.label || setting.key}
                    </span>
                  </td>

                  {/* Description column */}
                  <td style={{ ...tdStyle, color: '#888', fontSize: '12px', maxWidth: '300px' }}>
                    {meta.description || setting.description}
                  </td>

                  {/* Value input column */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <input
                        id={`setting-input-${setting.key}`}
                        type="number"
                        min={setting.minValue}
                        max={setting.maxValue}
                        value={val}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
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
                    </div>
                    {/* Feedback inline */}
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
                        {fb.type === 'success'
                          ? <CheckCircleOutlined />
                          : <CloseCircleOutlined />}
                        {fb.msg}
                      </div>
                    )}
                  </td>

                  {/* Actions column */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        id={`btn-save-${setting.key}`}
                        className="button button-small"
                        type="button"
                        disabled={isSaving || !isDirty}
                        onClick={() => handleSave(setting)}
                        style={{ opacity: (!isDirty || isSaving) ? 0.45 : 1 }}
                      >
                        <SaveOutlined />
                        &nbsp;{isSaving ? 'Saving...' : 'Save'}
                      </button>
                      {isDirty && (
                        <button
                          className="button button-small button-muted"
                          type="button"
                          onClick={() => handleReset(setting)}
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

        {/* Empty state */}
        {!isLoading && settings.length === 0 && (
          <div className="loader" style={{ minHeight: '30vh' }}>
            <SettingOutlined style={{ fontSize: '32px', color: '#ccc' }} />
            <h6 style={{ color: '#ccc', marginTop: '12px' }}>No settings found.</h6>
          </div>
        )}

        {/* Footer note */}
        <p style={{ marginTop: '24px', color: '#bbb', fontSize: '11px', textAlign: 'right', paddingBottom: '16px' }}>
          Changes take effect immediately on the next page load by website visitors.
        </p>
      </div>
    </Boundary>
  );
};

// Shared cell styles
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
