import { useState } from "react";
import type { CreateProjectRequest, UpdateProjectRequest } from "../../types/project";
import { getApiErrorMessage, getApiFieldErrors } from "../../services/api";
import Button from "../common/Button";
import { Input, Textarea } from "../common/FormControls";
import Icon from "../common/Icon";

type ProjectFormProps = {
  initialData?: {
    title?: string;
    description?: string;
    budget?: number;
    requiredSkills?: string | null;
  };
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  submitLabel: string;
  onCancel: () => void;
};

type ProjectField = "title" | "description" | "budget" | "requiredSkills";
type ProjectErrors = Partial<Record<ProjectField, string>>;

const ProjectForm = ({ initialData, onSubmit, submitLabel, onCancel }: ProjectFormProps) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [budget, setBudget] = useState<string>(
    initialData?.budget != null ? String(initialData.budget) : ""
  );
  const [requiredSkills, setRequiredSkills] = useState(initialData?.requiredSkills ?? "");
  const [errors, setErrors] = useState<ProjectErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: ProjectErrors = {};
    const numericBudget = Number(budget);
    if (!title.trim()) e.title = "Title is required";
    else if (title.trim().length > 200) e.title = "Title must not exceed 200 characters";
    if (!description.trim()) e.description = "Description is required";
    else if (description.trim().length > 5000) e.description = "Description must not exceed 5,000 characters";
    if (!budget || !Number.isFinite(numericBudget) || numericBudget <= 0) {
      e.budget = "Budget must be a valid amount greater than 0";
    }
    if (requiredSkills.length > 2000) e.requiredSkills = "Required skills must not exceed 2000 characters";
    return e;
  };

  const clearError = (field: ProjectField) => {
    if (!errors[field]) return;
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        requiredSkills: requiredSkills.trim(),
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "The project could not be saved."));
      setErrors(getApiFieldErrors(error) as ProjectErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="project-form stack stack--lg" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="alert alert--error" role="alert">
          <Icon name="error" size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <Input
        autoComplete="off"
        autoFocus
        error={errors.title}
        label="Project title"
        maxLength={200}
        onChange={(event) => { setTitle(event.target.value); clearError("title"); }}
        placeholder="e.g. Build a responsive customer portal"
        required
        value={title}
      />

      <Textarea
        error={errors.description}
        hint={`${description.length.toLocaleString()} / 5,000 characters`}
        label="Project description"
        maxLength={5000}
        onChange={(event) => { setDescription(event.target.value); clearError("description"); }}
        placeholder="Describe the goals, deliverables, timeline, and what success looks like."
        required
        rows={8}
        value={description}
      />

      <div className="form-grid form-grid--two">
        <Input
          error={errors.budget}
          hint="Enter the total project budget in USD."
          label="Budget"
          min="0.01"
          onChange={(event) => { setBudget(event.target.value); clearError("budget"); }}
          placeholder="2500"
          required
          step="0.01"
          type="number"
          value={budget}
        />

        <Input
          error={errors.requiredSkills}
          hint="Separate skills with commas."
          label="Required skills"
          maxLength={2000}
          onChange={(event) => { setRequiredSkills(event.target.value); clearError("requiredSkills"); }}
          placeholder="React, TypeScript, Spring Boot"
          value={requiredSkills}
        />
      </div>

      <div className="form-actions">
        <Button disabled={submitting} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button loading={submitting} loadingText="Saving project…" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
