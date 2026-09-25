import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="toast-icon success" size={18} />,
    error: <AlertCircle className="toast-icon error" size={18} />,
    info: <Info className="toast-icon info" size={18} />,
  };

  return (
    <div className={`toast-container ${toast.type || 'info'}`}>
      <div className="toast-content">
        {icons[toast.type] || icons.info}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={15} />
      </button>
    </div>
  );
};

export default Toast;
