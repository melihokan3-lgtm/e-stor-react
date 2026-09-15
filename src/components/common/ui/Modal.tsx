import type { MouseEvent, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
  labelledBy?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  overlayClassName = "",
  contentClassName = "",
  labelledBy,
}: ModalProps) {
  if (!open) return null;

  const stopPropagation = (event: MouseEvent<HTMLDivElement>): void => event.stopPropagation();

  return (
    <div className={overlayClassName} role="presentation" onClick={onClose}>
      <div
        className={contentClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={stopPropagation}
      >
        {children}
      </div>
    </div>
  );
}
