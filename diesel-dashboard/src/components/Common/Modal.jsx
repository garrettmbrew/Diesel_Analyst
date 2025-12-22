import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { theme } from '../../styles/theme';

/**
 * Reusable modal component for drill-downs
 */
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  size = 'large' // 'small', 'medium', 'large', 'full'
}) => {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeStyles = {
    small: { maxWidth: '480px' },
    medium: { maxWidth: '720px' },
    large: { maxWidth: '1000px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        style={{ ...styles.modal, ...sizeStyles[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{title}</h2>
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border.default}`,
    boxShadow: theme.shadows.lg,
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'modalSlideIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.sans,
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: theme.colors.text.muted,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: theme.radius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.transitions.fast}`,
    ':hover': {
      background: theme.colors.background.tertiary,
      color: theme.colors.text.primary,
    },
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
};

// Add keyframes for animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

export default Modal;
