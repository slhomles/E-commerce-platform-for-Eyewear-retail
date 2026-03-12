import { Modal } from '@/components/common';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';

const UserForm = ({ user, isOpen, onCancel, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        role: 'USER',
        enabled: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                role: user.role || 'USER',
                enabled: user.enabled ?? true
            });
        }
    }, [user]);

    const onFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
        >
            <div className="user-form-modal">
                <div className="user-form-header">
                    <h3>Edit User Profile</h3>
                </div>
                <form onSubmit={handleFormSubmit}>
                    <div className="user-form-inputs">
                        <div className="input-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                className="input-form"
                                id="fullName"
                                name="fullName"
                                onChange={onFieldChange}
                                required
                                type="text"
                                value={formData.fullName}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                className="input-form"
                                id="phone"
                                name="phone"
                                onChange={onFieldChange}
                                type="text"
                                value={formData.phone}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="role">Account Role</label>
                            <select
                                className="input-form"
                                id="role"
                                name="role"
                                onChange={onFieldChange}
                                value={formData.role}
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="checkbox-container">
                                <input
                                    checked={formData.enabled}
                                    name="enabled"
                                    onChange={onFieldChange}
                                    type="checkbox"
                                />
                                <span className="checkbox-label">Account Enabled</span>
                            </label>
                        </div>
                    </div>
                    <div className="user-form-actions">
                        <button
                            className="button button-muted button-small"
                            onClick={onCancel}
                            type="button"
                        >
                            Cancel
                        </button>
                        &nbsp;
                        <button
                            className="button button-small"
                            disabled={isLoading}
                            type="submit"
                        >
                            {isLoading ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

UserForm.propTypes = {
    user: PropType.shape({
        fullName: PropType.string,
        phone: PropType.string,
        role: PropType.string,
        enabled: PropType.bool
    }),
    isOpen: PropType.bool.isRequired,
    onCancel: PropType.func.isRequired,
    onSubmit: PropType.func.isRequired,
    isLoading: PropType.bool
};

export default UserForm;
