import React, { useId } from 'react';

interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-xs font-bold tracking-wide text-gray-700 uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-gray-50 border px-4 py-3 font-sans text-sm rounded-lg outline-none transition-colors placeholder:text-gray-400 ${
          error
            ? 'border-red-400 focus:ring-1 focus:ring-red-400'
            : 'border-gray-200 focus:ring-1 focus:ring-mv-black focus:border-mv-black'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="font-sans text-xs text-red-500">{error}</p>
      )}
      {hint && !error && (
        <p className="font-sans text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
