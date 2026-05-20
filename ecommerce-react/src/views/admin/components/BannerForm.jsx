import { Modal } from '@/components/common';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const linkTypeOptions = [
  { value: 'PRODUCT', label: 'Specific Product' },
  { value: 'CATEGORY', label: 'Product Category' },
  { value: 'CUSTOM_URL', label: 'Custom URL' },
];

const formatForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkType: 'CUSTOM_URL',
  linkValue: '',
  position: 0,
  startDate: '',
  endDate: '',
  displayStyle: 'IMAGE',
  tag: '',
  highlight: '',
  bgColor: '#E91E8C',
  textColor: '#ffffff',
  ctaText: 'SHOP NOW',
  titleFontSize: 36,
  subtitleFontSize: 18,
  horizontalAlignment: 'CENTER',
  verticalAlignment: 'BOTTOM',
  fontFamily: "'Tajawal', Helvetica, Arial, sans-serif",
};

const BannerForm = ({ banner, isOpen, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!banner?.id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl || '',
        linkType: banner.linkType || 'CUSTOM_URL',
        linkValue: banner.linkValue || '',
        position: banner.position ?? 0,
        startDate: formatForInput(banner.startDate),
        endDate: formatForInput(banner.endDate),
        displayStyle: banner.displayStyle || 'IMAGE',
        tag: banner.tag || '',
        highlight: banner.highlight || '',
        bgColor: banner.bgColor || '#E91E8C',
        textColor: banner.textColor || '#ffffff',
        ctaText: banner.ctaText || 'SHOP NOW',
        titleFontSize: banner.titleFontSize || 36,
        subtitleFontSize: banner.subtitleFontSize || 18,
        horizontalAlignment: banner.horizontalAlignment || 'CENTER',
        verticalAlignment: banner.verticalAlignment || 'BOTTOM',
        fontFamily: banner.fontFamily || "'Tajawal', Helvetica, Arial, sans-serif",
      });
      setImagePreview(banner.imageUrl || '');
    } else {
      setForm(EMPTY_FORM);
      setImagePreview('');
      setErrors({});
    }
  }, [banner, isOpen]);

  useEffect(() => {
    if (form.linkType === 'PRODUCT' && products.length === 0) {
      api.getAllProducts(0, 100).then(data => setProducts(data?.content || [])).catch(console.error);
    }
    if (form.linkType === 'CATEGORY' && categories.length === 0) {
      api.getCategories().then(data => setCategories(data || [])).catch(console.error);
    }
  }, [form.linkType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const url = await api.storeImage(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.imageUrl.trim()) errs.imageUrl = 'Please upload a banner image';
    if (!form.linkValue.trim()) errs.linkValue = 'Link value is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      position: parseInt(form.position, 10) || 0,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    });
  };

  const isPromo = form.displayStyle === 'PROMO';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      overrideStyle={{ width: '700px', maxHeight: '92vh', overflow: 'auto', padding: '0' }}
    >
      <div className="product-form-container">
        <h3>{isEditing ? 'Edit Banner' : 'Add New Banner'}</h3>
        <br />
        <form onSubmit={handleSubmit}>

          {/* Display Style Toggle */}
          <div className="input-group">
            <label className="label">Display Style *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { value: 'IMAGE', label: 'Image Slide', desc: 'Full-width photo' },
                { value: 'PROMO', label: 'Promo Slide', desc: 'Split layout with text panel' },
              ].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: `2px solid ${form.displayStyle === opt.value ? '#3f51b5' : '#ddd'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: form.displayStyle === opt.value ? '#f0f3ff' : '#fafafa',
                    transition: 'all .2s',
                  }}
                >
                  <input
                    type="radio"
                    name="displayStyle"
                    value={opt.value}
                    checked={form.displayStyle === opt.value}
                    onChange={handleChange}
                    style={{ accentColor: '#3f51b5' }}
                  />
                  <span>
                    <strong style={{ display: 'block', fontSize: '13px' }}>{opt.label}</strong>
                    <span style={{ fontSize: '11px', color: '#888' }}>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="input-group">
            <label className="label">
              {isPromo ? 'Product Image * (left half)' : 'Banner Image *'}
            </label>
            <div
              style={{
                border: `2px dashed ${errors.imageUrl ? '#f44336' : '#ddd'}`,
                borderRadius: '8px', padding: '16px', textAlign: 'center',
                background: '#fafafa', cursor: 'pointer', position: 'relative',
              }}
            >
              {imagePreview ? (
                <img
                  alt="Preview"
                  src={imagePreview}
                  style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <span style={{ color: '#aaa' }}>
                  {isPromo
                    ? 'Click or drag & drop — Product photo for left side'
                    : 'Click or drag & drop — Recommended: 1600 × 500px'}
                </span>
              )}
              <input
                accept="image/*"
                onChange={handleImageUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                type="file"
              />
              {uploading && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
                }}>
                  <span>Uploading...</span>
                </div>
              )}
            </div>
            {errors.imageUrl && <span className="input-message">{errors.imageUrl}</span>}
          </div>

          {/* Title */}
          <div className="input-group">
            <label className="label" htmlFor="title">
              {isPromo ? 'Script Title * (e.g. Women\'s Day)' : 'Title *'}
            </label>
            <input
              className={`input-form${errors.title ? ' input-error' : ''}`}
              id="title"
              name="title"
              onChange={handleChange}
              placeholder={isPromo ? "e.g. Women's Day" : 'e.g. Summer Beach Collection 2026'}
              type="text"
              value={form.title}
            />
            {errors.title && <span className="input-message">{errors.title}</span>}
          </div>

          {/* Promo-specific fields */}
          {isPromo && (
            <>
              <div className="input-group">
                <label className="label" htmlFor="tag">Tag Label (optional)</label>
                <input
                  className="input-form"
                  id="tag"
                  name="tag"
                  onChange={handleChange}
                  placeholder="e.g. INTERNATIONAL"
                  type="text"
                  value={form.tag}
                />
                <span style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
                  Small uppercase label shown above the title
                </span>
              </div>

              <div className="input-group">
                <label className="label" htmlFor="highlight">Highlight Text (optional)</label>
                <input
                  className="input-form"
                  id="highlight"
                  name="highlight"
                  onChange={handleChange}
                  placeholder="e.g. SALE"
                  type="text"
                  value={form.highlight}
                />
                <span style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
                  Giant bold text shown below the title
                </span>
              </div>

              <div className="input-group">
                <label className="label" htmlFor="subtitle">Subtitle (optional)</label>
                <input
                  className="input-form"
                  id="subtitle"
                  name="subtitle"
                  onChange={handleChange}
                  placeholder="e.g. BUY 1 GET 1"
                  type="text"
                  value={form.subtitle}
                />
              </div>

              <div className="input-group">
                <label className="label" htmlFor="ctaText">Button Label</label>
                <input
                  className="input-form"
                  id="ctaText"
                  name="ctaText"
                  onChange={handleChange}
                  placeholder="e.g. SHOP NOW"
                  style={{ width: '200px' }}
                  type="text"
                  value={form.ctaText}
                />
              </div>

              <div className="input-group">
                <label className="label">Panel Colors</label>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input
                      name="bgColor"
                      onChange={handleChange}
                      style={{ width: '40px', height: '36px', padding: '2px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}
                      type="color"
                      value={form.bgColor}
                    />
                    Background
                    <span style={{ color: '#888', fontSize: '11px' }}>{form.bgColor}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input
                      name="textColor"
                      onChange={handleChange}
                      style={{ width: '40px', height: '36px', padding: '2px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}
                      type="color"
                      value={form.textColor}
                    />
                    Text
                    <span style={{ color: '#888', fontSize: '11px' }}>{form.textColor}</span>
                  </label>
                  {/* Live mini-preview */}
                  <div style={{
                    marginLeft: 'auto', width: '100px', height: '60px',
                    background: form.bgColor, borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '900', color: form.textColor,
                    letterSpacing: '.06em',
                  }}>
                    {form.highlight || 'SALE'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Subtitle for IMAGE style */}
          {!isPromo && (
            <>
              <div className="input-group">
                <label className="label" htmlFor="subtitle">Subtitle (optional)</label>
                <input
                  className="input-form"
                  id="subtitle"
                  name="subtitle"
                  onChange={handleChange}
                  placeholder="e.g. Up to 50% off all sunglasses"
                  type="text"
                  value={form.subtitle}
                />
              </div>

              {/* Text Style Customizations */}
              <div style={{ padding: '16px', background: '#f8f8f8', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 'bold' }}>Text Appearance & Position</h4>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label" style={{ fontSize: '12px' }}>Horizontal Align</label>
                    <select className="input-form" name="horizontalAlignment" value={form.horizontalAlignment} onChange={handleChange}>
                      <option value="LEFT">Trái (Left)</option>
                      <option value="CENTER">Giữa (Center)</option>
                      <option value="RIGHT">Phải (Right)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label" style={{ fontSize: '12px' }}>Vertical Align</label>
                    <select className="input-form" name="verticalAlignment" value={form.verticalAlignment} onChange={handleChange}>
                      <option value="TOP">Trên (Top)</option>
                      <option value="CENTER">Giữa (Middle)</option>
                      <option value="BOTTOM">Dưới (Bottom)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label" style={{ fontSize: '12px' }}>Title Size (px)</label>
                    <input className="input-form" type="number" name="titleFontSize" value={form.titleFontSize} onChange={handleChange} min="10" max="120" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label" style={{ fontSize: '12px' }}>Subtitle Size (px)</label>
                    <input className="input-form" type="number" name="subtitleFontSize" value={form.subtitleFontSize} onChange={handleChange} min="10" max="100" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 2 }}>
                    <label className="label" style={{ fontSize: '12px' }}>Font Style</label>
                    <select className="input-form" name="fontFamily" value={form.fontFamily} onChange={handleChange}>
                      <option value="'Tajawal', Helvetica, Arial, sans-serif">Tajawal (Default)</option>
                      <option value="'Montserrat', sans-serif">Montserrat (Modern)</option>
                      <option value="'Dancing Script', cursive">Dancing Script (Elegant)</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label" style={{ fontSize: '12px' }}>Text Color</label>
                    <input className="input-form" type="color" name="textColor" value={form.textColor} onChange={handleChange} style={{ height: '40px', padding: '2px', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Link Type */}
          <div className="input-group">
            <label className="label">Link Type *</label>
            <select
              className="input-form"
              name="linkType"
              onChange={(e) => {
                setForm(prev => ({ ...prev, linkType: e.target.value, linkValue: '' }));
              }}
              value={form.linkType}
            >
              {linkTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Link Value */}
          <div className="input-group">
            <label className="label" htmlFor="linkValue">
              {form.linkType === 'PRODUCT' ? 'Select Product *'
                : form.linkType === 'CATEGORY' ? 'Select Category *'
                : 'Enter URL *'}
            </label>
            {form.linkType === 'PRODUCT' ? (
              <select
                className={`input-form${errors.linkValue ? ' input-error' : ''}`}
                name="linkValue"
                onChange={handleChange}
                value={form.linkValue}
              >
                <option value="">-- Select a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.brandName ? ` (${p.brandName})` : ''}
                  </option>
                ))}
              </select>
            ) : form.linkType === 'CATEGORY' ? (
              <select
                className={`input-form${errors.linkValue ? ' input-error' : ''}`}
                name="linkValue"
                onChange={handleChange}
                value={form.linkValue}
              >
                <option value="">-- Select a category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input
                className={`input-form${errors.linkValue ? ' input-error' : ''}`}
                name="linkValue"
                onChange={handleChange}
                placeholder="e.g. /shop?brand=RayBan or /featured"
                type="text"
                value={form.linkValue}
              />
            )}
            {errors.linkValue && <span className="input-message">{errors.linkValue}</span>}
          </div>

          {/* Start Date */}
          <div className="input-group">
            <label className="label" htmlFor="startDate">Start Date *</label>
            <input
              className={`input-form${errors.startDate ? ' input-error' : ''}`}
              id="startDate"
              name="startDate"
              onChange={handleChange}
              type="datetime-local"
              value={form.startDate}
            />
            {errors.startDate && <span className="input-message">{errors.startDate}</span>}
          </div>

          {/* End Date */}
          <div className="input-group">
            <label className="label" htmlFor="endDate">End Date *</label>
            <input
              className={`input-form${errors.endDate ? ' input-error' : ''}`}
              id="endDate"
              name="endDate"
              onChange={handleChange}
              type="datetime-local"
              value={form.endDate}
            />
            {errors.endDate && <span className="input-message">{errors.endDate}</span>}
          </div>

          {/* Position */}
          <div className="input-group">
            <label className="label" htmlFor="position">Display Position</label>
            <input
              className="input-form"
              id="position"
              min="0"
              name="position"
              onChange={handleChange}
              style={{ width: '120px' }}
              type="number"
              value={form.position}
            />
          </div>

          {/* Actions */}
          <div className="edit-user-action">
            <button
              className="button button-muted button-small"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="button button-small"
              disabled={isLoading || uploading}
              type="submit"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Banner' : 'Add Banner'}
            </button>
          </div>

        </form>
      </div>
    </Modal>
  );
};

BannerForm.defaultProps = {
  banner: null,
  isLoading: false,
};

BannerForm.propTypes = {
  banner: PropType.shape({
    id: PropType.string,
    title: PropType.string,
    subtitle: PropType.string,
    imageUrl: PropType.string,
    linkType: PropType.string,
    linkValue: PropType.string,
    position: PropType.number,
    startDate: PropType.string,
    endDate: PropType.string,
    displayStyle: PropType.string,
    tag: PropType.string,
    highlight: PropType.string,
    bgColor: PropType.string,
    textColor: PropType.string,
    ctaText: PropType.string,
    horizontalAlignment: PropType.string,
    verticalAlignment: PropType.string,
    titleFontSize: PropType.number,
    subtitleFontSize: PropType.number,
    fontFamily: PropType.string,
  }),
  isLoading: PropType.bool,
  isOpen: PropType.bool.isRequired,
  onCancel: PropType.func.isRequired,
  onSubmit: PropType.func.isRequired,
};

export default BannerForm;
