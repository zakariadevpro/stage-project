

import "./edit-user-modal.css"

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="edit-user-modal">
        <div className="modal-header">
          <h2>{title || "Confirmation"}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="edit-user-form">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="submit-button" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal

