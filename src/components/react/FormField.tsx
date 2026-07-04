import { cn } from "../../lib/utils";

interface Props {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  error,
  placeholder,
  onChange,
}: Props) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20",
          error ? "border-red-400" : "border-ink/15",
        )}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
