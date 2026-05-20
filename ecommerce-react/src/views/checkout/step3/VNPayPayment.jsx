/* eslint-disable jsx-a11y/label-has-associated-control */
import { useFormikContext } from 'formik';
import React from 'react';

const PAYMENT_OPTIONS = [
    {
        id: 'zalopay',
        label: 'Ví ZaloPay',
        description: 'Quét QR ZaloPay hoặc app ngân hàng để thanh toán.',
        imgClass: 'payment-img-zalopay'
    },
    {
        id: 'payos',
        label: 'VietQR / PayOS',
        description: 'Quét mã VietQR bằng ứng dụng ngân hàng bất kỳ để thanh toán.',
        imgClass: 'payment-img-payos'
    },
    {
        id: 'vnpay',
        label: 'VNPAY',
        description: 'Thanh toán qua cổng VNPAY (QR / Ví / Internet Banking).',
        imgClass: 'payment-img-vnpay'
    },
    {
        id: 'momo',
        label: 'Ví MoMo',
        description: 'Quét QR MoMo hoặc mở app MoMo để thanh toán.',
        imgClass: 'payment-img-momo'
    },
    {
        id: 'atm',
        label: 'ATM / Internet Banking',
        description: 'Thanh toán bằng thẻ ATM nội địa của các ngân hàng tại Việt Nam.',
        imgClass: 'payment-img-atm'
    },
    {
        id: 'visa',
        label: 'Visa / Master / JCB',
        description: 'Thanh toán bằng thẻ thanh toán quốc tế Visa, MasterCard, JCB.',
        imgClass: 'payment-img-visa'
    },
    {
        id: 'cod',
        label: 'Thanh toán bằng tiền mặt khi nhận hàng',
        description: 'Bạn sẽ trả tiền mặt cho nhân viên giao hàng khi nhận sản phẩm.',
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
