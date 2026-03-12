import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface StatBoxProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

/**
 * StatBox component for displaying statistics
 */
export const StatBox = forwardRef<HTMLDivElement, StatBoxProps>(
  ({ className, label, value, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-gray-700",
      success: "border-green-700",
      warning: "border-yellow-700",
      danger: "border-red-700",
    };

    const valueVariantStyles = {
      default: "text-white",
      success: "text-green-400",
      warning: "text-yellow-400",
      danger: "text-red-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-gray-900/50 p-4 rounded-lg border",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p
          className={cn(
            "text-xl font-mono",
            valueVariantStyles[variant],
            typeof value === "string" && value.length > 10 && "text-sm",
          )}
        >
          {value}
        </p>
      </div>
    );
  },
);

StatBox.displayName = "StatBox";
