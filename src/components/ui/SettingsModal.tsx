import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsModalContentProps {
  onClose: () => void;
}

const SettingsModalContent = ({ onClose }: SettingsModalContentProps) => {
  const { slippageTolerance, setSlippageTolerance } = useSettings();
  const [customSlippage, setCustomSlippage] = useState<string>("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInfoOpen(false);
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCloseModal = () => {
    setIsInfoOpen(false);
    onClose();
  };

  const presets = [0.1, 0.5, 1.0];

  const handlePresetClick = (val: number) => {
    setSlippageTolerance(val);
    setCustomSlippage("");
  };

  const matchedPreset =
    customSlippage === "0.1"
      ? 0.1
      : customSlippage === "0.5"
        ? 0.5
        : customSlippage === "1" || customSlippage === "1.0"
          ? 1.0
          : undefined;
  const activePreset = customSlippage === "" ? slippageTolerance : matchedPreset;

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!/^\d*\.?\d*$/.test(val)) {
      return;
    }

    setCustomSlippage(val);

    if (val === "") {
      setSlippageTolerance(0.5);
      return;
    }
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      setSlippageTolerance(parsed);
    }
  };

  const toggleInfo = () => {
    setIsInfoOpen((current) => !current);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={handleCloseModal}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-sm rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {isInfoOpen && (
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-default rounded-xl"
            onClick={() => setIsInfoOpen(false)}
            aria-label="Close slippage explanation"
          />
        )}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white font-semibold">Transaction Settings</h3>
          <button
            type="button"
            onClick={handleCloseModal}
            className="relative z-20 text-gray-400 transition-colors hover:text-white"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center text-sm text-gray-400">
              <span>Slippage tolerance</span>
              <span className="relative z-20 ml-1 inline-flex">
                <button
                  type="button"
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[11px] text-gray-500 transition-colors hover:text-white focus:outline-none focus:text-white"
                  onClick={toggleInfo}
                  aria-label="Explain slippage tolerance"
                  aria-expanded={isInfoOpen}
                >
                  ⓘ
                </button>
                <AnimatePresence>
                  {isInfoOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-1/2 top-6 z-10 w-56 -translate-x-1/2 rounded-lg border border-gray-600 bg-gray-900 p-2 text-xs font-normal leading-relaxed text-gray-200 shadow-xl"
                      onClick={() => setIsInfoOpen(false)}
                    >
                      Your transaction will revert if the price changes
                      unfavorably by more than this percentage.
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
            </div>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    activePreset === preset
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {preset}%
                </motion.button>
              ))}
              <div className="relative flex-[1.5]">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Custom"
                  value={customSlippage}
                  onChange={handleCustomChange}
                  className={`w-full rounded-lg border bg-gray-900 py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500 ${
                    customSlippage && slippageTolerance > 5
                      ? "border-orange-500 text-orange-500"
                      : "border-gray-700 text-white"
                  }`}
                />
                <span className="absolute right-3 top-1.5 text-sm text-gray-400">%</span>
              </div>
            </div>
          </div>

          {slippageTolerance > 5 && (
            <p className="mt-2 text-xs text-orange-500">
              ⚠️ Your transaction may be frontrun
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && <SettingsModalContent onClose={onClose} />}
    </AnimatePresence>
  );
};
