/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-nested-ternary */
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Boundary } from '@/components/common';
import { CHECKOUT_STEP_1, CHECKOUT_STEP_3 } from '@/constants/routes';
import { Form, Formik } from 'formik';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setShippingDetails } from '@/redux/actions/checkoutActions';
import * as Yup from 'yup';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';
import ShippingForm from './ShippingForm';
import ShippingTotal from './ShippingTotal';

const FormSchema = Yup.object().shape({
  fullname: Yup.string()
    .required('Full name is required.')
    .min(2, 'Full name must be at least 2 characters long.')
    .max(60, 'Full name must only be less than 60 characters.'),
  email: Yup.string()
    .email('Email is not valid.')
    .required('Email is required.'),
  address: Yup.string(),
  provinceCode: Yup.string().required('Vui lòng chọn Tỉnh/Thành phố.'),
  districtCode: Yup.string().required('Vui lòng chọn Quận/Huyện.'),
  wardCode: Yup.string().required('Vui lòng chọn Phường/Xã.'),
  streetAddress: Yup.string().required('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường).'),
  mobile: Yup.object()
    .shape({
      country: Yup.string(),
      countryCode: Yup.string(),
      dialCode: Yup.string().required('Mobile number is required'),
      value: Yup.string()
        .required('Mobile number is required')
        .matches(/^(84[35789][0-9]{8}|0[35789][0-9]{8})$/, 'Số điện thoại di động Việt Nam không đúng định dạng (ví dụ: 0912345678).')
    })
    .required('Mobile number is required.'),
  isInternational: Yup.boolean(),
  isDone: Yup.boolean()
});

const ShippingDetails = ({ profile, shipping, subtotal }) => {
  useDocumentTitle('Check Out Step 2 | Salinaka');
  useScrollTop();
  const dispatch = useDispatch();
  const history = useHistory();
  const safeProfile = profile || {};
  const safeShipping = shipping || {};

  const getMobileValue = (mobile) => {
    if (!mobile) return {};
    if (typeof mobile === 'string') {
      return {
        country: '',
        countryCode: '',
        dialCode: '',
        value: mobile
      };
    }
    return mobile;
  };

  const initFormikValues = {
    fullname: safeShipping.fullname || safeProfile.fullname || safeProfile.fullName || '',
    email: safeShipping.email || safeProfile.email || '',
    address: safeShipping.address || safeProfile.address || '',
    provinceCode: safeShipping.provinceCode || '',
    provinceName: safeShipping.provinceName || '',
    districtCode: safeShipping.districtCode || '',
    districtName: safeShipping.districtName || '',
    wardCode: safeShipping.wardCode || '',
    wardName: safeShipping.wardName || '',
    streetAddress: safeShipping.streetAddress || '',
    mobile: getMobileValue(safeShipping.mobile || safeProfile.mobile || safeProfile.phone),
    isInternational: false,
    isDone: safeShipping.isDone || false
  };

  const onSubmitForm = (form) => {
    const finalAddress = `${form.streetAddress}, ${form.wardName}, ${form.districtName}, ${form.provinceName}`;
    dispatch(setShippingDetails({
      fullname: form.fullname,
      email: form.email,
      address: finalAddress,
      provinceCode: form.provinceCode,
      provinceName: form.provinceName,
      districtCode: form.districtCode,
      districtName: form.districtName,
      wardCode: form.wardCode,
      wardName: form.wardName,
      streetAddress: form.streetAddress,
      mobile: form.mobile,
      isInternational: false,
      isDone: true
    }));
    history.push(CHECKOUT_STEP_3);
  };

  return (
    <Boundary>
      <div className="checkout">
        <StepTracker current={2} />
        <div className="checkout-step-2">
          <h3 className="text-center">Shipping Details</h3>
          <Formik
            initialValues={initFormikValues}
            validateOnChange
            validationSchema={FormSchema}
            onSubmit={onSubmitForm}
          >
            {() => (
              <Form>
                <ShippingForm />
                <br />
                {/*  ---- TOTAL --------- */}
                <ShippingTotal subtotal={subtotal} />
                <br />
                {/*  ----- NEXT/PREV BUTTONS --------- */}
                <div className="checkout-shipping-action">
                  <button
                    className="button button-muted"
                    onClick={() => history.push(CHECKOUT_STEP_1)}
                    type="button"
                  >
                    <ArrowLeftOutlined />
                    &nbsp;
                    Go Back
                  </button>
                  <button
                    className="button button-icon"
                    type="submit"
                  >
                    Next Step
                    &nbsp;
                    <ArrowRightOutlined />
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Boundary>
  );
};

ShippingDetails.propTypes = {
  subtotal: PropType.number.isRequired,
  profile: PropType.shape({
    fullname: PropType.string,
    email: PropType.string,
    address: PropType.string,
    mobile: PropType.object
  }),
  shipping: PropType.shape({
    fullname: PropType.string,
    email: PropType.string,
    address: PropType.string,
    mobile: PropType.object,
    isInternational: PropType.bool,
    isDone: PropType.bool
  })
};

ShippingDetails.defaultProps = {
  profile: {},
  shipping: {}
};

export default withCheckout(ShippingDetails);
