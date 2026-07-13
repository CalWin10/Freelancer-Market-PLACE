import { useState } from "react";
import { CreateProjectRequest, UpdateProjectRequest } from "../../types/project";

type ProjectFormProps = {
  initialData?: Partial<CreateProjectRequest | UpdateProjectRequest>;
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => void;
  buttonText: string;
};

const ProjectForm = ({ initialData, onSubmit, buttonText }: ProjectFormProps) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [budget, setBudget] = useState<string>(
    initialData?.budget != null ? String(initialData.budget) : ""
  );
  const [requiredSkills, setRequiredSkills] = useState(initialData?.requiredSkills ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    else if (title.length > 200) e.title = "Title must not exceed 200 characters";
    if (!description.trim()) e.description = "Description is required";
    if (!budget || Number(budget) <= 0) e.budget = "Budget must be greater than 0";
    if (requiredSkills.length > 2000) e.requiredSkills = "Required skills must not exceed 2000 characters";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    onSubmit({ title, description, budget: Number(budget), requiredSkills });
  };

  const field = (label: string, key: string, el: React.ReactNode) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label}</label>
      {el}
      {errors[key] && <span style={{ color: "#e53e3e", fontSize: "0.8rem" }}>{errors[key]}</span>}
    </div>
  );

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.75rem", borderRadius: 8,
    border: "1px solid #e2e8f0", fontSize: "0.95rem", width: "100%", boxSizing: "border-box",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 700, margin: "30px auto", display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h2 style={{ marginBottom: 8 }}>{buttonText}</h2>

      {field("Project Title *", "title",
        <input style={inputStyle} value={title} placeholder="Project Title"
          onChange={(e) => setTitle(e.target.value)} />
      )}

      {field("Description *", "description",
        <textarea rows={6} style={{ ...inputStyle, resize: "vertical" }} value={description}
          placeholder="Project Description" onChange={(e) => setDescription(e.target.value)} />
      )}

      {field("Budget ($) *", "budget",
        <input style={inputStyle} type="number" min="0.01" step="0.01" value={budget}
          placeholder="Budget" onChange={(e) => setBudget(e.target.value)} />
      )}

      {field("Required Skills", "requiredSkills",
        <input style={inputStyle} value={requiredSkills}
          placeholder="e.g. React, Java, MySQL (comma separated)"
          onChange={(e) => setRequiredSkills(e.target.value)} />
      )}

      <button
        type="submit"
        style={{
          padding: "0.75rem", background: "#4f46e5", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "1rem",
        }}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default ProjectForm;
