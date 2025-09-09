import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className = '',
  required = false
}) => {
  const baseClasses = 'text-sm font-medium text-gray-700';
  
  return (
    <label
      htmlFor={htmlFor}
      className={`${baseClasses} ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};