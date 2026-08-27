import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import AuthLayout, {
  AuthAlert,
  PasswordToggle,
} from "../../components/layout/AuthLayout";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import { resetPassword } from "../../services/authService";

interface ResetForm {
  password: string;
  confirmPassword: string;
}

type ResetErrors = Partial<Record<keyof ResetForm, string>>;

function passwordError(value: string): string | undefined {
  if (!value) return "Enter a new password.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

function confirmationError(password: string, confirmation: string): string | undefined {
  if (!confirmation) return "Confirm your new password.";
  if (confirmation !== password) return "Passwords do not match.";
  return undefined;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const submissionLock = useRef(false);
  const token = (searchParams.get("token") ?? "").trim();

  const [form, setForm] = useState<ResetForm>({ password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<ResetErrors>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof ResetForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current || !token) return;

    const errors: ResetErrors = {
      password: passwordError(form.password),
      confirmPassword: confirmationError(form.password, form.confirmPassword),
    };
    setFieldErrors(errors);
    setFormError("");

    if (Object.values(errors).some(Boolean)) return;

    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const message = await resetPassword(token, form.password);
      showToast({
        type: "success",
        title: "Password updated",
        message: message || "Your password has been reset. You can now sign in.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      const apiFields = getApiFieldErrors(error);
      const serverPasswordError = apiFields.newPassword;
      const message = getApiErrorMessage(
        error,
        "Unable to reset your password. The link may have expired.",
      );

      setFieldErrors({ password: serverPasswordError });
      setFormError(serverPasswordError ? "" : message);
      showToast({
        type: "error",
        title: serverPasswordError ? "Check your password" : "Reset failed",
        message: serverPasswordError || message,
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Account recovery"
        title="This reset link is incomplete"
        description="A valid reset token is required before you can choose a new password."
        footer={
          <p className="auth-form__aside">
            Remembered your password?{" "}
            <Link className="auth-form__link" to="/login">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="auth-form">
          <AuthAlert title="Missing reset token">
            Request a new password reset email, then open the complete link from your inbox.
          </AuthAlert>
          <div className="auth-form__actions">
            <Link className="button button--primary button--md button--full" to="/forgot-password">
              Request a new link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Secure your account"
      title="Choose a new password"
      description="Create a password you have not used for this account before."
      footer={
        <p className="auth-form__aside">
          <Link className="auth-form__link" to="/login">
            <Icon name="arrow-left" size={16} />
            Back to sign in
          </Link>
        </p>
      }
    >
      {formError && <AuthAlert title="We could not reset your password">{formError}</AuthAlert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="reset-password"
          name="newPassword"
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          autoFocus
          required
          minLength={8}
          value={form.password}
          error={fieldErrors.password}
          hint="Use at least 8 characters."
          trailingElement={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          }
          onChange={(event) => updateField("password", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({ ...current, password: passwordError(form.password) }))
          }
        />

        <Input
          id="reset-confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          type={showConfirmation ? "text" : "password"}
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          trailingElement={
            <PasswordToggle
              visible={showConfirmation}
              onToggle={() => setShowConfirmation((visible) => !visible)}
            />
          }
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              confirmPassword: confirmationError(form.password, form.confirmPassword),
            }))
          }
        />

        <div className="auth-form__actions">
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Updating password..."
          >
            Update password
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
