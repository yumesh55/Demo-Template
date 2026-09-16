import React from 'react'
import './popuModal.css'

const VARIANT_TITLES = {
  success: 'Success',
  error: 'Something Went Wrong',
  confirm: 'Please Confirm',
}

const PopuModal = ({
  isOpen,
  variant = 'success',
  title,
  message,
  input,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null

  const resolvedTitle = title || VARIANT_TITLES[variant] || 'Notification'
  const resolvedConfirmLabel = confirmLabel || (variant === 'confirm' ? 'Confirm' : 'OK')

  return (
    <div className="popup-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`popup-modal popup-modal-${variant}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-modal-title"
      >
        <button
          type="button"
          className="popup-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          x
        </button>

        <div className="popup-modal-icon" aria-hidden="true">
          {variant === 'success' && '✓'}
          {variant === 'error' && '!'}
          {variant === 'confirm' && '?'}
        </div>

        <h2 id="popup-modal-title">{resolvedTitle}</h2>
        <p>{message}</p>

        {input && (
          <label className="popup-modal-field">
            <span>{input.label}</span>
            {input.type && input.type !== 'textarea' ? (
              <input
                type={input.type}
                value={input.value}
                onChange={(event) => input.onChange(event.target.value)}
                placeholder={input.placeholder}
                autoFocus={input.autoFocus}
                minLength={input.minLength}
              />
            ) : (
              <textarea
                value={input.value}
                onChange={(event) => input.onChange(event.target.value)}
                placeholder={input.placeholder}
                rows={input.rows || 3}
                autoFocus={input.autoFocus}
              />
            )}
          </label>
        )}

        <div className="popup-modal-actions">
          {variant === 'confirm' && (
            <button
              type="button"
              className="popup-modal-button popup-modal-button-secondary"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="button"
            className={`popup-modal-button popup-modal-button-${variant}`}
            onClick={variant === 'confirm' ? onConfirm : onClose}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PopuModal
