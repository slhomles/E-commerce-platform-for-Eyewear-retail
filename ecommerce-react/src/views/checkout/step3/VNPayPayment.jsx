/* eslint-disable jsx-a11y/label-has-associated-control */
import { useFormikContext } from 'formik';
import React from 'react';

const PAYMENT_OPTIONS = [
    {
        id: 'zalopay',
        label: 'ZaloPay Wallet',
        description: 'Scan the ZaloPay QR code or use a banking app to pay.',
        imgClass: 'payment-img-zalopay'
    },
    {
        id: 'payos',
        label: 'VietQR / PayOS',
        description: 'Scan the VietQR code with any banking app to pay.',
        imgClass: 'payment-img-payos'
    },
    {
        id: 'vnpay',
        label: 'VNPAY',
        description: 'Pay through the VNPAY gateway (QR / Wallet / Internet Banking).',
        imgClass: 'payment-img-vnpay'
    },
    {
        id: 'momo',
        label: 'MoMo Wallet',
        description: 'Scan the MoMo QR code or open the MoMo app to pay.',
        imgClass: 'payment-img-momo'
    },
    {
        id: 'atm',
        label: 'ATM / Internet Banking',
        description: 'Pay with a domestic ATM card from banks in Vietnam.',
        imgClass: 'payment-img-atm'
    },
    {
        id: 'visa',
        label: 'Visa / Master / JCB',
        description: 'Pay with an international Visa, MasterCard, or JCB card.',
        imgClass: 'payment-img-visa'
    },
    {
        id: 'cod',
        label: 'Cash on Delivery',
        description: 'Pay the delivery staff in cash when you receive your order.',
        imgClass: 'payment-img-cod'
    }
];

const VNPayPayment = () => {
    const { values, setValues } = useFormikContext();

    return (
        <>
            {PAYMENT_OPTIONS.map((option, index) => (
                <div
                    key={option.id}
                    className={`checkout-fieldset-collapse ${values.type === option.id ? 'is-selected-payment' : ''}`}
                    style={{ marginTop: index === 0 ? '0' : '15px' }}
                >
                    <div className="checkout-field margin-0">
                        <div className="checkout-checkbox-field">
                            <input
                                checked={values.type === option.id}
                                id={option.id}
                                name="type"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setValues({ ...values, type: option.id });
                                    }
                                }}
                                type="radio"
                            />
                            <label
                                className="d-flex w-100"
                                htmlFor={option.id}
                            >
                                <div className={`payment-img ${option.imgClass}`} />
                                <div className="d-flex-grow-1 margin-left-s">
                                    <h4 className="margin-0">{option.label}</h4>
                                    <span className="text-subtle d-block margin-top-s">
                                        {option.description}
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default VNPayPayment;
