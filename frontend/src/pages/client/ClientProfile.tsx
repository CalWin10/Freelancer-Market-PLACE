import { useEffect, useRef, useState } from "react";
import {
  ClientProfile as CProfile,
  deletePhoto,
  getClientProfile,
  updateClientProfile,
  uploadPhoto,
} from "../../services/userService";

const PHOTO_BASE = "http://localhost:8080";

export default function ClientProfile() {
  const [profile, setProfile] = useState<CProfile>({});
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getClientProfile()
      .then(setProfile)
      .catch(() => setError("Failed to load profile"));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await updateClientProfile(profile);
      setProfile(updated);
      setSuccess("Profile saved successfully");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPEG and PNG files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB");
      return;
    }
    setPhotoUploading(true);
    setError("");
    try {
      const url = await uploadPhoto(file);
      setProfile((p) => ({ ...p, profilePhotoUrl: url }));
      setSuccess("Photo uploaded");
    } catch {
      setError("Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await deletePhoto();
      setProfile((p) => ({ ...p, profilePhotoUrl: undefined }));
      setSuccess("Photo removed");
    } catch {
      setError("Failed to remove photo");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Client Profile</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        {/* Photo */}
        <div style={styles.photoSection}>
          {profile.profilePhotoUrl ? (
            <img
              src={PHOTO_BASE + profile.profilePhotoUrl}
              alt="Profile"
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarPlaceholder}>No Photo</div>
          )}
          <div style={styles.photoActions}>
            <button style={styles.btnSecondary} onClick={() => fileRef.current?.click()}
              disabled={photoUploading}>
              {photoUploading ? "Uploading…" : "Upload Photo"}
            </button>
            {profile.profilePhotoUrl && (
              <button style={styles.btnDanger} onClick={handleDeletePhoto}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} value={profile.fullName ?? ""} disabled />

          <label style={styles.label}>Email</label>
          <input style={styles.input} value={profile.email ?? ""} disabled />

          <label style={styles.label}>Company Name</label>
          <input
            style={styles.input}
            value={profile.companyName ?? ""}
            maxLength={200}
            onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
          />

          <label style={styles.label}>Contact Name</label>
          <input
            style={styles.input}
            value={profile.contactName ?? ""}
            maxLength={200}
            onChange={(e) => setProfile((p) => ({ ...p, contactName: e.target.value }))}
          />

          <label style={styles.label}>Bio</label>
          <textarea
            style={styles.textarea}
            value={profile.bio ?? ""}
            maxLength={2000}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          />

          <button type="submit" style={styles.btnPrimary} disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "2rem",
    width: "100%",
    maxWidth: 600,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    height: "fit-content",
  },
  heading: { marginBottom: "1.5rem", fontSize: "1.5rem", color: "#1a1a2e" },
  error: { color: "#e53e3e", marginBottom: "1rem" },
  success: { color: "#38a169", marginBottom: "1rem" },
  photoSection: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  avatar: { width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: "50%", background: "#e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.75rem", color: "#718096",
  },
  photoActions: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  form: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontWeight: 600, fontSize: "0.875rem", color: "#4a5568", marginTop: "0.75rem" },
  input: {
    padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: "0.95rem", marginBottom: "0.25rem", width: "100%", boxSizing: "border-box",
  },
  textarea: {
    padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: "0.95rem", minHeight: 100, resize: "vertical", width: "100%", boxSizing: "border-box",
  },
  btnPrimary: {
    marginTop: "1.5rem", padding: "0.75rem", background: "#4f46e5", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "1rem",
  },
  btnSecondary: {
    padding: "0.5rem 1rem", background: "#edf2f7", color: "#4a5568",
    border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500,
  },
  btnDanger: {
    padding: "0.5rem 1rem", background: "#fff5f5", color: "#e53e3e",
    border: "1px solid #fed7d7", borderRadius: 8, cursor: "pointer", fontWeight: 500,
  },
};
