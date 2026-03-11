import { useField } from 'formik';
import PropType from 'prop-types';
import React from 'react';

const CustomSelect = ({
    label, options, disabled, placeholder, ...props
}) => {
    const [field, meta] = useField(props);

    return (
        <div className="input-group">
            {label && <label className="label-input" htmlFor={field.name}>{label}</label>}
            <select
                className="input-form d-block"
                id={field.name}
                disabled={disabled}
                {...field}
                {...props}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {meta.touched && meta.error ? (
                <span className="label-input label-error">{meta.error}</span>
            ) : null}
        </div>
    );
};

CustomSelect.propTypes = {
    label: PropType.string.isRequired,
    options: PropType.arrayOf(PropType.shape({
        value: PropType.string.isRequired,
        label: PropType.string.isRequired
    })).isRequired,
    disabled: PropType.bool,
    placeholder: PropType.string
};

CustomSelect.defaultProps = {
    disabled: false,
    placeholder: 'Select Option'
};

export default CustomSelect;
