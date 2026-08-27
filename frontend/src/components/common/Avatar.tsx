import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { fetchProtectedAsset } from "../../services/api";
import { resolveAssetUrl } from "../../config/env";
import { classNames } from "../../utils/classNames";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  status?: "online" | "offline";
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Avatar({
  src,
  name,
  alt,
  size = "md",
  className,
  status,
}: AvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(src));

  useEffect(() => {
    setFailed(false);
    if (!src) {
      setImageUrl(null);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;
    setLoading(true);

    const load = async () => {
      try {
        if (/^(blob:|data:)/i.test(src)) {
          setImageUrl(src);
        } else if (/^https?:\/\//i.test(src) && new URL(src).origin !== new URL(resolveAssetUrl("/")).origin) {
          setImageUrl(src);
        } else {
          const blob = await fetchProtectedAsset(src, controller.signal);
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFailed(true);
          setImageUrl(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const style = useMemo<CSSProperties | undefined>(
    () => typeof size === "number" ? ({ "--avatar-size": `${size}px` } as CSSProperties) : undefined,
    [size],
  );
  const sizeClass = typeof size === "number" ? "avatar--custom" : `avatar--${size}`;
  const accessibleName = alt ?? (name ? `${name}'s profile photo` : "Profile photo");

  return (
    <span className={classNames("avatar", sizeClass, loading && "avatar--loading", className)} style={style}>
      {imageUrl && !failed ? (
        <img
          className="avatar__image"
          src={imageUrl}
          alt={accessibleName}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="avatar__fallback" role="img" aria-label={accessibleName}>{getInitials(name)}</span>
      )}
      {status && <span className={`avatar__status avatar__status--${status}`} aria-label={status} />}
    </span>
  );
}
