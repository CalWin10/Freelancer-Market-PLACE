import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../../components/common/Button";
import Card, { CardHeader } from "../../components/common/Card";
import ErrorState from "../../components/common/ErrorState";
import { Input, Textarea } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import Loader from "../../components/common/Loader";
import ProfilePhotoEditor from "../../components/profile/ProfilePhotoEditor";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import {
  getClientProfile,
  updateClientProfile,
  type ClientProfile as ClientProfileData,
  type UpdateClientProfileRequest,
} from "../../services/userService";

type EditableField = keyof UpdateClientProfileRequest;
type FieldErrors = Partial<Record<EditableField, string>>;

const emptyForm: UpdateClientProfileRequest = { companyName: "", contactName: "", bio: "" };

export default function ClientProfile() {
  const { showToast } = useToast();
  const submissionLock = useRef(false);
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [form, setForm] = useState<UpdateClientProfileRequest>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setFormError("");
    try {
      const response = await getClientProfile();
      setProfile(response);
      setForm({
        companyName: response.companyName ?? "",
        contactName: response.contactName ?? "",
        bio: response.bio ?? "",
      });
    } catch (requestError) {
      setProfile(null);
      setFormError(getApiErrorMessage(requestError, "Your profile could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const updateField = (field: EditableField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if ((form.companyName?.length ?? 0) > 200) errors.companyName = "Company name must not exceed 200 characters.";
    if ((form.contactName?.length ?? 0) > 200) errors.contactName = "Contact name must not exceed 200 characters.";
    if ((form.bio?.length ?? 0) > 2000) errors.bio = "Bio must not exceed 2,000 characters.";
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submissionLock.current) return;
    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) return;

    submissionLock.current = true;
    setSaving(true);
    setFormError("");
    try {
      const updated = await updateClientProfile({
        companyName: form.companyName?.trim() || undefined,
        contactName: form.contactName?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
      });
      setProfile(updated);
      setForm({
        companyName: updated.companyName ?? "",
        contactName: updated.contactName ?? "",
        bio: updated.bio ?? "",
      });
      showToast({ type: "success", title: "Profile saved", message: "Your client profile is up to date." });
    } catch (requestError) {
      const backendErrors = getApiFieldErrors(requestError);
      setFieldErrors({
        companyName: backendErrors.companyName,
        contactName: backendErrors.contactName,
        bio: backendErrors.bio,
      });
      setFormError(getApiErrorMessage(requestError, "Your profile could not be saved."));
    } finally {
      submissionLock.current = false;
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage label="Loading your profile" />;
  if (!profile) {
    return (
      <div className="page-container page-container--narrow">
        <ErrorState message={formError || "Your profile is unavailable."} onRetry={loadProfile} title="Profile unavailable" />
      </div>
    );
  }

  return (
    <div className="page-container page-container--profile">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Icon name="user" size={15} /> Account profile</span>
          <h1 className="page-title">Client profile</h1>
          <p className="page-subtitle">Help freelancers understand who they will be working with.</p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="stack">
          <Card padding="lg">
            <ProfilePhotoEditor
              disabled={saving}
              displayName={profile.fullName}
              onPhotoChange={(profilePhotoUrl) => setProfile((current) => current ? { ...current, profilePhotoUrl } : current)}
              photoUrl={profile.profilePhotoUrl}
            />
          </Card>
          <Card className="profile-identity-card">
            <span className="profile-identity-card__label">Account details</span>
            <strong>{profile.fullName}</strong>
            <span>{profile.email}</span>
            <p>Name and email are managed by your account and cannot be changed through the current backend API.</p>
          </Card>
        </aside>

        <Card padding="lg">
          <CardHeader title="Professional details" description="These details are stored on your client profile." />
          {formError && <div className="alert alert--error" role="alert"><Icon name="error" size={18} /><span>{formError}</span></div>}
          <form className="stack stack--lg" onSubmit={handleSubmit} noValidate>
            <div className="form-grid form-grid--two">
              <Input
                error={fieldErrors.companyName}
                label="Company name"
                maxLength={200}
                onChange={(event) => updateField("companyName", event.target.value)}
                placeholder="Acme Studio"
                value={form.companyName ?? ""}
              />
              <Input
                error={fieldErrors.contactName}
                label="Primary contact"
                maxLength={200}
                onChange={(event) => updateField("contactName", event.target.value)}
                placeholder="Name used for project communication"
                value={form.contactName ?? ""}
              />
            </div>
            <Textarea
              error={fieldErrors.bio}
              hint={`${(form.bio?.length ?? 0).toLocaleString()} / 2,000 characters`}
              label="About you or your company"
              maxLength={2000}
              onChange={(event) => updateField("bio", event.target.value)}
              placeholder="Share your company’s mission, team, and the kinds of projects you commission."
              rows={8}
              value={form.bio ?? ""}
            />
            <div className="form-actions">
              <Button disabled={saving} onClick={loadProfile} variant="secondary">Discard changes</Button>
              <Button loading={saving} loadingText="Saving profile…" type="submit">Save profile</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
