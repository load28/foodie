import React from 'react';
import './TextArea.scss';

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  variant?: 'bordered';
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  helpMessage?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  label,
  placeholder = '',
  variant = 'bordered',
  disabled = false,
  value,
  defaultValue,
  onChange,
  rows = 4,
  helpMessage,
  ...props 
}) => {
  const className = [
    'ds-text-area',
    variant !== 'bordered' && `ds-text-area--${variant}`
  ].filter(Boolean).join(' ');

  // 제어 컴포넌트 vs 비제어 컴포넌트 처리 (TextField와 동일한 로직)
  const isControlled = value !== undefined && onChange !== undefined;
  const inputProps = isControlled
    ? { value, onChange }
    : { defaultValue: value || defaultValue };

  return (
    <div className="ds-text-area-group">
      {label && (
        <label className="ds-text-area-label">{label}</label>
      )}
      <textarea
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...inputProps}
        {...props}
      />
      <div className={`ds-text-area-message ds-text-area-help ${helpMessage ? 'ds-text-area-message--visible' : ''}`}>
        {helpMessage || '\u00A0'}
      </div>
    </div>
  );
};

export default TextArea;