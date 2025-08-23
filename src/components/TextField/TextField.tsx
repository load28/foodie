import React from 'react';
import './TextField.scss';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  variant?: 'underline' | 'bordered';
  state?: 'default' | 'error' | 'success';
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  errorMessage?: string;
  successMessage?: string;
  helpMessage?: string;
}

const TextField: React.FC<TextFieldProps> = ({ 
  label,
  placeholder = '',
  variant = 'underline',
  state = 'default',
  disabled = false,
  value,
  defaultValue,
  onChange,
  type = 'text',
  errorMessage = '입력값에 오류가 있습니다.',
  successMessage = '올바르게 입력되었습니다.',
  helpMessage,
  ...props 
}) => {
  const className = [
    'ds-text-field',
    `ds-text-field--${variant}`,
    state !== 'default' && `ds-text-field--${state}`
  ].filter(Boolean).join(' ');

  let helperText = '';
  if (state === 'error') {
    helperText = errorMessage;
  } else if (state === 'success') {
    helperText = successMessage;
  } else if (helpMessage) {
    helperText = helpMessage;
  }

  // 제어 컴포넌트 vs 비제어 컴포넌트 처리
  const isControlled = value !== undefined && onChange !== undefined;
  const inputProps = isControlled
    ? { value, onChange }
    : { defaultValue: value || defaultValue };

  return (
    <div className="ds-text-field-group">
      {label && (
        <label className="ds-text-field-label">{label}</label>
      )}
      <input
        type={type}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        {...inputProps}
        {...props}
      />
      <div className={`ds-text-field-message ${state === 'error' ? 'ds-text-field-error' : 'ds-text-field-help'} ${helperText ? 'ds-text-field-message--visible' : ''}`}>
        {helperText || '\u00A0'}
      </div>
    </div>
  );
};

export default TextField;