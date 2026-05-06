import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '@/services/api';

const VoucherSchema = Yup.object().shape({
  code: Yup.string()
    .required('Mã voucher không được để trống')
    .max(50, 'Tối đa 50 ký tự'),
  description: Yup.string().max(255, 'Tối đa 255 ký tự'),
  discountType: Yup.string().required('Chọn loại giảm giá').oneOf(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: Yup.number()
    .required('Nhập giá trị giảm giá')
    .positive('Phải lớn hơn 0'),
  minOrderAmount: Yup.number().min(0, 'Không được âm').nullable(),
  maxDiscountAmount: Yup.number().min(0, 'Không được âm').nullable(),
  usageLimit: Yup.number().integer().min(1, 'Tối thiểu 1').nullable(),
  perUserLimit: Yup.number().integer().min(1, 'Tối thiểu 1').nullable(),
  startDate: Yup.string().required('Chọn ngày bắt đầu'),
  endDate: Yup.string().required('Chọn ngày kết thúc'),
  isActive: Yup.boolean(),
  applicableTo: Yup.string().oneOf(['ALL', 'CATEGORY', 'PRODUCT']),
});

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const VoucherForm = ({ initialValues, onSubmit, isEdit }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getAllProducts(0, 100, '').then(data => {
      setProducts(data?.content || []);
    }).catch(() => {});
  }, []);

  const defaultValues = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '',
    startDate: '',
    endDate: '',
    isActive: true,
    applicableTo: 'ALL',
    applicableItemIds: [],
    ...initialValues,
    startDate: formatDateForInput(initialValues?.startDate),
    endDate: formatDateForInput(initialValues?.endDate),
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      code: values.code.toUpperCase(),
      description: values.description || null,
      discountType: values.discountType,
      discountValue: parseFloat(values.discountValue),
      minOrderAmount: values.minOrderAmount ? parseFloat(values.minOrderAmount) : 0,
      maxDiscountAmount: values.maxDiscountAmount ? parseFloat(values.maxDiscountAmount) : null,
      usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
      perUserLimit: values.perUserLimit ? parseInt(values.perUserLimit) : null,
      startDate: values.startDate,
      endDate: values.endDate,
      isActive: values.isActive,
      applicableTo: values.applicableTo,
      applicableItemIds: values.applicableTo !== 'ALL' ? values.applicableItemIds : [],
    };

    onSubmit(payload, setSubmitting);
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={VoucherSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form className="product-form">
          <div className="product-form-content">
            <div className="d-flex" style={{ gap: '20px', flexWrap: 'wrap' }}>
              {/* Code */}
              <div className="product-form-field" style={{ flex: '1', minWidth: '250px' }}>
                <label htmlFor="code">Mã Voucher *</label>
                <Field
                  name="code"
                  type="text"
                  className="input-form"
                  placeholder="VD: SALE50, NEWYEAR2026..."
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '2px' }}
                />
                <ErrorMessage name="code" component="span" className="text-danger text-micro" />
              </div>

              {/* Discount Type */}
              <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="discountType">Loại giảm giá *</label>
                <Field as="select" name="discountType" className="input-form">
                  <option value="PERCENTAGE">Phần trăm (%)</option>
                  <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                </Field>
                <ErrorMessage name="discountType" component="span" className="text-danger text-micro" />
              </div>

              {/* Discount Value */}
              <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="discountValue">
                  Giá trị giảm * {values.discountType === 'PERCENTAGE' ? '(%)' : '(VND)'}
                </label>
                <Field
                  name="discountValue"
                  type="number"
                  className="input-form"
                  placeholder={values.discountType === 'PERCENTAGE' ? 'VD: 20' : 'VD: 50000'}
                  min="0"
                  max={values.discountType === 'PERCENTAGE' ? 100 : undefined}
                />
                <ErrorMessage name="discountValue" component="span" className="text-danger text-micro" />
              </div>
            </div>

            {/* Description */}
            <div className="product-form-field" style={{ marginTop: '16px' }}>
              <label htmlFor="description">Mô tả</label>
              <Field
                as="textarea"
                name="description"
                className="input-form"
                placeholder="VD: Giảm 20% cho đơn hàng từ 500K..."
                rows="2"
              />
              <ErrorMessage name="description" component="span" className="text-danger text-micro" />
            </div>

            {/* Conditions Row */}
            <div className="d-flex" style={{ gap: '20px', flexWrap: 'wrap', marginTop: '16px' }}>
              <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="minOrderAmount">Đơn tối thiểu (VND)</label>
                <Field name="minOrderAmount" type="number" className="input-form" placeholder="0" min="0" />
              </div>

              {values.discountType === 'PERCENTAGE' && (
                <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                  <label htmlFor="maxDiscountAmount">Giảm tối đa (VND)</label>
                  <Field name="maxDiscountAmount" type="number" className="input-form" placeholder="VD: 100000" min="0" />
                </div>
              )}

              <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="usageLimit">Tổng lượt sử dụng</label>
                <Field name="usageLimit" type="number" className="input-form" placeholder="Unlimited" min="1" />
              </div>

              <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="perUserLimit">Lượt/người dùng</label>
                <Field name="perUserLimit" type="number" className="input-form" placeholder="Unlimited" min="1" />
              </div>
            </div>

            {/* Date Range */}
            <div className="d-flex" style={{ gap: '20px', flexWrap: 'wrap', marginTop: '16px' }}>
              <div className="product-form-field" style={{ flex: '1', minWidth: '250px' }}>
                <label htmlFor="startDate">Ngày bắt đầu *</label>
                <Field name="startDate" type="datetime-local" className="input-form" />
                <ErrorMessage name="startDate" component="span" className="text-danger text-micro" />
              </div>
              <div className="product-form-field" style={{ flex: '1', minWidth: '250px' }}>
                <label htmlFor="endDate">Ngày kết thúc *</label>
                <Field name="endDate" type="datetime-local" className="input-form" />
                <ErrorMessage name="endDate" component="span" className="text-danger text-micro" />
              </div>
            </div>

            {/* Targeting */}
            <div className="d-flex" style={{ gap: '20px', flexWrap: 'wrap', marginTop: '16px', alignItems: 'flex-start' }}>
              <div className="product-form-field" style={{ flex: '1', minWidth: '200px' }}>
                <label htmlFor="applicableTo">Áp dụng cho</label>
                <Field as="select" name="applicableTo" className="input-form">
                  <option value="ALL">Tất cả sản phẩm</option>
                  <option value="CATEGORY">Danh mục cụ thể</option>
                  <option value="PRODUCT">Sản phẩm cụ thể</option>
                </Field>
              </div>

              {values.applicableTo === 'CATEGORY' && (
                <div className="product-form-field" style={{ flex: '2', minWidth: '300px' }}>
                  <label>Chọn danh mục</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                    {categories.map(cat => (
                      <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', backgroundColor: values.applicableItemIds.includes(cat.id) ? '#e3f2fd' : '#f5f5f5' }}>
                        <input
                          type="checkbox"
                          checked={values.applicableItemIds.includes(cat.id)}
                          onChange={(e) => {
                            const ids = e.target.checked
                              ? [...values.applicableItemIds, cat.id]
                              : values.applicableItemIds.filter(id => id !== cat.id);
                            setFieldValue('applicableItemIds', ids);
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {values.applicableTo === 'PRODUCT' && (
                <div className="product-form-field" style={{ flex: '2', minWidth: '300px' }}>
                  <label>Chọn sản phẩm</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                    {products.map(prod => (
                      <label key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', backgroundColor: values.applicableItemIds.includes(prod.id) ? '#e3f2fd' : '#f5f5f5' }}>
                        <input
                          type="checkbox"
                          checked={values.applicableItemIds.includes(prod.id)}
                          onChange={(e) => {
                            const ids = e.target.checked
                              ? [...values.applicableItemIds, prod.id]
                              : values.applicableItemIds.filter(id => id !== prod.id);
                            setFieldValue('applicableItemIds', ids);
                          }}
                        />
                        {prod.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div className="product-form-field" style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Field type="checkbox" name="isActive" />
                Kích hoạt voucher
              </label>
            </div>

            {/* Submit */}
            <div style={{ marginTop: '24px' }}>
              <button
                className="button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (isEdit ? 'Update Voucher' : 'Create Voucher')}
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

VoucherForm.propTypes = {
  initialValues: PropType.object,
  onSubmit: PropType.func.isRequired,
  isEdit: PropType.bool,
};

VoucherForm.defaultProps = {
  initialValues: {},
  isEdit: false,
};

export default VoucherForm;
