import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import AuthLayout, {
  AuthAlert,
  PasswordToggle,
  getAuthDestination,
} from "../../components/layout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import { login } from "../../services/authService";

interface LoginForm {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string): string | undefined {
  if (!value.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

function passwordError(value: string): string | undefined {
  return value ? undefined : "Enter your password.";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const { showToast } = useToast();
  const submissionLock = useRef(false);

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LoginForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const errors: LoginErrors = {
      email: emailError(form.email),
      password: passwordError(form.password),
    };
    setFieldErrors(errors);
    setFormError("");

    if (Object.values(errors).some(Boolean)) return;

    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!setSession(response.token)) {
        const message = "Your session could not be started. Please try signing in again.";
        setFormError(message);
        showToast({ type: "error", title: "Session unavailable", message });
        return;
      }

      showToast({
        type: "success",
        title: "Welcome back",
        message: response.message || "You are now signed in.",
      });
      navigate(getAuthDestination(location.state), { replace: true });
    } catch (error) {
      const apiFields = getApiFieldErrors(error);
      const serverErrors: LoginErrors = {
        email: apiFields.email,
        password: apiFields.password,
      };
      const hasFieldErrors = Object.values(serverErrors).some(Boolean);
      const message = getApiErrorMessage(error, "Unable to sign in. Please try again.");

      setFieldErrors(serverErrors);
      setFormError(hasFieldErrors ? "" : message);
      showToast({
        type: "error",
        title: hasFieldErrors ? "Check your details" : "Unable to sign in",
        message: hasFieldErrors ? "Correct the highlighted fields and try again." : message,
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Continue to your projects, conversations, and opportunities."
      footer={
        <p className="auth-form__aside">
          New to the marketplace?{" "}
          <Link className="auth-form__link" to="/register" state={location.state}>
            Create an account
          </Link>
        </p>
      }
    >
      {formError && <AuthAlert title="We could not sign you in">{formError}</AuthAlert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          autoFocus
          required
          value={form.email}
          error={fieldErrors.email}
          leadingIcon={<Icon name="mail" size={18} />}
          onChange={(event) => updateField("email", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({ ...current, email: emailError(form.email) }))
          }
        />

        <Input
          id="login-password"
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={form.password}
          error={fieldErrors.password}
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

        <div className="auth-form__aside">
          <Link className="auth-form__link" to="/forgot-password">
            Forgot your password?
          </Link>
        </div>

        <div className="auth-form__actions">
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Signing in..."
          >
            Sign in
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
