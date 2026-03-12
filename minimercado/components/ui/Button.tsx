import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  isLoading, 
  children, 
  className = "", 
  ...props 
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={`w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? "Aguarde..." : children}
    </button>
  );
}