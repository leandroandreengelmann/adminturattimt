"use client";

import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: "delete" | "duplicate" | "info" | "warning";
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolveCallback, setResolveCallback] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showConfirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveCallback(() => resolve);
      setIsOpen(true);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resolveCallback) {
      resolveCallback(false);
      setResolveCallback(null);
    }
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) {
      resolveCallback(true);
      setResolveCallback(null);
    }
  };

  const ConfirmModalComponent = (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
      type={options.type}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
    />
  );

  return {
    showConfirm,
    ConfirmModalComponent,
  };
}
