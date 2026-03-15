import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/providers/SettingsProvider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { slippageTolerance, setSlippageTolerance } = useSettings();
  const [customSlippage, setCustomSlippage] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presets = [0.1, 0.5, 1.0];

  const handlePresetClick = (val: number) => {
    setSlippageTolerance(val);
    setCustomSlippage("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomSlippage(val);
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      setSlippageTolerance(parsed);
    }
  };

  return (
    <div className="absolute top-12 right-0 z-50 mt-2 w-72 rounded-xl bg-gray-800 border border-gray-700 shadow-2xl p-4">
      <div className="flex justify-between items-center mb-4" ref={modalRef}>
        <h3 className="text-white font-semibold">Transaction Settings</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-400 flex items-center mb-2">
            Slippage tolerance
            <span 
              className="ml-1 text-gray-500 cursor-help" 
              title="Your transaction will revert if the price changes unfavorably by more than this percentage."
            >
              ⓘ
            </span>
          </label>
          <div className="flex gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-sm font-medium transition-colors ${
                  slippageTolerance === preset && customSlippage === ""
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {preset}%
              </button>
            ))}
            <div className="relative flex-[1.5]">
              <input
                type="number"
                placeholder="Custom"
                value={customSlippage}
                onChange={handleCustomChange}
                className={`w-full bg-gray-900 border ${
                  customSlippage && slippageTolerance > 5
                    ? "border-orange-500 text-orange-500"
                    : "border-gray-700 text-white"
                } rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500`}
                step="0.1"
                min="0.1"
                max="50"
              />
              <span className="absolute right-3 top-1.5 text-gray-400 text-sm">%</span>
            </div>
          </div>
        </div>
        
        {slippageTolerance > 5 && (
          <p className="text-orange-500 text-xs mt-2">
            ⚠️ Your transaction may be frontrun
          </p>
        )}
      </div>
    </div>
  );
};
