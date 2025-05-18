import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="primary" onClick={onConfirm}>
            Confirm
          </button>
          <button className="cancelbtt" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;