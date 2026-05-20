import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TokenSelectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  symbol: string;
  isActive?: boolean;
}

/**
 * Token selection button for swap interface
 */
export const TokenSelectButton = ({
  symbol,
  isActive = false,
  className,
  ...props
}: TokenSelectButtonProps) => {
  return (
    <button
      className={cn(
        "shrink-0 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {symbol}
    </button>
  );
};
