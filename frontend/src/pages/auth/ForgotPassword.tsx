import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import AuthLayout, { AuthAlert } from "../../components/layout/AuthLayout";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import { forgotPassword } from "../../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string): string | undefined {
  if (!value.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export default function ForgotPassword() {
  const { showToast } = useToast();
  const submissionLock = useRef(false);

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const validationError = emailError(email);
    setFieldError(validationError ?? "");
    setFormError("");
    if (validationError) return;

    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const message = await forgotPassword(email.trim());
      const confirmation =
        message || "If that email is registered, a password reset link has been sent.";
      setSuccessMessage(confirmation);
      showToast({ type: "success", title: "Request received", message: confirmation });
    } catch (error) {
      const apiFields = getApiFieldErrors(error);
      const serverFieldError = apiFields.email;
      const message = getApiErrorMessage(
        error,
        "Unable to request a reset link. Please try again.",
      );

      setFieldError(serverFieldError ?? "");
      setFormError(serverFieldError ? "" : message);
      showToast({
        type: "error",
        title: serverFieldError ? "Check your email" : "Request failed",
        message: serverFieldError || message,
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const requestForAnotherEmail = () => {
    setSuccessMessage("");
    setFormError("");
    setFieldError("");
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email and we will send instructions if it is registered."
      footer={
        <p className="auth-form__aside">
          <Link className="auth-form__link" to="/login">
            <Icon name="arrow-left" size={16} />
            Back to sign in
          </Link>
        </p>
      }
    >
      {successMessage ? (
        <div className="auth-form">
          <AuthAlert tone="success" title="Check your inbox">
            {successMessage}
          </AuthAlert>
          <div className="auth-form__actions">
            <Button type="button" variant="secondary" fullWidth onClick={requestForAnotherEmail}>
              Use another email
            </Button>
          </div>
        </div>
      ) : (
        <>
          {formError && <AuthAlert title="We could not send a reset link">{formError}</AuthAlert>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <Input
              id="forgot-email"
              name="email"
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              autoFocus
              required
              value={email}
              error={fieldError || undefined}
              leadingIcon={<Icon name="mail" size={18} />}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldError("");
                setFormError("");
              }}
              onBlur={() => setFieldError(emailError(email) ?? "")}
            />

            <div className="auth-form__actions">
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
                loadingText="Sending link..."
              >
                Send reset link
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
