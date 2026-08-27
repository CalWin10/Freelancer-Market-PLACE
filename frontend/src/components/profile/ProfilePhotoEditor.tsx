import { useId, useRef, useState, type ChangeEvent } from "react";
import { getApiErrorMessage } from "../../services/api";
import { deletePhoto, uploadPhoto } from "../../services/userService";
import { useToast } from "../../context/ToastContext";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import Icon from "../common/Icon";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);

interface ProfilePhotoEditorProps {
  photoUrl?: string | null;
  displayName?: string | null;
  disabled?: boolean;
  onPhotoChange: (photoUrl: string | undefined) => void;
}

export default function ProfilePhotoEditor({
  photoUrl,
  displayName,
  disabled = false,
  onPhotoChange,
}: ProfilePhotoEditorProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const operationLock = useRef(false);
  const { showToast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const reportError = (title: string, message: string) => {
    setError(message);
    showToast({ type: "error", title, message });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file || operationLock.current) return;

    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      reportError("Unsupported photo", "Choose a JPEG or PNG image.");
      return;
    }

    if (file.size === 0) {
      reportError("Empty photo", "Choose a non-empty JPEG or PNG image.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      reportError("Photo is too large", "Choose an image no larger than 5 MiB.");
      return;
    }

    operationLock.current = true;
    setIsUploading(true);
    setError("");

    try {
      const uploadedUrl = await uploadPhoto(file);
      onPhotoChange(uploadedUrl);
      showToast({
        type: "success",
        title: "Photo updated",
        message: "Your new profile photo is now visible.",
      });
    } catch (uploadError) {
      reportError(
        "Upload failed",
        getApiErrorMessage(uploadError, "Unable to upload your photo. Please try again."),
      );
    } finally {
      operationLock.current = false;
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (operationLock.current) return;

    operationLock.current = true;
    setIsRemoving(true);
    setError("");

    try {
      const message = await deletePhoto();
      onPhotoChange(undefined);
      setRemoveDialogOpen(false);
      showToast({
        type: "success",
        title: "Photo removed",
        message: message || "Your profile photo has been removed.",
      });
    } catch (removeError) {
      reportError(
        "Removal failed",
        getApiErrorMessage(removeError, "Unable to remove your photo. Please try again."),
      );
    } finally {
      operationLock.current = false;
      setIsRemoving(false);
    }
  };

  const busy = isUploading || isRemoving;

  return (
    <div className="profile-photo">
      <div className="profile-photo__preview">
        <Avatar
          src={photoUrl}
          name={displayName}
          alt={displayName ? `${displayName}'s profile photo` : "Your profile photo"}
          size="xl"
        />
      </div>

      <div className="profile-photo__content">
        <div className="profile-photo__actions">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="upload" size={17} />}
            loading={isUploading}
            loadingText="Uploading..."
            disabled={disabled || isRemoving}
            aria-controls={inputId}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoUrl ? "Replace photo" : "Upload photo"}
          </Button>

          {photoUrl && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<Icon name="trash" size={17} />}
              disabled={disabled || busy}
              onClick={() => setRemoveDialogOpen(true)}
            >
              Remove
            </Button>
          )}
        </div>

        <p className="profile-photo__help" id={`${inputId}-help`}>
          JPEG or PNG, up to 5 MiB.
        </p>
        {error && <p className="form-alert form-alert--error" role="alert">{error}</p>}

        <input
          className="profile-photo__input sr-only"
          ref={fileInputRef}
          id={inputId}
          type="file"
          name="profilePhoto"
          accept="image/jpeg,image/png"
          aria-label="Choose a profile photo"
          aria-describedby={`${inputId}-help`}
          disabled={disabled || busy}
          onChange={handleFileChange}
        />
      </div>

      <ConfirmDialog
        open={removeDialogOpen}
        title="Remove profile photo?"
        description="Your initials will be shown until you upload another photo."
        confirmLabel="Remove photo"
        loading={isRemoving}
        destructive
        onConfirm={handleRemove}
        onCancel={() => setRemoveDialogOpen(false)}
      />
    </div>
  );
}
