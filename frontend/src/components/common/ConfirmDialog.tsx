import type { ReactNode } from "react";
import Button from "./Button";
import Icon from "./Icon";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  destructive = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnBackdrop={!loading}
      showCloseButton={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            loadingText={destructive ? "Removing…" : "Working…"}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={classNameForTone(destructive)}>
        <span className="confirm-dialog__icon" aria-hidden="true">
          {icon ?? <Icon name={destructive ? "warning" : "info"} size={24} />}
        </span>
        <p className="confirm-dialog__description">{description}</p>
      </div>
    </Modal>
  );
}

function classNameForTone(destructive: boolean): string {
  return `confirm-dialog ${destructive ? "confirm-dialog--danger" : "confirm-dialog--default"}`;
}
