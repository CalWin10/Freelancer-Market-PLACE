import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../../components/common/Button";
import Card, { CardHeader } from "../../components/common/Card";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { Input, Textarea } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import Loader from "../../components/common/Loader";
import ProfilePhotoEditor from "../../components/profile/ProfilePhotoEditor";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import {
  getFreelancerProfile,
  updateFreelancerProfile,
  type FreelancerProfile as FreelancerProfileData,
  type PortfolioItem,
} from "../../services/userService";

interface FreelancerForm {
  bio: string;
  location: string;
  hourlyRate: string;
  skills: string[];
  portfolioItems: PortfolioItem[];
}

type FieldErrors = Record<string, string | undefined>;

const emptyForm: FreelancerForm = {
  bio: "",
  location: "",
  hourlyRate: "",
  skills: [],
  portfolioItems: [],
};

const isWebUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const profileToForm = (profile: FreelancerProfileData): FreelancerForm => ({
  bio: profile.bio ?? "",
  location: profile.location ?? "",
  hourlyRate: profile.hourlyRate == null ? "" : String(profile.hourlyRate),
  skills: profile.skills ?? [],
  portfolioItems: profile.portfolioItems ?? [],
});

export default function FreelancerProfile() {
  const { showToast } = useToast();
  const submissionLock = useRef(false);
  const [profile, setProfile] = useState<FreelancerProfileData | null>(null);
  const [form, setForm] = useState<FreelancerForm>(emptyForm);
  const [skillInput, setSkillInput] = useState("");
  const [skillError, setSkillError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removePortfolioIndex, setRemovePortfolioIndex] = useState<number | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setFormError("");
    try {
      const response = await getFreelancerProfile();
      setProfile(response);
      setForm(profileToForm(response));
      setFieldErrors({});
    } catch (requestError) {
      setProfile(null);
      setFormError(getApiErrorMessage(requestError, "Your profile could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const setField = (field: "bio" | "location" | "hourlyRate", value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) {
      setSkillError("Enter a skill before adding it.");
      return;
    }
    if (form.skills.some((current) => current.toLocaleLowerCase() === skill.toLocaleLowerCase())) {
      setSkillError("That skill is already on your profile.");
      return;
    }
    setForm((current) => ({ ...current, skills: [...current.skills, skill] }));
    setSkillInput("");
    setSkillError("");
  };

  const removeSkill = (index: number) => {
    setForm((current) => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const addPortfolioItem = () => {
    setForm((current) => ({
      ...current,
      portfolioItems: [...current.portfolioItems, { title: "", description: "", projectUrl: "", imageUrl: "" }],
    }));
  };

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string) => {
    setForm((current) => ({
      ...current,
      portfolioItems: current.portfolioItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item),
    }));
    setFieldErrors((current) => ({ ...current, [`portfolioItems[${index}].${field}`]: undefined }));
  };

  const confirmRemovePortfolio = () => {
    if (removePortfolioIndex == null) return;
    setForm((current) => ({
      ...current,
      portfolioItems: current.portfolioItems.filter((_, index) => index !== removePortfolioIndex),
    }));
    setRemovePortfolioIndex(null);
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (form.bio.length > 2000) errors.bio = "Bio must not exceed 2,000 characters.";
    if (form.hourlyRate !== "" && Number(form.hourlyRate) <= 0) errors.hourlyRate = "Hourly rate must be greater than zero.";
    form.portfolioItems.forEach((item, index) => {
      if (!item.title.trim()) errors[`portfolioItems[${index}].title`] = "Portfolio title is required.";
      if (!isWebUrl(item.projectUrl ?? "")) errors[`portfolioItems[${index}].projectUrl`] = "Enter a valid http:// or https:// URL.";
      if (!isWebUrl(item.imageUrl ?? "")) errors[`portfolioItems[${index}].imageUrl`] = "Enter a valid http:// or https:// URL.";
    });
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
      const updated = await updateFreelancerProfile({
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || undefined,
        hourlyRate: form.hourlyRate === "" ? undefined : Number(form.hourlyRate),
        skills: form.skills,
        portfolioItems: form.portfolioItems.map((item) => ({
          id: item.id,
          title: item.title.trim(),
          description: item.description?.trim() || undefined,
          projectUrl: item.projectUrl?.trim() || undefined,
          imageUrl: item.imageUrl?.trim() || undefined,
        })),
      });
      setProfile(updated);
      setForm(profileToForm(updated));
      showToast({ type: "success", title: "Profile saved", message: "Clients can now find your latest profile information." });
    } catch (requestError) {
      setFieldErrors(getApiFieldErrors(requestError));
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
          <span className="eyebrow"><Icon name="user" size={15} /> Professional profile</span>
          <h1 className="page-title">Freelancer profile</h1>
          <p className="page-subtitle">Show clients the expertise, experience, and work you bring to their projects.</p>
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
            <p>Name and email cannot be changed through the current backend API.</p>
          </Card>
        </aside>

        <form className="stack stack--lg" onSubmit={handleSubmit} noValidate>
          <Card padding="lg">
            <CardHeader title="Professional overview" description="This information appears in client talent searches." />
            {formError && <div className="alert alert--error" role="alert"><Icon name="error" size={18} /><span>{formError}</span></div>}
            <div className="stack stack--lg">
              <Textarea
                error={fieldErrors.bio}
                hint={`${form.bio.length.toLocaleString()} / 2,000 characters`}
                label="Professional bio"
                maxLength={2000}
                onChange={(event) => setField("bio", event.target.value)}
                placeholder="Summarize your experience, strengths, and the kind of work you do best."
                rows={8}
                value={form.bio}
              />
              <div className="form-grid form-grid--two">
                <Input label="Location" leadingIcon={<Icon name="map-pin" size={17} />} onChange={(event) => setField("location", event.target.value)} placeholder="City, country or time zone" value={form.location} />
                <Input error={fieldErrors.hourlyRate} hint="USD per hour" label="Hourly rate" min="0.01" onChange={(event) => setField("hourlyRate", event.target.value)} placeholder="50" step="0.01" type="number" value={form.hourlyRate} />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <CardHeader title="Skills" description="Add the searchable skills that best represent your expertise." />
            <div className="skill-editor">
              <Input
                error={skillError}
                hideLabel
                label="Add a skill"
                onChange={(event) => { setSkillInput(event.target.value); setSkillError(""); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") { event.preventDefault(); addSkill(); }
                }}
                placeholder="Type a skill and press Enter"
                value={skillInput}
              />
              <Button leftIcon={<Icon name="plus" size={16} />} onClick={addSkill} variant="secondary">Add skill</Button>
            </div>
            {form.skills.length > 0 ? (
              <div className="editable-tags" aria-label="Your skills">
                {form.skills.map((skill, index) => (
                  <span className="editable-tag" key={`${skill}-${index}`}>
                    {skill}
                    <button aria-label={`Remove ${skill}`} onClick={() => removeSkill(index)} type="button"><Icon name="close" size={14} /></button>
                  </span>
                ))}
              </div>
            ) : <EmptyState compact description="Skills help your profile appear in relevant searches." icon="settings" title="No skills added" />}
          </Card>

          <Card padding="lg">
            <CardHeader
              action={<Button leftIcon={<Icon name="plus" size={16} />} onClick={addPortfolioItem} size="sm" variant="secondary">Add item</Button>}
              description="Showcase project links and supporting images. Portfolio data is saved with your profile."
              title="Portfolio"
            />
            {form.portfolioItems.length === 0 ? (
              <EmptyState compact action={<Button onClick={addPortfolioItem} size="sm" variant="secondary">Add your first item</Button>} description="Add examples that demonstrate the quality of your work." icon="file" title="No portfolio items" />
            ) : (
              <div className="portfolio-editor-list">
                {form.portfolioItems.map((item, index) => (
                  <fieldset className="portfolio-editor" key={item.id ?? `new-${index}`}>
                    <legend>Portfolio item {index + 1}</legend>
                    <div className="portfolio-editor__header">
                      <strong>{item.title.trim() || `Untitled item ${index + 1}`}</strong>
                      <Button aria-label={`Remove portfolio item ${index + 1}`} leftIcon={<Icon name="trash" size={15} />} onClick={() => setRemovePortfolioIndex(index)} size="sm" variant="ghost">Remove</Button>
                    </div>
                    <Input error={fieldErrors[`portfolioItems[${index}].title`]} label="Title" onChange={(event) => updatePortfolioItem(index, "title", event.target.value)} placeholder="Project or case-study title" required value={item.title} />
                    <Textarea label="Description" onChange={(event) => updatePortfolioItem(index, "description", event.target.value)} placeholder="What you built, your role, and the outcome" rows={4} value={item.description ?? ""} />
                    <div className="form-grid form-grid--two">
                      <Input error={fieldErrors[`portfolioItems[${index}].projectUrl`]} label="Project URL" onChange={(event) => updatePortfolioItem(index, "projectUrl", event.target.value)} placeholder="https://example.com/project" type="url" value={item.projectUrl ?? ""} />
                      <Input error={fieldErrors[`portfolioItems[${index}].imageUrl`]} label="Image URL" onChange={(event) => updatePortfolioItem(index, "imageUrl", event.target.value)} placeholder="https://example.com/preview.jpg" type="url" value={item.imageUrl ?? ""} />
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </Card>

          <div className="form-actions profile-save-actions">
            <Button disabled={saving} onClick={loadProfile} variant="secondary">Discard changes</Button>
            <Button loading={saving} loadingText="Saving profile…" type="submit">Save profile</Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        confirmLabel="Remove item"
        description="Remove this portfolio item from the form? Save the profile to persist the change."
        destructive
        onCancel={() => setRemovePortfolioIndex(null)}
        onConfirm={confirmRemovePortfolio}
        open={removePortfolioIndex != null}
        title="Remove portfolio item?"
      />
    </div>
  );
}
