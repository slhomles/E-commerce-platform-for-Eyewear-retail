/* eslint-disable jsx-a11y/label-has-associated-control */
import { CustomInput, CustomMobileInput, CustomSelect } from '@/components/formik';
import { Field, useFormikContext } from 'formik';
import React, { useState, useEffect, useRef } from 'react';
import { displayMoney } from '@/helpers/utils';

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
        console.error('Failed to load provinces:', err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when provinceCode changes
  useEffect(() => {
    if (!values.provinceCode) {
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
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [values.provinceCode]);

  // Fetch wards when districtCode changes
  useEffect(() => {
    if (!values.districtCode) {
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
        console.error('Failed to load wards:', err);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [values.districtCode]);

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

        {/* Full Name & Email */}
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

        {/* Province & District */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <CustomSelect
              name="provinceCode"
              label="* Province / City"
              placeholder={loadingProvinces ? 'Loading...' : 'Select province / city'}
              disabled={loadingProvinces || provinces.length === 0}
              options={provinces}
            />
          </div>
          <div className="d-block checkout-field">
            <CustomSelect
              name="districtCode"
              label="* District"
              placeholder={loadingDistricts ? 'Loading...' : 'Select district'}
              disabled={loadingDistricts || !values.provinceCode || districts.length === 0}
              options={districts}
            />
          </div>
        </div>

        {/* Ward & Street Address */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <CustomSelect
              name="wardCode"
              label="* Ward"
              placeholder={loadingWards ? 'Loading...' : 'Select ward'}
              disabled={loadingWards || !values.districtCode || wards.length === 0}
              options={wards}
            />
          </div>
          <div className="d-block checkout-field">
            <Field
              name="streetAddress"
              type="text"
              label="* Detailed Address"
              placeholder="House number, alley, street name..."
              component={CustomInput}
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="checkout-fieldset">
          <div className="d-block checkout-field">
            <CustomMobileInput name="mobile" defaultValue={values.mobile} />
          </div>
          <div className="d-block checkout-field" />
        </div>

        {/* Shipping Option - fixed Standard Shipping */}
        <div className="checkout-fieldset">
          <div className="checkout-field" style={{ width: '100%' }}>
            <label className="label-input">Shipping Option</label>
            <div className="checkout-checkbox-field" style={{ cursor: 'default' }}>
              <input
                checked
                id="shipping-option-standard"
                readOnly
                type="checkbox"
                disabled
              />
              <label className="d-flex w-100" htmlFor="shipping-option-standard" style={{ cursor: 'default' }}>
                <h5 className="d-flex-grow-1 margin-0">
                  &nbsp; Standard Shipping &nbsp;
                  <span className="text-subtle">Domestic delivery 2-4 days</span>
                </h5>
                <h4 className="margin-0">{displayMoney(30000)}</h4>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShippingForm;
