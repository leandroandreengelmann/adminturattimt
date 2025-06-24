"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    titleColor: "text-green-900",
    messageColor: "text-green-800",
  },
  error: {
    icon: XCircleIcon,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    messageColor: "text-red-800",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-900",
    messageColor: "text-yellow-800",
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    messageColor: "text-blue-800",
  },
};

export default function Toast({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Aguarda a animação de saída
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon
              className={`h-6 w-6 ${config.iconColor}`}
              aria-hidden="true"
            />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-base font-semibold ${config.titleColor}`}>
              {title}
            </h3>
            <p className={`mt-1 text-sm ${config.messageColor}`}>{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className={`inline-flex rounded-md p-1.5 ${config.iconColor} hover:bg-gray-100 transition-colors`}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook personalizado para usar o Toast
export function useToast() {
  const [toast, setToast] = useState<{
    type: ToastType;
    title: string;
    message: string;
    isVisible: boolean;
  } | null>(null);

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ type, title, message, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => (prev ? { ...prev, isVisible: false } : null));
  };

  const showSuccess = (title: string, message: string) => {
    showToast("success", title, message);
  };

  const showError = (title: string, message: string) => {
    showToast("error", title, message);
  };

  const showWarning = (title: string, message: string) => {
    showToast("warning", title, message);
  };

  const showInfo = (title: string, message: string) => {
    showToast("info", title, message);
  };

  const ToastComponent = toast ? (
    <Toast
      type={toast.type}
      title={toast.title}
      message={toast.message}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  ) : null;

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastComponent,
  };
}
