import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

/**
 * Reusable Input component with label, error, and slot elements
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, rightElement, leftElement, ...props }, ref) => {
    return (
      <div className="w-full min-w-0">
        {label && (
          <label className="block text-sm text-gray-400 mb-2">{label}</label>
        )}
        <div
          className={cn(
            "flex items-center bg-gray-900 rounded-lg border border-gray-700 focus-within:border-blue-500 transition-colors min-w-0",
            error && "border-red-500",
          )}
        >
          {leftElement && (
            <div className="pl-3 flex items-center shrink-0">{leftElement}</div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex-1 min-w-0 bg-transparent text-white px-3 py-2.5 outline-none placeholder:text-gray-600",
              leftElement && "pl-2",
              rightElement && "pr-2",
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="pr-3 flex items-center shrink-0">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
