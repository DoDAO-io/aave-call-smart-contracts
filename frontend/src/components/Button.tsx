import React from "react";

export interface ButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
}
export function Button({
  disabled,
  label,
  onClick,
  loading,
  loadingText,
}: ButtonProps) {
  return (
    <button
      className={disabled ? "btn btn-disabled" : "btn btn-blue"}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {loading ? (
        <span>
          <span className="text-gray-300">{loadingText}</span>
          <div
            className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-gray-300 border-t-transparent ml-5"
          />
        </span>
      ) : (
        <span className="text-gray-300">{label}</span>
      )}
    </button>
  );
}
