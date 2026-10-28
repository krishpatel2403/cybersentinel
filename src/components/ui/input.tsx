import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-lg border bg-slate-950/50 text-sm text-slate-100 shadow-inner shadow-black/20 transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-10 border-white/10 px-3", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldBase, "min-h-28 border-white/10 px-3 py-2.5 leading-6", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(fieldBase, "h-10 appearance-none border-white/10 px-3 pr-9", className)}
      {...props}
    >
      {children}
    </select>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function Field({ label, htmlFor, children, error, hint, required, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-xs font-medium text-slate-300"
      >
        {label}
        {required ? (
          <span className="text-cyan-300" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] leading-4 text-slate-500">{hint}</p> : null}
      {error ? (
        <p className="text-[11px] leading-4 text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200"
    >
      {message}
    </div>
  );
}
