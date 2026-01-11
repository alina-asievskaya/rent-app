// components/ConfirmationModal.tsx
import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getTypeClasses = () => {
    switch (type) {
      case 'danger':
        return 'confirmationmodal-danger';
      case 'warning':
        return 'confirmationmodal-warning';
      case 'info':
        return 'confirmationmodal-info';
      default:
        return 'confirmationmodal-danger';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return 'fas fa-exclamation-triangle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  return (
    <div className="confirmationmodal-overlay">
      <div className="confirmationmodal-container">
        <div className={`confirmationmodal-header ${getTypeClasses()}`}>
          <div className="confirmationmodal-icon">
            <i className={getIcon()}></i>
          </div>
          <h3 className="confirmationmodal-title">{title}</h3>
        </div>
        
        <div className="confirmationmodal-content">
          <p className="confirmationmodal-message">{message}</p>
          
          <div className="confirmationmodal-actions">
            <button
              className="confirmationmodal-btn confirmationmodal-btn-cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className={`confirmationmodal-btn confirmationmodal-btn-confirm ${getTypeClasses()}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;