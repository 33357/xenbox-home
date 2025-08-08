import { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, message.duration || 5000);

    return () => clearTimeout(timer);
  }, [message.id, message.duration, onClose]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return '#f0f9ff';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'info':
        return '#f0f9ff';
      default:
        return '#f0f9ff';
    }
  };

  const getBorderColor = () => {
    switch (message.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div 
      className="toast"
      style={{
        backgroundColor: getBackgroundColor(),
        borderLeft: `4px solid ${getBorderColor()}`
      }}
    >
      <div className="toast-content">
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-text">
          <div className="toast-title">{message.title}</div>
          <div className="toast-message">{message.message}</div>
        </div>
        <button 
          className="toast-close"
          onClick={() => onClose(message.id)}
        >
          ×
        </button>
      </div>

      <style jsx>{`
        .toast {
          position: relative;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 12px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .toast-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .toast-text {
          flex: 1;
        }

        .toast-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          color: #111827;
        }

        .toast-message {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .toast-close:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onClose }) => {
  return (
    <div className="toast-container">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
      
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          max-width: 400px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .toast-container {
            left: 20px;
            right: 20px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

// Hook for using toasts
export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newMessage: ToastMessage = {
      id,
      ...toast
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    return id;
  };

  const closeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const showSuccess = (title: string, message: string) => {
    return showToast({ type: 'success', title, message });
  };

  const showError = (title: string, message: string) => {
    return showToast({ type: 'error', title, message });
  };

  const showWarning = (title: string, message: string) => {
    return showToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message: string) => {
    return showToast({ type: 'info', title, message });
  };

  return {
    messages,
    showToast,
    closeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer: () => <ToastContainer messages={messages} onClose={closeToast} />
  };
};