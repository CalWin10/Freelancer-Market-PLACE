import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { Input, Select } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import AuthLayout, {
  AuthAlert,
  PasswordToggle,
  getAuthDestination,
} from "../../components/layout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import { register, type RegisterRequest } from "../../services/authService";

interface RegisterForm extends RegisterRequest {
  confirmPassword: string;
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;
type RegisterTextField = Exclude<keyof RegisterForm, "role">;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fullNameError(value: string): string | undefined {
  return value.trim() ? undefined : "Enter your full name.";
}

function emailError(value: string): string | undefined {
  if (!value.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

function passwordError(value: string): string | undefined {
  if (!value) return "Create a password.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

function confirmationError(password: string, confirmation: string): string | undefined {
  if (!confirmation) return "Confirm your password.";
  if (confirmation !== password) return "Passwords do not match.";
  return undefined;
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const { showToast } = useToast();
  const submissionLock = useRef(false);

  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "FREELANCER",
  });
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTextField = (field: RegisterTextField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const updateRole = (value: string) => {
    if (value !== "CLIENT" && value !== "FREELANCER") return;
    setForm((current) => ({ ...current, role: value }));
    setFieldErrors((current) => ({ ...current, role: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const errors: RegisterErrors = {
      fullName: fullNameError(form.fullName),
      email: emailError(form.email),
      password: passwordError(form.password),
      confirmPassword: confirmationError(form.password, form.confirmPassword),
      role:
        form.role === "CLIENT" || form.role === "FREELANCER"
          ? undefined
          : "Choose how you want to use the marketplace.",
    };
    setFieldErrors(errors);
    setFormError("");

    if (Object.values(errors).some(Boolean)) return;

    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const response = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      if (!setSession(response.token)) {
        const message = "Your account was created, but the session could not be started. Please sign in.";
        setFormError(message);
        showToast({ type: "error", title: "Session unavailable", message });
        return;
      }

      showToast({
        type: "success",
        title: "Account created",
        message: response.message || "Welcome to Freelancer Marketplace.",
      });
      navigate(getAuthDestination(location.state), { replace: true });
    } catch (error) {
      const apiFields = getApiFieldErrors(error);
      const serverErrors: RegisterErrors = {
        fullName: apiFields.fullName,
        email: apiFields.email,
        password: apiFields.password,
        role: apiFields.role,
      };
      const hasFieldErrors = Object.values(serverErrors).some(Boolean);
      const message = getApiErrorMessage(error, "Unable to create your account. Please try again.");

      setFieldErrors(serverErrors);
      setFormError(hasFieldErrors ? "" : message);
      showToast({
        type: "error",
        title: hasFieldErrors ? "Check your details" : "Registration failed",
        message: hasFieldErrors ? "Correct the highlighted fields and try again." : message,
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join the marketplace"
      title="Create your account"
      description="Choose your role and set up a secure account in a few moments."
      footer={
        <p className="auth-form__aside">
          Already have an account?{" "}
          <Link className="auth-form__link" to="/login" state={location.state}>
            Sign in
          </Link>
        </p>
      }
    >
      {formError && <AuthAlert title="We could not create your account">{formError}</AuthAlert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="register-name"
          name="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          autoFocus
          required
          value={form.fullName}
          error={fieldErrors.fullName}
          leadingIcon={<Icon name="user" size={18} />}
          onChange={(event) => updateTextField("fullName", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              fullName: fullNameError(form.fullName),
            }))
          }
        />

        <Input
          id="register-email"
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          value={form.email}
          error={fieldErrors.email}
          leadingIcon={<Icon name="mail" size={18} />}
          onChange={(event) => updateTextField("email", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({ ...current, email: emailError(form.email) }))
          }
        />

        <Select
          id="register-role"
          name="role"
          label="I want to join as"
          required
          value={form.role}
          error={fieldErrors.role}
          hint="Choose how you plan to use the marketplace."
          onChange={(event) => updateRole(event.target.value)}
        >
          <option value="FREELANCER">Freelancer - find projects</option>
          <option value="CLIENT">Client - hire professionals</option>
        </Select>

        <Input
          id="register-password"
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
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
          onChange={(event) => updateTextField("password", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({ ...current, password: passwordError(form.password) }))
          }
        />

        <Input
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
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
          onChange={(event) => updateTextField("confirmPassword", event.target.value)}
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
            loadingText="Creating account..."
          >
            Create account
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
