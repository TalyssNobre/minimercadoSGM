"use client";

import React, { useState } from "react";
import Link from "next/link";
// Importamos o nosso novo botão!
import { Button } from "../ui/Button"; 

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Login:", { email, senha });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
      
      {/* Campos E-mail e Senha (mantidos iguais) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-bold text-gray-700">E-mail</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-verde-agua outline-none transition-all" required />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="text-sm font-bold text-gray-700">Senha</label>
        <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-verde-agua outline-none transition-all" required />
      </div>

      {/* Área de Ações */}
      <div className="flex flex-col items-center gap-4 mt-2">
        
        {/* Olha como fica mais limpo usar o nosso componente! */}
        <Button type="submit" isLoading={isLoading}>
          ENTRAR
        </Button>

        <Link href="/esqueci-senha" className="text-sm text-gray-500 hover:text-verde-agua font-medium transition-colors">
          Esqueci minha senha
        </Link>
        
        <Link href="/cadastro" className="text-sm text-dourado hover:text-yellow-600 font-bold uppercase tracking-wider transition-colors mt-2">
          Cadastrar-se
        </Link>
      </div>

    </form>
  );
}