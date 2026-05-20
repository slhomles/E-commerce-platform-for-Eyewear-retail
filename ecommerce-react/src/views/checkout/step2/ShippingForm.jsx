/* eslint-disable jsx-a11y/label-has-associated-control */
import { CustomInput, CustomMobileInput, CustomSelect } from '@/components/formik';
import { Field, useFormikContext } from 'formik';
import React, { useState, useEffect, useRef } from 'react';

const ShippingForm = () => {
  const { values, setFieldValue } = useFormikContext();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Fetch provinces
  useEffect(() => {
    if (values.isInternational) return;

    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        const formatted = data.map((item) => ({
          value: String(item.code),
          label: item.name
        }));
        setProvinces(formatted);
      } catch (err) {
        console.error('Lỗi khi tải danh sách tỉnh thành:', err);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, [values.isInternational]);

  // Fetch districts when provinceCode changes
  useEffect(() => {
    if (values.isInternational || !values.provinceCode) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${values.provinceCode}?depth=2`);
        const data = await response.json();
        if (data && data.districts) {
          const formatted = data.districts.map((item) => ({
            value: String(item.code),
            label: item.name
          }));
          setDistricts(formatted);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách quận huyện:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [values.provinceCode, values.isInternational]);

  // Fetch wards when districtCode changes
  useEffect(() => {
    if (values.isInternational || !values.districtCode) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${values.districtCode}?depth=2`);
        const data = await response.json();
        if (data && data.wards) {
          const formatted = data.wards.map((item) => ({
            value: String(item.code),
            label: item.name
          }));
          setWards(formatted);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách phường xã:', err);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [values.districtCode, values.isInternational]);

  // Synchronize provinceName when provinceCode changes
  useEffect(() => {
    if (values.provinceCode && provinces.length > 0) {
      const selected = provinces.find((p) => p.value === values.provinceCode);
      if (selected && selected.label !== values.provinceName) {
        setFieldValue('provinceName', selected.label);
      }
    }
  }, [values.provinceCode, provinces, values.provinceName, setFieldValue]);

  // Synchronize districtName when districtCode changes
  useEffect(() => {
    if (values.districtCode && districts.length > 0) {
      const selected = districts.find((d) => d.value === values.districtCode);
      if (selected && selected.label !== values.districtName) {
        setFieldValue('districtName', selected.label);
      }
    }
  }, [values.districtCode, districts, values.districtName, setFieldValue]);

  // Synchronize wardName when wardCode changes
  useEffect(() => {
    if (values.wardCode && wards.length > 0) {
      const selected = wards.find((w) => w.value === values.wardCode);
      if (selected && selected.label !== values.wardName) {
        setFieldValue('wardName', selected.label);
      }
    }
  }, [values.wardCode, wards, values.wardName, setFieldValue]);

  // Reset districtCode and wardCode when provinceCode changes
  const prevProvinceCodeRef = useRef(values.provinceCode);
  useEffect(() => {
    if (prevProvinceCodeRef.current !== values.provinceCode) {
      setFieldValue('provinceName', '');
      setFieldValue('districtCode', '');
      setFieldValue('districtName', '');
      setFieldValue('wardCode', '');
      setFieldValue('wardName', '');
      prevProvinceCodeRef.current = values.provinceCode;
    }
  }, [values.provinceCode, setFieldValue]);

  // Reset wardCode when districtCode changes
  const prevDistrictCodeRef = useRef(values.districtCode);
  useEffect(() => {
    if (prevDistrictCodeRef.current !== values.districtCode) {
      setFieldValue('districtName', '');
      setFieldValue('wardCode', '');
      setFieldValue('wardName', '');
      prevDistrictCodeRef.current = values.districtCode;
    }
  }, [values.districtCode, setFieldValue]);

  return (
    <div className="checkout-shipping-wrapper">
      <div className="checkout-shipping-form">
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <Field
              name="fullname"
              type="text"
              label="* Full Name"
              placeholder="Enter your full name"
              component={CustomInput}
              style={{ textTransform: 'capitalize' }}
            />
          </div>
          <div className="d-block checkout-field">
            <Field
              name="email"
              type="email"
              label="* Email Address"
              placeholder="Enter your email address"
              component={CustomInput}
            />
          </div>
        </div>

        {/* Shipping Address fields */}
        {values.isInternational ? (
          <div className="checkout-fieldset">
            <div className="d-block checkout-field" style={{ width: '100%' }}>
              <Field
                name="address"
                type="text"
                label="* Shipping Address"
                placeholder="Enter full shipping address"
                component={CustomInput}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="checkout-fieldset">
              <div className="d-block checkout-field">
                <Field
                  name="provinceCode"
                  label="* Tỉnh / Thành phố"
                  placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh / Thành phố"}
                  disabled={loadingProvinces || provinces.length === 0}
                  options={provinces}
                  component={CustomSelect}
                />
              </div>
              <div className="d-block checkout-field">
                <Field
                  name="districtCode"
                  label="* Quận / Huyện"
                  placeholder={loadingDistricts ? "Đang tải..." : "Chọn Quận / Huyện"}
                  disabled={loadingDistricts || !values.provinceCode || districts.length === 0}
                  options={districts}
                  component={CustomSelect}
                />
              </div>
            </div>
            
            <div className="checkout-fieldset">
              <div className="d-block checkout-field">
                <Field
                  name="wardCode"
                  label="* Phường / Xã"
                  placeholder={loadingWards ? "Đang tải..." : "Chọn Phường / Xã"}
                  disabled={loadingWards || !values.districtCode || wards.length === 0}
                  options={wards}
                  component={CustomSelect}
                />
              </div>
              <div className="d-block checkout-field">
                <Field
                  name="streetAddress"
                  type="text"
                  label="* Địa chỉ chi tiết"
                  placeholder="Số nhà, ngõ ngách, tên đường..."
                  component={CustomInput}
                />
              </div>
            </div>
          </>
        )}

        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <CustomMobileInput name="mobile" defaultValue={values.mobile} />
          </div>
          <div className="d-block checkout-field" />
        </div>

        <div className="checkout-fieldset">
          <Field name="isInternational">
            {({ field, form, meta }) => (
              <div className="checkout-field">
                {meta.touched && meta.error ? (
                  <span className="label-input label-error">{meta.error}</span>
                ) : (
                  <label className="label-input" htmlFor={field.name}>
                    Shipping Option
                  </label>
                )}
                <div className="checkout-checkbox-field">
                  <input
                    checked={field.value}
                    id={field.name}
                    onChange={(e) => {
                      form.setValues({ ...form.values, [field.name]: e.target.checked });
                    }}
                    value={meta.value}
                    type="checkbox"
                  />
                  <label className="d-flex w-100" htmlFor={field.name}>
                    <h5 className="d-flex-grow-1 margin-0">
                      &nbsp; International Shipping &nbsp;
                      <span className="text-subtle">7-14 days</span>
                    </h5>
                    <h4 className="margin-0">50.000 ₫</h4>
                  </label>
                </div>
              </div>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
