import ConfirmDialog from "../common/ConfirmDialog";

interface DeleteProjectModalProps {
  open: boolean;
  projectTitle?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteProjectModal({
  open,
  projectTitle,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteProjectModalProps) {
  return (
    <ConfirmDialog
      cancelLabel="Keep project"
      confirmLabel="Delete project"
      description={`Delete “${projectTitle || "this project"}”? This action cannot be undone.`}
      destructive
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={open}
      title="Delete project"
    />
  );
}
