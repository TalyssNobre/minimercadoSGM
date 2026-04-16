'use client';

import React from 'react';

interface Props {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function InputPesquisa({ placeholder = "Pesquisar produto...", value, onChange, className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      {/* ÍCONE DE LUPA EM SVG PURO */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-gray-400"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] sm:text-sm transition-all shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}