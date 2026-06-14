import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-[2px] bg-base-2 border border-hair px-4 text-fg placeholder:text-faint " +
  "transition-colors focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-lost">{message}</p>;
}

export function Field({
  label,
  error,
  htmlFor,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={htmlFor}>{label}</Label>
          {hint}
        </div>
      )}
      {children}
      <FieldError message={error} />
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseField, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseField, "min-h-24 py-3 resize-none", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(baseField, "h-11 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a97a8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
