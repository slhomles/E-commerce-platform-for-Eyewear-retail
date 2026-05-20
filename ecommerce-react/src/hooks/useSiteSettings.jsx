import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await api.getPublicSettings();
      const settingsObj = {};
      data.forEach((s) => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);

      // Cập nhật favicon động trên tab trình duyệt
      if (settingsObj.shop_favicon_url) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = settingsObj.shop_favicon_url;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } catch (error) {
      console.error('Failed to fetch public site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export default useSiteSettings;
