/* eslint-disable jsx-a11y/label-has-associated-control */
import { useFormikContext } from 'formik';
import React from 'react';

const VNPayPayment = () => {
    const { values, setValues } = useFormikContext();

    const options = [
        {
            id: 'vnpay_visa',
            value: 'vnpay',
            label: 'International Credit Card (Visa, Master, JCB, ...)',
            description: 'Secure payment via VNPay with international cards.',
            imgClass: 'payment-img-visa'
        },
        {
            id: 'vnpay_wallet',
            value: 'vnpay',
            label: 'E-Wallet & QR Code',
            description: 'Use banking apps or VNPay, MoMo wallets to scan QR codes.',
            imgClass: 'payment-img-paypal' // Placeholder image class
        },
        {
            id: 'vnpay_banking',
            value: 'vnpay',
            label: 'Internet Banking',
            description: 'Pay via domestic bank account.',
            imgClass: 'payment-img-mastercard' // Placeholder image class
        },
        {
            id: 'cod',
            value: 'cod',
            label: 'Cash on Delivery (COD)',
            description: 'Pay with cash upon delivery.',
            imgClass: 'payment-img-cod' // Placeholder or no image class
        }
    ];

    const getDropdownOptions = (type) => {
        switch(type) {
            case 'vnpay_visa':
                return [
                    { value: 'new', label: 'Add New Card' },
                    { value: 'card_1', label: 'Saved Visa ending in 4242' },
                    { value: 'card_2', label: 'Saved Mastercard ending in 1234' }
                ];
            case 'vnpay_wallet':
                return [
                    { value: 'new', label: 'Link New Wallet' },
                    { value: 'wallet_1', label: 'VNPay Wallet (***999)' },
                    { value: 'wallet_2', label: 'MoMo Wallet (***888)' }
                ];
            case 'vnpay_banking':
                return [
                    { value: 'new', label: 'Link New Bank Account' },
                    { value: 'bank_1', label: 'Vietcombank (***123)' },
                    { value: 'bank_2', label: 'Techcombank (***456)' }
                ];
            default:
                return [];
        }
    };

    return (
        <>
            {options.map((option, index) => (
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
                                <div className="d-flex-grow-1 margin-left-s">
                                    <h4 className="margin-0">{option.label}</h4>
                                    <span className="text-subtle d-block margin-top-s">
                                        {option.description}
                                    </span>
                                </div>
                                <div className={`payment-img ${option.imgClass}`} />
                            </label>
                        </div>
                    </div>
                    
                    {values.type === option.id && option.id !== 'cod' && (
                        <div className="payment-dropdown-wrapper" style={{ marginLeft: '45px', marginTop: '10px' }}>
                            <select 
                                className="form-control" 
                                style={{
                                    width: '100%', 
                                    padding: '12px 15px', 
                                    borderRadius: '5px', 
                                    border: '1px solid #e1e1e1',
                                    backgroundColor: '#f9f9f9',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                                onChange={(e) => console.log('Selected implementation:', e.target.value)}
                            >
                                {getDropdownOptions(option.id).map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

export default VNPayPayment;
