import React from "react";

interface ButtonSistemaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  children: React.ReactNode;
}

export function ButtonSistema({ 
  isLoading, 
  variant = 'primary',
  children, 
  className = "", 
  ...props 
}: ButtonSistemaProps) {
  
  // Classes base: Tamanho menor, bordas arredondadas normais, texto uppercase
  const baseClasses = "px-6 py-2.5 text-sm font-bold uppercase tracking-wide rounded-md transition-colors shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#0D9488] text-white hover:bg-[#0F766E]",
    outline: "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 shadow-none",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      disabled={isLoading || props.disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "Aguarde..." : children}
    </button>
  );
}