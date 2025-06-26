// src/components/ui/index.tsx - COMPLETE VERSION
import { ReactNode } from 'react';

// Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  disabled = false,
  onClick,
  type = 'button'
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-pink-500',
    secondary: 'bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 focus:ring-pink-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Card component
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md border border-pink-100 ${
        hover ? 'hover:shadow-lg hover:scale-105 transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Alert component
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({ 
  type, 
  message, 
  onClose,
  className = ''
}: AlertProps) => {
  const typeClasses = {
    success: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200',
    error: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200',
    warning: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 border-pink-200'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '💡'
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${typeClasses[type]} ${className} shadow-md`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center flex-1">
          <span className="mr-3 text-xl">{icons[type]}</span>
          <span className="font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none ml-4 text-xl font-bold transition-colors duration-200"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// Loading spinner
export const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

// Page header component
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 bg-white rounded-xl shadow-lg p-8 border-2 border-pink-100">
      <div className="mb-6 md:mb-0">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// Table component
interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className = '' }: TableProps) => {
  return (
    <div className={`overflow-x-auto rounded-xl shadow-lg border-2 border-pink-100 ${className}`}>
      <table className="min-w-full divide-y-2 divide-pink-200 bg-white">
        <thead className="bg-gradient-to-r from-pink-50 to-pink-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-pink-100">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        
        {/* Modal content */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto z-10 border-2 border-pink-200 transform transition-all duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b-2 border-pink-100 bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-bold"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6">{children}</div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t-2 border-pink-100 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};