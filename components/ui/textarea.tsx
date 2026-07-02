import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:ring-ring focus:ring-offset-background flex min-h-20 w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
