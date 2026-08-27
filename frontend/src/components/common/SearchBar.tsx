import { useId, type FormEvent } from "react";
import { classNames } from "../../utils/classNames";
import Icon from "./Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search",
  label = "Search",
  loading = false,
  disabled = false,
  className,
}: SearchBarProps) {
  const generatedId = useId();
  const inputId = `search-${generatedId}`;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch?.(value.trim());
  };

  return (
    <form className={classNames("search-bar", className)} role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={inputId}>{label}</label>
      <Icon className="search-bar__icon" name="search" size={18} />
      <input
        id={inputId}
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {value && !loading && (
        <button className="search-bar__clear" type="button" onClick={() => onChange("")} aria-label="Clear search">
          <Icon name="close" size={16} />
        </button>
      )}
      <button className="search-bar__submit" type="submit" disabled={disabled || loading} aria-label="Submit search">
        {loading ? <span className="button__spinner" aria-hidden="true" /> : <span>Search</span>}
      </button>
    </form>
  );
}
