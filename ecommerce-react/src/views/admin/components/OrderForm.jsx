/* eslint-disable jsx-a11y/label-has-associated-control */
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { CustomInput, CustomSelect } from '@/components/formik';
import { Field, Form, Formik } from 'formik';
import PropType from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

const paymentMethodOptions = [
  { value: 'COD', label: 'Cash on Delivery (COD)' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'MOMO', label: 'MoMo Wallet' },
  { value: 'VNPAY', label: 'VNPay' }
];

const shippingMethodOptions = [
  { value: 'STANDARD', label: 'Standard Shipping' },
  { value: 'EXPRESS', label: 'Express Shipping' },
  { value: 'STORE_PICKUP', label: 'Store Pickup' }
];

const FormSchema = Yup.object().shape({
  userId: Yup.string().required('User ID is required.'),
  paymentMethod: Yup.string().required('Payment Method is required.'),
  shippingMethod: Yup.string().required('Shipping Method is required.'),
  
  shippingAddress: Yup.string().required('Shipping Address is required.'),
  recipientName: Yup.string().required('Recipient Name is required.'),
  recipientPhone: Yup.string().required('Recipient Phone is required.'),
  
  note: Yup.string()
});

const OrderForm = ({ isLoading, onSubmit }) => {
  const initFormikValues = {
    userId: '',
    paymentMethod: 'COD',
    shippingMethod: 'STANDARD',
    shippingAddress: '',
    recipientName: '',
    recipientPhone: '',
    note: ''
  };

  const onSubmitForm = (form) => {
    // Admin Add Order feature currently might need variantIds 
    // and quantities. For MVP UI layout sake, we submit basic info
    // matching form requirements.
    onSubmit({
      ...form,
      items: [] // Placeholder for actual items selection
    });
  };

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={initFormikValues}
        validateOnChange
        validationSchema={FormSchema}
        onSubmit={onSubmitForm}
      >
        {() => (
          <Form className="product-form">
            <div className="product-form-inputs">
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="userId"
                    type="text"
                    label="* User ID"
                    placeholder="E.g. 5f8d..."
                    component={CustomInput}
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="product-form-field">
                  <CustomSelect
                    name="paymentMethod"
                    options={paymentMethodOptions}
                    disabled={isLoading}
                    placeholder="Select Payment Method"
                    label="* Payment Method"
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomSelect
                    name="shippingMethod"
                    options={shippingMethodOptions}
                    disabled={isLoading}
                    placeholder="Select Shipping Method"
                    label="* Shipping Method"
                  />
                </div>
              </div>

              <h4 className="margin-top-s">Shipping Information</h4>
              <div className="d-flex">
                <div className="product-form-field">
                   <Field
                    disabled={isLoading}
                    name="recipientName"
                    type="text"
                    label="* Recipient Name"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                   <Field
                    disabled={isLoading}
                    name="recipientPhone"
                    type="text"
                    label="* Phone Number"
                    component={CustomInput}
                  />
                </div>
              </div>

              <div className="product-form-field">
                <Field
                  disabled={isLoading}
                  name="shippingAddress"
                  type="text"
                  label="* Shipping Address"
                  placeholder="Full address details"
                  component={CustomInput}
                />
              </div>

              <div className="product-form-field">
                <Field
                  disabled={isLoading}
                  name="note"
                  type="text"
                  label="Order Note (Optional)"
                  component={CustomInput}
                />
              </div>

              <br />
              <div className="product-form-field product-form-submit">
                <button
                  className="button"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
                  &nbsp;
                  {isLoading ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>
            </div>
            
            {/* ---- Placeholder for Order Items Selection ---- */}
            <div className="product-form-file">
              <div className="product-form-field">
                <span className="d-block padding-s">Order Items</span>
                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', fontSize: '13px', color: '#666' }}>
                  <p>In a fully functional admin order creation, this area would contain a product/variant selector to add items to the order.</p>
                  <p>For MVP UI design purposes, we focus on the order metadata.</p>
                </div>
              </div>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  );
};

OrderForm.propTypes = {
  onSubmit: PropType.func.isRequired,
  isLoading: PropType.bool.isRequired
};

export default OrderForm;
