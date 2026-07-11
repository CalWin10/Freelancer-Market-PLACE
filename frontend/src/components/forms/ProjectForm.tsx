import { useState } from "react";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../../types/project";

type ProjectFormProps = {
  initialData?: CreateProjectRequest | UpdateProjectRequest;
  onSubmit: (
    data: CreateProjectRequest | UpdateProjectRequest
  ) => void;
  buttonText: string;
};

const ProjectForm = ({
  initialData,
  onSubmit,
  buttonText,
}: ProjectFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [budget, setBudget] = useState(initialData?.budget || 0);
  const [requiredSkills, setRequiredSkills] = useState(
    initialData?.requiredSkills || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      budget <= 0 ||
      !requiredSkills.trim()
    ) {
      alert("Please fill all fields correctly.");
      return;
    }

    onSubmit({
      title,
      description,
      budget,
      requiredSkills,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>{buttonText}</h2>

      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        rows={6}
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="number"
        placeholder="Budget"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
      />

      <input
        type="text"
        placeholder="Required Skills (Comma Separated)"
        value={requiredSkills}
        onChange={(e) => setRequiredSkills(e.target.value)}
      />

      <button type="submit">{buttonText}</button>
    </form>
  );
};

export default ProjectForm;